import React, { useState, useEffect, useMemo } from 'react';
import { MessageCircle } from 'lucide-react';
import ConversationsList from '../components/ConversationsList';
import ConversationDetail from '../components/ConversationDetail';
import { useData } from '../context/DataContext';
import { Conversation, Message } from '../data/types';

interface ConversationsViewProps {
  selectedConversation?: Conversation | null;
  setSelectedConversation?: (conversation: Conversation | null) => void;
}

const ConversationsView: React.FC<ConversationsViewProps> = ({
  selectedConversation: propSelectedConversation,
  setSelectedConversation: propSetSelectedConversation
}) => {
  const { conversations, getMessagesByConversationId, loading } = useData();
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  // Debug: Log conversations data
  useEffect(() => {
    console.log('ConversationsView: Conversations data', {
      count: Object.keys(conversations).length,
      ids: Object.keys(conversations),
      loading: loading.conversations
    });
  }, [conversations, loading.conversations]);

  // Use the props if provided, otherwise use local state from context
  const [localSelectedConversation, setLocalSelectedConversation] = useState<Conversation | null>(null);
  
  // Use either the prop or local state
  const selectedConversation = propSelectedConversation !== undefined ? propSelectedConversation : localSelectedConversation;
  const setSelectedConversation = propSetSelectedConversation || setLocalSelectedConversation;

  // Only auto-select the first conversation if there's no selected conversation
  // This preserves the selection when navigating from Collections view
  useEffect(() => {
    // Only auto-select if we have conversations and no selection yet
    if (!selectedConversation && Object.values(conversations).length > 0 && !loading.conversations) {
      setSelectedConversation(Object.values(conversations)[0]);
    }
  }, [conversations, selectedConversation, setSelectedConversation, loading.conversations]);

  // Load messages when selected conversation changes - Improved stability
  useEffect(() => {
    // Reference ID to manage this effect's lifecycle
    const effectId = Date.now();
    
    // Store if this effect is still active or has been cleaned up
    let isActive = true;

    // Improved message loading function with better state management
    const loadMessages = async () => {
      if (!selectedConversation) {
        if (isActive) {
          setConversationMessages([]);
        }
        return;
      }

      // Reference the ID to avoid closure issues when using the conversation later
      const conversationId = selectedConversation.id;
  
      try {
        if (isActive) {
          setLoadingMessages(true);
          setMessageError(null);
        }
        
        console.log(`ConversationsView: Loading messages for conversation ${conversationId}, effect #${effectId}`);
        
        // Small artificial delay to ensure UI responsiveness
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Only continue if this effect is still active
        if (!isActive) {
          console.log(`ConversationsView: Effect #${effectId} no longer active, aborting message load`);
          return;
        }

        // Get messages using the improved function in DataContext
        const messages = await getMessagesByConversationId(conversationId);
        
        // Only update state if this effect is still active and conversation hasn't changed
        if (isActive && selectedConversation && selectedConversation.id === conversationId) {
          setConversationMessages(messages);
          setLoadingMessages(false);
          console.log(`ConversationsView: Loaded ${messages.length} messages for conversation ${conversationId}`);
        }
      } catch (error) {
        console.error(`Error loading messages for effect #${effectId}:`, error);
        
        // Only update error state if this effect is still active
        if (isActive && selectedConversation && selectedConversation.id === conversationId) {
          setMessageError('Failed to load messages');
          setConversationMessages([]);
          setLoadingMessages(false);
        }
      }
    };

    // Execute the message loading
    loadMessages();
    
    // Cleanup function to prevent state updates after component unmount
    return () => {
      console.log(`ConversationsView: Cleaning up message loading effect #${effectId}`);
      isActive = false;
    };
  }, [selectedConversation, getMessagesByConversationId]);

  return (
    <div className="flex flex-1 bg-gray-50">
      <ConversationsList
        conversations={conversations}
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
      />

      {selectedConversation ? (
        <ConversationDetail
          conversation={selectedConversation}
          messages={conversationMessages}
          loading={loadingMessages}
          error={messageError}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose a conversation to view messages and AI analysis</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationsView;
