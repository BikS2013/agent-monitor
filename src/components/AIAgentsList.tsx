import React, { useState } from 'react';
import { Bot, Plus, Activity, Clock, CheckCircle } from 'lucide-react';
import { AIAgent } from '../data/types';
import NewAIAgentModal from './modals/NewAIAgentModal';

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
  const [isNewAgentModalOpen, setIsNewAgentModalOpen] = useState(false);
  return (
    <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">AI Agents</h2>
          <button
            onClick={() => setIsNewAgentModalOpen(true)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <Plus size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search AI agents..."
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {Object.values(aiAgents).map((agent) => (
        <div
          key={agent.id}
          onClick={() => setSelectedAgent(agent)}
          className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
            selectedAgent?.id === agent.id ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex items-center mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              agent.status === 'active' ? 'bg-green-100 text-green-600' :
              agent.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-medium">{agent.name}</h3>
              <div className="flex items-center text-xs">
                <span className={`px-2 py-0.5 rounded-full ${
                  agent.status === 'active' ? 'bg-green-100 text-green-800' :
                  agent.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {agent.status}
                </span>
                <span className="ml-2 text-gray-500">{agent.model}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <Activity size={14} className="text-blue-500 mr-1" />
              <span>{agent.conversationsProcessed} convs</span>
            </div>
            <div className="flex items-center">
              <CheckCircle size={14} className="text-green-500 mr-1" />
              <span>{agent.successRate} success</span>
            </div>
            <div className="flex items-center">
              <Clock size={14} className="text-purple-500 mr-1" />
              <span>{agent.avgResponseTime} avg</span>
            </div>
            <div className="flex items-center text-gray-500">
              <span>Last: {agent.lastActive}</span>
            </div>
          </div>
        </div>
      ))}

      <NewAIAgentModal
        isOpen={isNewAgentModalOpen}
        onClose={() => setIsNewAgentModalOpen(false)}
      />
    </div>
  );
};

export default AIAgentsList;
