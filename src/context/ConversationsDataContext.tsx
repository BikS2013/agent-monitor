import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Message,
  Conversation,
} from '../data/types';

import { useConversationsRepositories } from './ConversationsRepositoryContext';
import { QueryOptions } from '../data/repositories/interfaces/IRepository';

/**
 * Dedicated data context for the Conversations page
 * Uses the Conversations repositories instead of the standard repositories
 */

interface ConversationsDataContextType {
  // State data
  messages: Record<string, Message>;
  conversations: Record<string, Conversation>;

  // Loading states
  loading: {
    messages: boolean;
    conversations: boolean;
  };

  // Data access methods
  getMessagesByConversationId: (conversationId: string) => Promise<Message[]>;
  
  // Refresh methods
  refreshData: () => Promise<void>;
}

const ConversationsDataContext = createContext<ConversationsDataContextType | undefined>(undefined);

export const ConversationsDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use repositories from ConversationsRepositoryContext
  const {
    initialized,
    messageRepository,
    conversationRepository,
  } = useConversationsRepositories();

  // State for entity data
  const [messages, setMessages] = useState<Record<string, Message>>({});
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});

  // Loading states
  const [loading, setLoading] = useState({
    messages: false,
    conversations: false,
  });

  // Load essential data on initialization
  useEffect(() => {
    if (initialized) {
      console.log("ConversationsDataContext: Repositories initialized, loading initial data");
      loadInitialData();
    } else {
      console.log("ConversationsDataContext: Waiting for repositories to initialize");
    }
  }, [initialized]);

  // Debug: Log data state changes
  useEffect(() => {
    console.log("ConversationsDataContext: Conversations state updated", {
      count: Object.keys(conversations).length,
      ids: Object.keys(conversations)
    });
  }, [conversations]);

  /**
   * Load initial data - only metadata, not full entities
   * This gives the UI something to display quickly
   */
  const loadInitialData = async () => {
    try {
      console.log("ConversationsDataContext: Starting to load initial data");

      // Load conversations (without messages)
      console.log("ConversationsDataContext: Loading conversations...");
      setLoading(prev => ({ ...prev, conversations: true }));
      const conversationsResult = await conversationRepository!.getAll();
      console.log(`ConversationsDataContext: Received ${conversationsResult.data.length} conversations`);

      if (conversationsResult.data.length === 0) {
        console.warn("ConversationsDataContext: No conversations found in repository");
      }

      const conversationsRecord = conversationsResult.data.reduce((record, conversation) => {
        // Ensure conclusion is one of the valid options
        if (conversation.conclusion !== 'successful' && conversation.conclusion !== 'unsuccessful') {
          conversation.conclusion = 'uncertain';
        }

        record[conversation.thread_id] = conversation;
        return record;
      }, {} as Record<string, Conversation>);

      console.log(`ConversationsDataContext: Processed ${Object.keys(conversationsRecord).length} conversations`);
      setConversations(conversationsRecord);
      setLoading(prev => ({ ...prev, conversations: false }));
    } catch (error) {
      console.error('Failed to load initial data:', error);
      // Reset loading states
      setLoading({
        messages: false,
        conversations: false,
      });
    }
  };

  // Store the last loaded conversation ID and timestamp to prevent excessive loading
  const [lastConversationMessageLoad, setLastConversationMessageLoad] = useState<{
    id: string,
    timestamp: number
  } | null>(null);

  /**
   * Get messages for a conversation (lazy loading) with improved stability
   * Enhanced request cancellation, caching, and loading state management
   */
  const getMessagesByConversationId = async (conversationId: string): Promise<Message[]> => {
    if (!initialized || !messageRepository || !conversationRepository) {
      console.warn(`ConversationsDataContext: Repositories not initialized, cannot load messages for ${conversationId}`);
      return [];
    }

    // Get the conversation object first
    const conversation = conversations[conversationId];
    if (!conversation) {
      console.warn(`ConversationsDataContext: Conversation ${conversationId} not found in local state`);
      return [];
    }

    // Check if we have any cached messages for this conversation
    const cachedMessages = conversation.messages
      .filter(msgId => messages[msgId]) // Only include messages we already have
      .map(msgId => messages[msgId])
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // If we have all messages cached and there's at least one, return them immediately
    const hasAllCachedMessages =
      cachedMessages.length === conversation.messages.length &&
      cachedMessages.length > 0;

    if (hasAllCachedMessages) {
      console.log(`ConversationsDataContext: Using ${cachedMessages.length} cached messages for conversation ${conversationId}`);
      return cachedMessages;
    }

    // Implement strict throttling for message loading (max once per second per conversation)
    // Return cached messages (even if incomplete) during throttling period
    if (lastConversationMessageLoad &&
        lastConversationMessageLoad.id === conversationId &&
        Date.now() - lastConversationMessageLoad.timestamp < 1000) {
      console.log(`ConversationsDataContext: Throttling message load for ${conversationId}, last load was ${Date.now() - lastConversationMessageLoad.timestamp}ms ago`);

      // If we have any cached messages, return them during throttling
      if (cachedMessages.length > 0) {
        return cachedMessages;
      }
    }

    // Generate a unique ID for this request to track cancellations
    const requestId = Date.now();

    // Use a ref to track the latest request (instead of window global)
    const currentLatestRequestId = (window as any)._latestConversationsMessageRequest || 0;
    if (requestId <= currentLatestRequestId) {
      console.log(`ConversationsDataContext: Request ${requestId} is not newer than current latest ${currentLatestRequestId}, using cached data`);
      return cachedMessages.length > 0 ? cachedMessages : [];
    }

    // Set this as the latest request
    (window as any)._latestConversationsMessageRequest = requestId;

    // Update the last load timestamp atomically
    setLastConversationMessageLoad({
      id: conversationId,
      timestamp: Date.now()
    });

    // Use ref to track if this request was canceled
    let wasRequestCanceled = false;

    try {
      console.log(`ConversationsDataContext: Loading messages for conversation ${conversationId} (request ${requestId})`);

      // Set loading state
      setLoading(prev => ({ ...prev, messages: true }));

      // Return any partial cached results if this request is canceled before repository call
      if ((window as any)._latestConversationsMessageRequest !== requestId) {
        wasRequestCanceled = true;
        console.log(`ConversationsDataContext: Request ${requestId} was superseded before repository call`);
        return cachedMessages.length > 0 ? cachedMessages : [];
      }

      // Get new messages from the repository
      console.log(`ConversationsDataContext: Fetching messages for conversation ${conversationId} from repository`);
      const messagesResult = await conversationRepository.getMessages(conversationId);

      // Verify if this request is still the latest after repository call
      if ((window as any)._latestConversationsMessageRequest !== requestId) {
        wasRequestCanceled = true;
        console.log(`ConversationsDataContext: Request ${requestId} was superseded during repository call`);
        return cachedMessages.length > 0 ? cachedMessages : messagesResult.data;
      }

      console.log(`ConversationsDataContext: Received ${messagesResult.data.length} messages for request ${requestId}`);

      // Use functional update to atomically update the messages state
      setMessages(prevMessages => {
        const merged = { ...prevMessages };
        messagesResult.data.forEach(message => {
          merged[message.id] = message;
        });
        return merged;
      });

      // Clean up loading state if this is still the latest request
      if ((window as any)._latestConversationsMessageRequest === requestId) {
        setLoading(prev => ({ ...prev, messages: false }));
      }

      return messagesResult.data;
    } catch (error) {
      console.error(`Failed to get messages for conversation ${conversationId} (request ${requestId}):`, error);

      // Only update loading state if this was the latest request
      if ((window as any)._latestConversationsMessageRequest === requestId) {
        setLoading(prev => ({ ...prev, messages: false }));
      }

      // Return any cached messages on error
      return cachedMessages.length > 0 ? cachedMessages : [];
    } finally {
      // Always check if we need to update the loading state
      if (wasRequestCanceled) {
        console.log(`ConversationsDataContext: Cleaning up canceled request ${requestId}`);
      }
    }
  };

  /**
   * Refresh all data
   */
  const refreshData = async (): Promise<void> => {
    if (!initialized) {
      return;
    }

    await loadInitialData();
  };

  const value: ConversationsDataContextType = {
    // State data
    messages,
    conversations,

    // Loading states
    loading,

    // Data access methods
    getMessagesByConversationId,

    // Refresh methods
    refreshData,
  };

  return <ConversationsDataContext.Provider value={value}>{children}</ConversationsDataContext.Provider>;
};

export const useConversationsData = (): ConversationsDataContextType => {
  const context = useContext(ConversationsDataContext);
  if (context === undefined) {
    throw new Error('useConversationsData must be used within a ConversationsDataProvider');
  }
  return context;
};
