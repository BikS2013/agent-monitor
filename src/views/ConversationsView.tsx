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

  // Load messages when selected conversation changes
  useEffect(() => {
    // Reference flag to prevent race conditions
    let isMounted = true;
    
    // Debounced message loading function to prevent UI hanging
    const loadMessages = async () => {
      if (!selectedConversation) {
        setConversationMessages([]);
        return;
      }

      // Store the conversation ID to avoid referencing a potentially stale object
      const conversationId = selectedConversation.id;

      try {
        // Only update state if the component is still mounted
        if (isMounted) {
          setLoadingMessages(true);
          setMessageError(null);
        }
        
        console.log(`ConversationsView: Loading messages for conversation ${conversationId}`);
        
        // Fetch messages with a small delay to allow UI to update first
        const messages = await new Promise<Message[]>((resolve) => {
          // Use a small timeout to ensure the UI doesn't hang
          const timeoutId = setTimeout(async () => {
            try {
              // Check if component is still mounted and selectedConversation hasn't changed
              if (isMounted && selectedConversation && selectedConversation.id === conversationId) {
                const result = await getMessagesByConversationId(conversationId);
                resolve(result);
              } else {
                // If not mounted or conversation changed, return empty array
                resolve([]);
              }
            } catch (error) {
              console.error('Error in delayed message loading:', error);
              resolve([]);
            }
          }, 100); // Use a slightly longer delay (100ms) for better UI responsiveness
          
          // Clean up the timeout if the component unmounts or effect re-runs
          return () => clearTimeout(timeoutId);
        });
        
        // Only update state if the component is still mounted and the conversation is still selected
        if (isMounted && selectedConversation && selectedConversation.id === conversationId) {
          setConversationMessages(messages);
          console.log(`ConversationsView: Loaded ${messages.length} messages for conversation ${conversationId}`);
          setLoadingMessages(false);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        // Only update state if the component is still mounted
        if (isMounted) {
          setMessageError('Failed to load messages');
          setConversationMessages([]);
          setLoadingMessages(false);
        }
      }
    };

    // Run message loading
    loadMessages();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
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
