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

  // Disable message loading for testing UI stability
  useEffect(() => {
    // Just set placeholder messages instead of loading them
    if (selectedConversation) {
      console.log(`ConversationsView: Message loading disabled for testing, using placeholders`);
      
      // Create dummy placeholder messages (2 messages)
      const placeholderMessages: Message[] = [
        {
          id: 'placeholder1',
          content: 'This is a placeholder message from the user.',
          timestamp: new Date().toISOString(),
          sender: 'user',
          senderName: selectedConversation.userName,
          messageType: 'text',
          readStatus: true,
          metadata: {
            tags: ['placeholder'],
            priority: 'medium'
          }
        },
        {
          id: 'placeholder2',
          content: 'This is a placeholder response message from the AI.',
          timestamp: new Date().toISOString(),
          sender: 'ai',
          senderName: selectedConversation.aiAgentName,
          messageType: 'text',
          readStatus: true,
          metadata: {
            tags: ['placeholder'],
            priority: 'medium',
            confidence: '95%'
          }
        }
      ];
      
      setConversationMessages(placeholderMessages);
      setLoadingMessages(false);
      setMessageError(null);
    } else {
      setConversationMessages([]);
    }
  }, [selectedConversation]);

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
