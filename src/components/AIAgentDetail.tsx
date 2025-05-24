import React, { useState } from 'react';
import { Bot, Activity, Clock, CheckCircle, MessageCircle, BarChart3, Settings, Power, Zap, Edit, RefreshCw, Trash2 } from 'lucide-react';
import { AIAgent } from '../data/types';
import { useTheme } from '../context/ThemeContext';
import { useAIAgentsData } from '../context/AIAgentsDataContext';
import EditAIAgentModal from './modals/EditAIAgentModal';

interface AIAgentDetailProps {
  agent: AIAgent;
  onAgentDeleted?: () => void;
}

const AIAgentDetail: React.FC<AIAgentDetailProps> = ({ agent, onAgentDeleted }) => {
  const { theme } = useTheme();
  const { deleteAIAgent, cleanupInvalidAgents } = useAIAgentsData();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Clean up invalid agents and refresh data
      cleanupInvalidAgents();
      console.log('Agent data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh agent data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the agent "${agent.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const success = await deleteAIAgent(agent.id);
      if (success) {
        console.log(`Agent "${agent.name}" deleted successfully`);
        // Call the callback to notify parent component
        onAgentDeleted?.();
      } else {
        console.error('Failed to delete agent');
        alert('Failed to delete agent. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('An error occurred while deleting the agent. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* A3 area - Fixed header */}
      <div className={`${theme === 'dark' ? 'bg-blue-800' : 'bg-blue-600'} text-white p-4 border-b`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-3">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{agent.name}</h2>
              <p className="text-sm opacity-90">{agent.model}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className={`px-3 py-1 rounded text-sm ${
              agent.status === 'active' ? 'bg-green-500' :
              agent.status === 'inactive' ? 'bg-gray-500' : 'bg-blue-500'
            }`}>
              {agent.status}
            </button>
            <button
              className="p-2 hover:bg-white hover:bg-opacity-10 rounded"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh Agent Data"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <button
              className="p-2 hover:bg-white hover:bg-opacity-10 rounded"
              onClick={() => setIsEditModalOpen(true)}
              title="Edit Agent"
            >
              <Edit size={18} />
            </button>
            <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded" title="Toggle Agent Status">
              <Power size={18} />
            </button>
            <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded" title="Agent Settings">
              <Settings size={18} />
            </button>
            <button
              className="p-2 hover:bg-red-600 hover:bg-opacity-20 rounded"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete Agent"
            >
              <Trash2 size={18} className={isDeleting ? 'opacity-50' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* B2 area - Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-3 rounded shadow-sm flex items-center space-x-3`}>
              <MessageCircle size={18} className="text-blue-500" />
              <div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Conversations</div>
                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{agent.conversationsProcessed}</div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-3 rounded shadow-sm flex items-center space-x-3`}>
              <CheckCircle size={18} className="text-green-500" />
              <div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Success Rate</div>
                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{agent.successRate}</div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-3 rounded shadow-sm flex items-center space-x-3`}>
              <Clock size={18} className="text-purple-500" />
              <div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Avg Response</div>
                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{agent.avgResponseTime}</div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-3 rounded shadow-sm flex items-center space-x-3`}>
              <Activity size={18} className="text-orange-500" />
              <div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Last Active</div>
                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{agent.lastActive}</div>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-4`}>
              <h3 className={`text-lg font-medium mb-3 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <Zap size={18} className="text-blue-500 mr-2" />
                Capabilities
              </h3>

              {agent.capabilities && (
                <div className="space-y-2">
                  {agent.capabilities.map((capability) => (
                    <div key={capability} className={`flex items-center p-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded`}>
                      <CheckCircle size={16} className="text-green-500 mr-2" />
                      <span className={`capitalize ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{capability}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-4`}>
              <h3 className={`text-lg font-medium mb-3 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <Bot size={18} className="text-blue-500 mr-2" />
                Specializations
              </h3>

              {agent.specializations && (
                <div className="space-y-2">
                  {agent.specializations.map((specialization) => (
                    <div key={specialization} className={`flex items-center p-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded`}>
                      <CheckCircle size={16} className="text-green-500 mr-2" />
                      <span className={`capitalize ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{specialization}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={`mt-6 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-4`}>
            <h3 className={`text-lg font-medium mb-3 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <BarChart3 size={18} className="text-blue-500 mr-2" />
              Performance Metrics
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Success Rate</span>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{agent.successRate}</span>
                </div>
                <div className={`w-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2.5`}>
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{ width: agent.successRate }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Response Time</span>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{agent.avgResponseTime}</span>
                </div>
                <div className={`w-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2.5`}>
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: '70%' }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>User Satisfaction</span>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>92%</span>
                </div>
                <div className={`w-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2.5`}>
                  <div
                    className="bg-purple-600 h-2.5 rounded-full"
                    style={{ width: '92%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit AI Agent Modal */}
      <EditAIAgentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        agent={agent}
      />
    </div>
  );
};

export default AIAgentDetail;
