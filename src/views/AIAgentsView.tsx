import React, { useState, useEffect, useCallback } from 'react';
import { Bot, Filter, Plus, Search, RefreshCw } from 'lucide-react';
import AIAgentsList from '../components/AIAgentsList';
import AIAgentDetail from '../components/AIAgentDetail';
import { useAIAgentsData } from '../context/AIAgentsDataContext';
import { AIAgent } from '../data/types';
import { useTheme } from '../context/ThemeContext';
import NewAIAgentModal from '../components/modals/NewAIAgentModal';

const AIAgentsView: React.FC = () => {
  const { aiAgents, cleanupInvalidAgents } = useAIAgentsData();
  const { theme } = useTheme();
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [searchText, setSearchText] = useState('');
  const [isNewAgentModalOpen, setIsNewAgentModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [forceUpdateKey, setForceUpdateKey] = useState(0);

  // Force update function to trigger re-renders
  const forceUpdate = useCallback(() => {
    console.log('[AIAgentsView] Forcing UI update...');
    setForceUpdateKey(prev => prev + 1);
  }, []);

  // Sync selectedAgent with updated agent data from context (simplified)
  useEffect(() => {
    if (selectedAgent && aiAgents[selectedAgent.id]) {
      const updatedAgent = aiAgents[selectedAgent.id];
      // Only update if the agent data has actually changed
      if (JSON.stringify(selectedAgent) !== JSON.stringify(updatedAgent)) {
        console.log(`[AIAgentsView] Updating selectedAgent ${updatedAgent.id} with fresh data`);
        setSelectedAgent(updatedAgent);
      }
    } else if (selectedAgent && !aiAgents[selectedAgent.id]) {
      console.log('[AIAgentsView] Selected agent no longer exists, clearing selection');
      setSelectedAgent(null);
    }
  }, [aiAgents, selectedAgent]); // Removed forceUpdate dependency
  
  // Log agents data changes without forcing updates (prevent infinite loop)
  useEffect(() => {
    console.log(`[AIAgentsView] Agents data changed - ${Object.keys(aiAgents).length} agents available`);
    // Removed forceUpdate() to prevent infinite loop
  }, [aiAgents]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('[AIAgentsView] Manual refresh triggered');
    try {
      // Clean up invalid agents and refresh data
      const cleanedCount = cleanupInvalidAgents();
      console.log(`[AIAgentsView] Refresh completed - cleaned ${cleanedCount} agents`);
      forceUpdate(); // Force UI update after cleanup
    } catch (error) {
      console.error('[AIAgentsView] Failed to refresh AI agents data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Enhanced agent selection handler with minimal logging
  const handleAgentSelection = useCallback((agent: AIAgent) => {
    console.log(`[AIAgentsView] Agent selected: ${agent.name} (${agent.id})`);
    setSelectedAgent(agent);
    // Removed forceUpdate to prevent unnecessary re-renders
  }, []);

  return (
    <div className="flex flex-1 h-screen">
      {/* Left sidebar with fixed header (A2) and scrollable content (B1) */}
      <div className={`w-96 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`} style={{ height: 'calc(100vh - 64px)' }}>
        {/* A2 area - Fixed sidebar header */}
        <div className={`p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-b`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>AI Agents</h2>
            <div className="flex space-x-1">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded`}
                title="Refresh agents"
              >
                <RefreshCw size={20} className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded`}
                title="Filter agents"
              >
                <Filter size={20} className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <button
                onClick={() => setIsNewAgentModalOpen(true)}
                className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded`}
                title="Add new agent"
              >
                <Plus size={20} className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search AI agents..."
              className={`w-full pl-10 pr-4 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {/* B1 area - Scrollable sidebar content */}
        <div className="flex-1 overflow-y-auto" key={`agents-list-${forceUpdateKey}`}>
          <AIAgentsList
            aiAgents={aiAgents}
            selectedAgent={selectedAgent}
            setSelectedAgent={handleAgentSelection}
          />
        </div>
      </div>

      {selectedAgent ? (
        <div className={`flex-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} flex flex-col`} style={{ height: 'calc(100vh - 64px)' }} key={`agent-detail-${selectedAgent.id}-${forceUpdateKey}`}>
          {/* A3 area - Fixed content header and B2 area - Scrollable content are handled in AIAgentDetail */}
          <AIAgentDetail
            agent={selectedAgent}
            onAgentDeleted={() => {
              console.log('[AIAgentsView] Agent deleted, clearing selection');
              setSelectedAgent(null);
            }}
          />
        </div>
      ) : (
        <div className={`flex-1 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`} style={{ height: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <Bot size={48} className={`mx-auto ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-4`} />
            <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>Select an AI agent</h3>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Choose an AI agent to view its details and performance</p>
          </div>
        </div>
      )}

      {/* New AI Agent Modal */}
      <NewAIAgentModal
        isOpen={isNewAgentModalOpen}
        onClose={() => setIsNewAgentModalOpen(false)}
      />
    </div>
  );
};

export default AIAgentsView;
