import React from 'react';
import { Home, Package, MessageCircle, Database, Bot, BarChart3, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setCurrentView }) => {
  const { theme, toggleTheme } = useTheme();

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
    <nav className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-indigo-900'} text-white flex items-center justify-between h-12`}>
      <div className="flex items-center">
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => setCurrentView(item.view)}
            className={`px-6 py-3 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-indigo-800'} focus:outline-none flex items-center space-x-2 ${
              currentView === item.view ? (theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-800') : ''
            }`}
          >
            <item.icon size={16} />
            <span>{item.name}</span>
          </button>
        ))}
      </div>
      <button
        onClick={toggleTheme}
        className={`px-4 py-3 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-indigo-800'} focus:outline-none`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      </button>
    </nav>
  );
};

export default Navigation;
