import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import AIAgentsList from '../components/AIAgentsList';
import AIAgentDetail from '../components/AIAgentDetail';
import { useData } from '../context/DataContext';
import { AIAgent } from '../data/types';
import { useTheme } from '../context/ThemeContext';

const AIAgentsView: React.FC = () => {
  const { aiAgents } = useData();
  const { theme } = useTheme();
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  return (
    <div className="flex flex-1 h-screen">
      <div className={`w-96 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r overflow-y-auto`} style={{ height: 'calc(100vh - 64px)' }}>
        <AIAgentsList
          aiAgents={aiAgents}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
        />
      </div>

      {selectedAgent ? (
        <div className={`flex-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} overflow-y-auto`} style={{ height: 'calc(100vh - 64px)' }}>
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
    </div>
  );
};

export default AIAgentsView;
