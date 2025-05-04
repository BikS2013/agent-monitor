import React from 'react';
import Dashboard from '../components/Dashboard';
import { useData } from '../context/DataContext';
import { Conversation } from '../data/types';

interface DashboardViewProps {
  onSelectConversation: (conversation: Conversation) => void;
  onChangeView: (view: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
  onSelectConversation,
  onChangeView
}) => {
  const { conversations, aiAgents } = useData();

  const handleSelectConversation = (conversation: Conversation) => {
    onSelectConversation(conversation);
    onChangeView('conversations');
  };

  return (
    <Dashboard 
      conversations={conversations}
      aiAgents={aiAgents}
      onSelectConversation={handleSelectConversation}
    />
  );
};

export default DashboardView;
