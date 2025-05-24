import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Message,
  Conversation,
  Collection,
  Group,
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
  collections: Record<string, Collection>;

  // Loading states
  loading: {
    messages: boolean;
    conversations: boolean;
    collections: boolean;
  };

  // Data access methods
  getMessagesByConversationId: (thread_id: string) => Promise<Message[]>;
  getConversationsByCollectionId: (collectionId: string, options?: QueryOptions) => Promise<Conversation[]>;
  
  // Data creation methods
  addCollection: (collectionData: Omit<Collection, 'id'> & { id?: string }) => Promise<Collection>;
  
  // Data modification methods
  updateCollection: (collectionId: string, collectionData: Partial<Collection>) => Promise<Collection>;
  deleteCollection: (collectionId: string) => Promise<boolean>;
  
  // Refresh methods
  refreshData: () => Promise<void>;
  refreshCollection: (collectionId: string) => Promise<void>;
}

export const ConversationsDataContext = createContext<ConversationsDataContextType | undefined>(undefined);

export const ConversationsDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use repositories from ConversationsRepositoryContext
  const {
    initialized,
    messageRepository,
    conversationRepository,
    collectionRepository,
    groupRepository,
  } = useConversationsRepositories();

  // State for entity data
  const [messages, setMessages] = useState<Record<string, Message>>({});
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  const [collections, setCollections] = useState<Record<string, Collection>>({});

  // Loading states
  const [loading, setLoading] = useState({
    messages: false,
    conversations: false,
    collections: false,
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

  useEffect(() => {
    console.log("ConversationsDataContext: Collections state updated", {
      count: Object.keys(collections).length,
      ids: Object.keys(collections),
      collections: Object.values(collections).map(c => ({ id: c.id, name: c.name }))
    });
  }, [collections]);

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

        // Always ensure thread_id is available
        if (!conversation.thread_id) {
          console.warn('ConversationsDataContext: Conversation missing thread_id, generating one');
          conversation.thread_id = `thread_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        }

        record[conversation.thread_id] = conversation;
        return record;
      }, {} as Record<string, Conversation>);

      console.log(`ConversationsDataContext: Processed ${Object.keys(conversationsRecord).length} conversations`);
      setConversations(conversationsRecord);
      setLoading(prev => ({ ...prev, conversations: false }));

      // Load collections
      if (collectionRepository) {
        console.log("ConversationsDataContext: Loading collections from Conversations API...");
        setLoading(prev => ({ ...prev, collections: true }));
        const collectionsResult = await collectionRepository.getAll();
        console.log(`ConversationsDataContext: Received ${collectionsResult.data.length} collections from Conversations API`);

        if (collectionsResult.data.length === 0) {
          console.warn("ConversationsDataContext: No collections found in Conversations API repository");
        }

        const collectionsRecord = collectionsResult.data.reduce((record, collection) => {
          record[collection.id] = collection;
          return record;
        }, {} as Record<string, Collection>);

        console.log(`ConversationsDataContext: Processed ${Object.keys(collectionsRecord).length} collections from Conversations API`);
        setCollections(collectionsRecord);
        setLoading(prev => ({ ...prev, collections: false }));
      } else {
        console.warn("ConversationsDataContext: No collection repository available");
      }

    } catch (error) {
      console.error('Failed to load initial data:', error);
      // Reset loading states
      setLoading({
        messages: false,
        conversations: false,
        collections: false,
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
  const getMessagesByConversationId = async (thread_id: string): Promise<Message[]> => {
    if (!initialized || !messageRepository || !conversationRepository) {
      console.warn(`ConversationsDataContext: Repositories not initialized, cannot load messages for ${thread_id}`);
      return [];
    }

    // Get the conversation object first
    const conversation = conversations[thread_id];
    if (!conversation) {
      console.warn(`ConversationsDataContext: Conversation with thread_id ${thread_id} not found in local state`);
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
      console.log(`ConversationsDataContext: Using ${cachedMessages.length} cached messages for conversation ${thread_id}`);
      return cachedMessages;
    }

    // Create a request tracker for this specific thread ID if it doesn't exist
    if (!(window as any)._conversationsMessageRequests) {
      (window as any)._conversationsMessageRequests = {};
    }
    
    // Implement strict throttling for message loading (max once per second per conversation)
    // Return cached messages (even if incomplete) during throttling period
    if (lastConversationMessageLoad &&
        lastConversationMessageLoad.id === thread_id &&
        Date.now() - lastConversationMessageLoad.timestamp < 1000) {
      console.log(`ConversationsDataContext: Throttling message load for thread_id ${thread_id}, last load was ${Date.now() - lastConversationMessageLoad.timestamp}ms ago`);

      // If we have any cached messages, return them during throttling
      if (cachedMessages.length > 0) {
        return cachedMessages;
      }
    }

    // Generate a unique ID for this request to track cancellations
    const requestId = Date.now();

    // Use thread-specific request tracking to avoid race conditions between different conversations
    const currentLatestRequestId = (window as any)._conversationsMessageRequests[thread_id] || 0;
    if (requestId <= currentLatestRequestId) {
      console.log(`ConversationsDataContext: Request ${requestId} for thread ${thread_id} is not newer than current latest ${currentLatestRequestId}, using cached data`);
      return cachedMessages.length > 0 ? cachedMessages : [];
    }

    // Set this as the latest request for this specific thread ID
    (window as any)._conversationsMessageRequests[thread_id] = requestId;

    // Update the last load timestamp atomically
    setLastConversationMessageLoad({
      id: thread_id,
      timestamp: Date.now()
    });

    // Use ref to track if this request was canceled
    let wasRequestCanceled = false;

    try {
      console.log(`ConversationsDataContext: Loading messages for conversation thread_id ${thread_id} (request ${requestId})`);

      // Set loading state
      setLoading(prev => ({ ...prev, messages: true }));

      // Return any partial cached results if this request is canceled before repository call
      if ((window as any)._conversationsMessageRequests[thread_id] !== requestId) {
        wasRequestCanceled = true;
        console.log(`ConversationsDataContext: Request ${requestId} for thread ${thread_id} was superseded before repository call`);
        return cachedMessages.length > 0 ? cachedMessages : [];
      }

      // Get new messages from the repository
      console.log(`ConversationsDataContext: Fetching messages for conversation thread_id ${thread_id} from repository`);
      const messagesResult = await conversationRepository.getMessages(thread_id);

      // Verify if this request is still the latest after repository call
      if ((window as any)._conversationsMessageRequests[thread_id] !== requestId) {
        wasRequestCanceled = true;
        console.log(`ConversationsDataContext: Request ${requestId} for thread ${thread_id} was superseded during repository call`);
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
      if ((window as any)._conversationsMessageRequests[thread_id] === requestId) {
        setLoading(prev => ({ ...prev, messages: false }));
      }

      return messagesResult.data;
    } catch (error) {
      console.error(`Failed to get messages for conversation thread_id ${thread_id} (request ${requestId}):`, error);

      // Only update loading state if this was the latest request
      if ((window as any)._conversationsMessageRequests[thread_id] === requestId) {
        setLoading(prev => ({ ...prev, messages: false }));
      }

      // Return any cached messages on error
      return cachedMessages.length > 0 ? cachedMessages : [];
    } finally {
      // Always check if we need to update the loading state
      if (wasRequestCanceled) {
        console.log(`ConversationsDataContext: Cleaning up canceled request ${requestId} for thread ${thread_id}`);
      }
    }
  };

  /**
   * Get conversations for a collection
   */
  const getConversationsByCollectionId = async (
    collectionId: string,
    options?: QueryOptions
  ): Promise<Conversation[]> => {
    if (!initialized || !collectionRepository) {
      return [];
    }

    try {
      setLoading(prev => ({ ...prev, conversations: true }));

      // Check if collection exists
      const collection = collections[collectionId];
      if (!collection) {
        const collectionResult = await collectionRepository.getById(collectionId);
        if (!collectionResult) {
          return [];
        }
        // Update collections state with the fetched collection
        setCollections(prev => ({
          ...prev,
          [collectionResult.id]: collectionResult
        }));
      }

      // Get conversations for the collection
      const conversationsResult = await collectionRepository.getConversations(collectionId, options);

      // Update conversations state with new conversations
      const newConversations = { ...conversations };
      conversationsResult.data.forEach(conversation => {
        // Ensure conclusion is one of the valid options
        if (conversation.conclusion !== 'successful' && conversation.conclusion !== 'unsuccessful') {
          conversation.conclusion = 'uncertain';
        }

        newConversations[conversation.thread_id] = conversation;
      });
      setConversations(newConversations);

      setLoading(prev => ({ ...prev, conversations: false }));
      return conversationsResult.data;
    } catch (error) {
      console.error(`Failed to get conversations for collection ${collectionId}:`, error);
      setLoading(prev => ({ ...prev, conversations: false }));
      return [];
    }
  };

  /**
   * Add a new collection
   */
  const addCollection = async (
    collectionData: Omit<Collection, 'id'> & { id?: string }
  ): Promise<Collection> => {
    if (!initialized || !collectionRepository) {
      throw new Error('Collection repository not initialized');
    }

    try {
      // Create the collection
      const collection = await collectionRepository.create(collectionData);

      // Update collections state
      setCollections(prev => ({
        ...prev,
        [collection.id]: collection
      }));

      return collection;
    } catch (error) {
      console.error('Failed to create collection:', error);
      throw error;
    }
  };

  /**
   * Delete a collection
   */
  const deleteCollection = async (collectionId: string): Promise<boolean> => {
    if (!initialized || !collectionRepository) {
      throw new Error('Collection repository not initialized');
    }

    try {
      // Delete the collection
      const success = await collectionRepository.delete(collectionId);

      if (success) {
        // Remove from collections state
        setCollections(prev => {
          const updated = { ...prev };
          delete updated[collectionId];
          return updated;
        });
      }

      return success;
    } catch (error) {
      console.error('Failed to delete collection:', error);
      throw error;
    }
  };

  /**
   * Update a collection
   */
  const updateCollection = async (
    collectionId: string,
    collectionData: Partial<Collection>
  ): Promise<Collection> => {
    if (!initialized || !collectionRepository) {
      throw new Error('Collection repository not initialized');
    }

    try {
      // Update the collection
      const updatedCollection = await collectionRepository.update(collectionId, collectionData);
      
      if (!updatedCollection) {
        throw new Error('Failed to update collection');
      }

      // Update collections state
      setCollections(prev => ({
        ...prev,
        [updatedCollection.id]: updatedCollection
      }));

      return updatedCollection;
    } catch (error) {
      console.error('Failed to update collection:', error);
      throw error;
    }
  };

  /**
   * Refresh a specific collection
   */
  const refreshCollection = async (collectionId: string): Promise<void> => {
    if (!initialized || !collectionRepository) {
      return;
    }

    try {
      // Refresh the collection data
      const collection = await collectionRepository.getById(collectionId);
      if (collection) {
        setCollections(prev => ({
          ...prev,
          [collection.id]: collection
        }));
      }

      // Refresh conversations for this collection
      await getConversationsByCollectionId(collectionId);
    } catch (error) {
      console.error(`Failed to refresh collection ${collectionId}:`, error);
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
    collections,

    // Loading states
    loading,

    // Data access methods
    getMessagesByConversationId,
    getConversationsByCollectionId,

    // Data creation methods
    addCollection,

    // Data modification methods
    updateCollection,
    deleteCollection,

    // Refresh methods
    refreshData,
    refreshCollection,
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
