import React, { useState } from 'react';
import { DataProvider } from './context/DataContext';
import Navigation from './components/Navigation';
import DashboardView from './views/DashboardView';
import ConversationsView from './views/ConversationsView';
import CollectionsView from './views/CollectionsView';
import GroupsView from './views/GroupsView';
import AIAgentsView from './views/AIAgentsView';
import AnalyticsView from './views/AnalyticsView';
import SettingsView from './views/SettingsView';
import { Conversation, Collection } from './data/types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView 
            onSelectConversation={setSelectedConversation}
            onChangeView={setCurrentView}
          />
        );
      case 'conversations':
        return <ConversationsView />;
      case 'collections':
        return (
          <CollectionsView 
            onSelectConversation={setSelectedConversation}
            onChangeView={setCurrentView}
          />
        );
      case 'groups':
        return (
          <GroupsView 
            onSelectCollection={setSelectedCollection}
            onChangeView={setCurrentView}
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
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">AI Contact Center</h3>
              <p className="text-gray-500">Monitor and manage AI agent interactions</p>
            </div>
          </div>
        );
    }
  };

  return (
    <DataProvider>
      <div className="flex flex-col h-screen bg-gray-100">
        <Navigation currentView={currentView} setCurrentView={setCurrentView} />
        {renderContent()}
      </div>
    </DataProvider>
  );
};

export default App;
