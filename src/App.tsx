import React, { useState } from 'react';
import Navigation from './components/Navigation';
import DashboardView from './views/DashboardView';
import ConversationsView from './views/ConversationsView';
import CollectionsView from './views/CollectionsView';
import GroupsView from './views/GroupsView';
import AIAgentsView from './views/AIAgentsView';
import AnalyticsView from './views/AnalyticsView';
import SettingsView from './views/SettingsView';
import { Conversation, Collection, Group } from './data/types';
import { useTheme } from './context/ThemeContext';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Custom navigation handler that maintains selected items across views
  const handleViewChange = (view: string) => {
    // We don't reset selected items anymore to maintain consistency
    // This allows selections to persist when navigating between related views
    setCurrentView(view);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            onSelectConversation={setSelectedConversation}
            onChangeView={handleViewChange}
          />
        );
      case 'conversations':
        return (
          <ConversationsView
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
          />
        );
      case 'collections':
        return (
          <CollectionsView
            onSelectConversation={setSelectedConversation}
            onChangeView={handleViewChange}
            selectedCollection={selectedCollection}
            setSelectedCollection={setSelectedCollection}
          />
        );
      case 'groups':
        return (
          <GroupsView
            onSelectCollection={setSelectedCollection}
            onChangeView={handleViewChange}
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
          />
        );
      case 'agents':
        return <AIAgentsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <div className={`flex-1 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="text-center">
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>AI Contact Center</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Monitor and manage AI agent interactions</p>
            </div>
          </div>
        );
    }
  };

  const { theme } = useTheme();

  return (
    <div className={`flex flex-col h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Navigation currentView={currentView} setCurrentView={handleViewChange} />
      {renderContent()}
    </div>
  );
};

export default App;
