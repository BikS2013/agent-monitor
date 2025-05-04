import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import AIAgentsList from '../components/AIAgentsList';
import AIAgentDetail from '../components/AIAgentDetail';
import { useData } from '../context/DataContext';
import { AIAgent } from '../data/types';

const AIAgentsView: React.FC = () => {
  const { aiAgents } = useData();
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  return (
    <div className="flex flex-1 bg-gray-50">
      <AIAgentsList 
        aiAgents={aiAgents}
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
      />
      
      {selectedAgent ? (
        <AIAgentDetail agent={selectedAgent} />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Bot size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select an AI agent</h3>
            <p className="text-gray-500">Choose an AI agent to view its details and performance</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAgentsView;
