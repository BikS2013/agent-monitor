import React from 'react';
import { MessageCircle } from 'lucide-react';
import ConversationsList from '../components/ConversationsList';
import ConversationDetail from '../components/ConversationDetail';
import { useData } from '../context/DataContext';
import { Conversation } from '../data/types';

interface ConversationsViewProps {
  selectedConversation?: Conversation | null;
  setSelectedConversation?: (conversation: Conversation | null) => void;
}

const ConversationsView: React.FC<ConversationsViewProps> = ({
  selectedConversation: propSelectedConversation,
  setSelectedConversation: propSetSelectedConversation
}) => {
  const { conversations, getMessagesByConversationId } = useData();

  // Use the props if provided, otherwise use local state from context
  const selectedConversation = propSelectedConversation || null;
  const setSelectedConversation = propSetSelectedConversation || ((conversation: Conversation | null) => {});

  // If no conversation is selected and there are conversations available, select the first one
  React.useEffect(() => {
    if (!selectedConversation && Object.values(conversations).length > 0 && propSetSelectedConversation) {
      propSetSelectedConversation(Object.values(conversations)[0]);
    }
  }, [conversations, selectedConversation, propSetSelectedConversation]);

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
          messages={getMessagesByConversationId(selectedConversation.id)}
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
