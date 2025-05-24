import React, { useState, useEffect, useMemo } from 'react';
import { Bot, Activity, Clock, CheckCircle } from 'lucide-react';
import { AIAgent } from '../data/types';
import NewAIAgentModal from './modals/NewAIAgentModal';
import { useTheme } from '../context/ThemeContext';
import { useAIAgentsData } from '../context/AIAgentsDataContext';

interface AIAgentsListProps {
  aiAgents: Record<string, AIAgent>;
  selectedAgent: AIAgent | null;
  setSelectedAgent: (agent: AIAgent) => void;
}

const AIAgentsList: React.FC<AIAgentsListProps> = ({
  aiAgents,
  selectedAgent,
  setSelectedAgent
}) => {
  const { theme } = useTheme();
  const { cleanupInvalidAgents } = useAIAgentsData();
  const [isNewAgentModalOpen, setIsNewAgentModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [uniqueModels, setUniqueModels] = useState<string[]>(['all']);

  // Get agents array safely - use useMemo to ensure proper re-computation
  const agentsArray = useMemo(() => {
    if (!aiAgents) return [];

    // Process and migrate agents, filtering out truly invalid ones
    return Object.values(aiAgents).map(agent => {
      // Handle migration from old field structure
      if (agent && typeof agent === 'object') {
        const migratedAgent = { ...agent };

        // Migrate modelName to model if needed
        if (!migratedAgent.model && (agent as any).modelName) {
          migratedAgent.model = (agent as any).modelName;
        }

        // Provide default values for missing fields
        if (!migratedAgent.model || migratedAgent.model.trim() === '') {
          migratedAgent.model = 'Unknown Model';
        }

        if (!migratedAgent.name || migratedAgent.name.trim() === '') {
          migratedAgent.name = 'Unnamed Agent';
        }

        if (!migratedAgent.status) {
          migratedAgent.status = 'inactive';
        }

        return migratedAgent;
      }

      return agent;
    }).filter(agent => {
      // Only filter out agents that are completely invalid
      const isValid = agent &&
        typeof agent === 'object' &&
        agent.id &&
        agent.name &&
        agent.model &&
        agent.status;

      if (!isValid) {
        console.warn('Invalid agent found and filtered out:', agent);
      }

      return isValid;
    });
  }, [aiAgents]);

  // Clean up invalid agents on mount
  useEffect(() => {
    cleanupInvalidAgents();
  }, []); // Run once on mount

  // Extract unique models with improved error handling
  useEffect(() => {
    const models = new Set<string>();

    // Safely extract models from agents with defensive checks
    agentsArray.forEach(agent => {
      // Skip invalid agents or those without a model property
      if (!agent || typeof agent !== 'object') return;

      // Check if model exists and is a string
      if (agent.model && typeof agent.model === 'string' && agent.model.trim() !== '') {
        models.add(agent.model);
      }
    });

    // Set unique models with 'all' as first option
    setUniqueModels(['all', ...Array.from(models)]);
  }, [agentsArray]); // Changed dependency from aiAgents to agentsArray

  // Filter agents by search text, status, and model with null/undefined checks
  const displayedAgents = useMemo(() => {
    return agentsArray.filter(agent => {
      // Defensive check: ensure agent has required properties
      if (!agent || typeof agent !== 'object' || !agent.id) {
        console.warn('Invalid agent found:', agent);
        return false;
      }

      // Search filter with null/undefined checks
      if (searchText.trim() !== '') {
        const search = searchText.toLowerCase();

        // Safe property access with null/undefined checks
        const nameMatch = agent.name && typeof agent.name === 'string'
          ? agent.name.toLowerCase().includes(search)
          : false;

        const modelMatch = agent.model && typeof agent.model === 'string'
          ? agent.model.toLowerCase().includes(search)
          : false;

        if (!nameMatch && !modelMatch) {
          return false;
        }
      }

      // Status filter with null/undefined check
      if (statusFilter !== 'all' && agent.status !== statusFilter) {
        return false;
      }

      // Model filter with null/undefined check
      if (modelFilter !== 'all' &&
          (agent.model !== modelFilter || !agent.model)) {
        return false;
      }

      return true;
    });
  }, [agentsArray, searchText, statusFilter, modelFilter]);

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex flex-col h-full`}>
      {isFiltersOpen && (
        <div className={`p-4 border-b ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Filters</h3>
          <div className="space-y-2">
            <div>
              <label className={`block text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Status</label>
              <select
                className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="training">Training</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Model</label>
              <select
                className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
              >
                {uniqueModels.map((model) => (
                  <option key={model} value={model}>
                    {model === 'all' ? 'All Models' : model}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {displayedAgents.length === 0 ? (
          <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No agents match your search
          </div>
        ) : (
          displayedAgents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => {
              // Always get the latest agent data from aiAgents when selecting
              const latestAgent = aiAgents[agent.id] || agent;
              setSelectedAgent(latestAgent);
            }}
            className={`p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-b cursor-pointer ${
              theme === 'dark'
                ? (selectedAgent?.id === agent.id ? 'bg-gray-700' : 'hover:bg-gray-700')
                : (selectedAgent?.id === agent.id ? 'bg-blue-50' : 'hover:bg-gray-50')
            }`}
          >
          <div className="flex items-center mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              theme === 'dark' ? (
                agent.status === 'active' ? 'bg-green-900 text-green-300' :
                agent.status === 'inactive' ? 'bg-gray-800 text-gray-300' :
                'bg-blue-900 text-blue-300'
              ) : (
                agent.status === 'active' ? 'bg-green-100 text-green-600' :
                agent.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
                'bg-blue-100 text-blue-600'
              )
            }`}>
              <Bot size={20} />
            </div>
            <div>
              <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{agent.name || 'Unnamed Agent'}</h3>
              <div className="flex items-center text-xs">
                <span className={`px-2 py-0.5 rounded-full ${
                  theme === 'dark' ? (
                    agent.status === 'active' ? 'bg-green-900 text-green-300' :
                    agent.status === 'inactive' ? 'bg-gray-800 text-gray-300' :
                    'bg-blue-900 text-blue-300'
                  ) : (
                    agent.status === 'active' ? 'bg-green-100 text-green-800' :
                    agent.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  )
                }`}>
                  {agent.status || 'unknown'}
                </span>
                <span className={`ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{agent.model || 'Unknown model'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <Activity size={14} className="text-blue-500 mr-1" />
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{agent.conversationsProcessed || '0'} convs</span>
            </div>
            <div className="flex items-center">
              <CheckCircle size={14} className="text-green-500 mr-1" />
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{agent.successRate || '0%'} success</span>
            </div>
            <div className="flex items-center">
              <Clock size={14} className="text-purple-500 mr-1" />
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{agent.avgResponseTime || '0ms'} avg</span>
            </div>
            <div className={`flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <span>Last: {agent.lastActive || 'N/A'}</span>
            </div>
          </div>
        </div>
      )))}
      </div>

      <NewAIAgentModal
        isOpen={isNewAgentModalOpen}
        onClose={() => setIsNewAgentModalOpen(false)}
      />
    </div>
  );
};

export default AIAgentsList;
