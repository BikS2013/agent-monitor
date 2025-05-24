import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
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
import { useRepositories } from './context/RepositoryContext';
import { ConversationsRepositoryProvider } from './context/ConversationsRepositoryContext';
import { ConversationsDataProvider } from './context/ConversationsDataContext';
import { AIAgentsRepositoryProvider } from './context/AIAgentsRepositoryContext';
import { AIAgentsDataProvider } from './context/AIAgentsDataContext';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [useLargeDataset, setUseLargeDataset] = useState<boolean>(false);

  // Access repositories context
  const { initialize, initialized } = useRepositories();

  // Define the navigation order for swipe gestures
  const navigationOrder = [
    'dashboard',
    'conversations',
    'collections',
    'groups',
    'agents',
    'analytics',
    'settings'
  ];

  // Custom navigation handler that maintains selected items across views
  const handleViewChange = (view: string) => {
    // We don't reset selected items anymore to maintain consistency
    // This allows selections to persist when navigating between related views
    setCurrentView(view);
  };

  // Reference to the content div
  const contentRef = useRef<HTMLDivElement>(null);

  // Track scroll state
  const scrollState = useRef({
    isScrolling: false,
    scrollTimeout: null as ReturnType<typeof setTimeout> | null,
    lastScrollX: 0,
    scrollThreshold: 50, // Minimum scroll distance to trigger navigation
  });

  // Handle horizontal scroll (navigate between views)
  const handleScroll = useCallback((e: WheelEvent) => {
    // Only respond to horizontal scrolling with shift key or trackpad horizontal gesture
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 5) {
      e.preventDefault(); // Prevent actual scrolling

      // Clear previous timeout
      if (scrollState.current.scrollTimeout) {
        clearTimeout(scrollState.current.scrollTimeout);
      }

      // Update scroll state
      scrollState.current.lastScrollX += e.deltaX;

      // Set a timeout to detect end of scrolling
      scrollState.current.scrollTimeout = setTimeout(() => {
        // Check if scroll distance exceeds threshold
        if (Math.abs(scrollState.current.lastScrollX) >= scrollState.current.scrollThreshold) {
          const currentIndex = navigationOrder.indexOf(currentView);

          // Navigate based on scroll direction
          if (scrollState.current.lastScrollX > 0 && currentIndex < navigationOrder.length - 1) {
            // Scrolled right, go to next view
            handleViewChange(navigationOrder[currentIndex + 1]);
          } else if (scrollState.current.lastScrollX < 0 && currentIndex > 0) {
            // Scrolled left, go to previous view
            handleViewChange(navigationOrder[currentIndex - 1]);
          }
        }

        // Reset scroll state
        scrollState.current.lastScrollX = 0;
        scrollState.current.isScrolling = false;
      }, 150); // Wait for scrolling to stop

      scrollState.current.isScrolling = true;
    }
  }, [currentView, navigationOrder, handleViewChange]);

  // Set up scroll event listener
  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('wheel', handleScroll as any, { passive: false });

      return () => {
        contentElement.removeEventListener('wheel', handleScroll as any);
      };
    }
  }, [handleScroll]);

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
          <ConversationsDataProvider>
            <ConversationsView
              selectedConversation={selectedConversation}
              setSelectedConversation={setSelectedConversation}
            />
          </ConversationsDataProvider>
        );
      case 'collections':
        return (
          <ConversationsDataProvider>
            <CollectionsView
              onSelectConversation={setSelectedConversation}
              onChangeView={handleViewChange}
              selectedCollection={selectedCollection}
              setSelectedCollection={setSelectedCollection}
            />
          </ConversationsDataProvider>
        );
      case 'groups':
        return (
          <ConversationsDataProvider>
            <GroupsView
              onSelectCollection={setSelectedCollection}
              onChangeView={handleViewChange}
              selectedGroup={selectedGroup}
              setSelectedGroup={setSelectedGroup}
            />
          </ConversationsDataProvider>
        );
      case 'agents':
        return (
          <AIAgentsRepositoryProvider>
            <AIAgentsDataProvider>
              <AIAgentsView />
            </AIAgentsDataProvider>
          </AIAgentsRepositoryProvider>
        );
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

  // Configure swipe gesture handlers for mobile devices
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      // Navigate to next view (right navigation direction)
      const currentIndex = navigationOrder.indexOf(currentView);
      if (currentIndex < navigationOrder.length - 1) {
        handleViewChange(navigationOrder[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      // Navigate to previous view (left navigation direction)
      const currentIndex = navigationOrder.indexOf(currentView);
      if (currentIndex > 0) {
        handleViewChange(navigationOrder[currentIndex - 1]);
      }
    },
    trackMouse: false,
    delta: 10, // Minimum swipe distance
    swipeDuration: 500, // Maximum time in ms for a swipe
  });

  return (
    <div className={`flex flex-col h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Navigation
        currentView={currentView}
        setCurrentView={handleViewChange}
        navigationOrder={navigationOrder}
      />
      {/* Add padding-top to account for the fixed navigation bar (h-12 + swipe indicators height) */}
      <div className="flex-1 pt-[calc(3rem+1.5rem)]" {...swipeHandlers}>
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
