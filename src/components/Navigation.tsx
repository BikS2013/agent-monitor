import React from 'react';
import { Home, Package, MessageCircle, Database, Bot, BarChart3, Settings } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { name: 'Dashboard', icon: Home, view: 'dashboard' },
    { name: 'Conversations', icon: MessageCircle, view: 'conversations' },
    { name: 'Collections', icon: Database, view: 'collections' },
    { name: 'Groups', icon: Package, view: 'groups' },
    { name: 'AI Agents', icon: Bot, view: 'agents' },
    { name: 'Analytics', icon: BarChart3, view: 'analytics' },
    { name: 'Settings', icon: Settings, view: 'settings' }
  ];

  return (
    <nav className="bg-indigo-900 text-white flex items-center h-12">
      {navItems.map((item, index) => (
        <button
          key={index}
          onClick={() => setCurrentView(item.view)}
          className={`px-6 py-3 hover:bg-indigo-800 focus:outline-none flex items-center space-x-2 ${
            currentView === item.view ? 'bg-indigo-800' : ''
          }`}
        >
          <item.icon size={16} />
          <span>{item.name}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
