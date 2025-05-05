import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faBoxArchive,
  faComments,
  faDatabase,
  faRobot,
  faChartBar,
  faGear,
  faSun,
  faMoon,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  navigationOrder?: string[];
}

const Navigation: React.FC<NavigationProps> = ({
  currentView,
  setCurrentView,
  navigationOrder = []
}) => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Dashboard', icon: faHome, view: 'dashboard' },
    { name: 'Conversations', icon: faComments, view: 'conversations' },
    { name: 'Collections', icon: faDatabase, view: 'collections' },
    { name: 'Groups', icon: faBoxArchive, view: 'groups' },
    { name: 'AI Agents', icon: faRobot, view: 'agents' },
    { name: 'Analytics', icon: faChartBar, view: 'analytics' },
    { name: 'Settings', icon: faGear, view: 'settings' }
  ];

  // Find the current index in the navigation order
  const currentIndex = navigationOrder.indexOf(currentView);
  const showLeftArrow = currentIndex > 0;
  const showRightArrow = currentIndex < navigationOrder.length - 1 && currentIndex >= 0;

  return (
    <div>
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
              <FontAwesomeIcon icon={item.icon} size="sm" />
              <span className="ml-2">{item.name}</span>
            </button>
          ))}
        </div>
        <button
          onClick={toggleTheme}
          className={`px-4 py-3 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-indigo-800'} focus:outline-none`}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} size="sm" />
        </button>
      </nav>

      {/* Swipe indicators */}
      <div className="flex justify-between px-4 py-1 text-xs text-gray-500">
        {showLeftArrow ? (
          <div className="flex items-center">
            <FontAwesomeIcon icon={faChevronLeft} size="xs" className="mr-1" />
            <span>Swipe right for previous</span>
          </div>
        ) : (
          <div></div>
        )}

        {showRightArrow ? (
          <div className="flex items-center">
            <span>Swipe left for next</span>
            <FontAwesomeIcon icon={faChevronRight} size="xs" className="ml-1" />
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
};

export default Navigation;
