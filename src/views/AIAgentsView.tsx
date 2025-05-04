import React, { useState } from 'react';
import { Bot, Filter, Plus, Search } from 'lucide-react';
import AIAgentsList from '../components/AIAgentsList';
import AIAgentDetail from '../components/AIAgentDetail';
import { useData } from '../context/DataContext';
import { AIAgent } from '../data/types';
import { useTheme } from '../context/ThemeContext';
import NewAIAgentModal from '../components/modals/NewAIAgentModal';

const AIAgentsView: React.FC = () => {
  const { aiAgents } = useData();
  const { theme } = useTheme();
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [searchText, setSearchText] = useState('');
  const [isNewAgentModalOpen, setIsNewAgentModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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
        <div className="flex-1 overflow-y-auto">
          <AIAgentsList
            aiAgents={aiAgents}
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
          />
        </div>
      </div>

      {selectedAgent ? (
        <div className={`flex-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} flex flex-col`} style={{ height: 'calc(100vh - 64px)' }}>
          {/* A3 area - Fixed content header and B2 area - Scrollable content are handled in AIAgentDetail */}
          <AIAgentDetail agent={selectedAgent} />
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
