import React from 'react';
import { MessageCircle, Users, Bot, CheckCircle, XCircle, Clock, Activity, BarChart3 } from 'lucide-react';
import { AIAgent, Conversation } from '../data/types';
import { useTheme } from '../context/ThemeContext';

interface DashboardProps {
  conversations: Record<string, Conversation>;
  aiAgents: Record<string, AIAgent>;
  onSelectConversation: (conversation: Conversation) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  conversations,
  aiAgents,
  onSelectConversation
}) => {
  const { theme } = useTheme();
  // Calculate statistics
  const totalConversations = Object.keys(conversations).length;
  const activeConversations = Object.values(conversations).filter(c => c.status === 'active').length;
  const successfulConversations = Object.values(conversations).filter(c => c.conclusion === 'successful').length;
  const unsuccessfulConversations = Object.values(conversations).filter(c => c.conclusion === 'unsuccessful').length;

  const successRate = totalConversations > 0
    ? Math.round((successfulConversations / totalConversations) * 100)
    : 0;

  // Sort conversations by timestamp, ensuring most recent are first
const recentConversations = Object.values(conversations)
    .sort((a, b) => new Date(b.startTimestamp).getTime() - new Date(a.startTimestamp).getTime())
    .slice(0, 5);

// Log recent conversations for debugging
console.log('Recent conversations on dashboard:',
  recentConversations.map(c => ({
    id: c.id,
    startTime: c.startTimestamp,
    status: c.status,
    tags: c.tags
  }))
);

  return (
    <div className={`flex-1 overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} p-6`}>
      <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>AI Contact Center Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm p-6 flex items-center`}>
          <div className={`rounded-full ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'} p-3 mr-4`}>
            <MessageCircle size={24} className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`} />
          </div>
          <div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Total Conversations</p>
            <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{totalConversations}</p>
          </div>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm p-6 flex items-center`}>
          <div className={`rounded-full ${theme === 'dark' ? 'bg-green-900' : 'bg-green-100'} p-3 mr-4`}>
            <CheckCircle size={24} className={`${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`} />
          </div>
          <div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Success Rate</p>
            <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{successRate}%</p>
          </div>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm p-6 flex items-center`}>
          <div className={`rounded-full ${theme === 'dark' ? 'bg-purple-900' : 'bg-purple-100'} p-3 mr-4`}>
            <Bot size={24} className={`${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`} />
          </div>
          <div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Active AI Agents</p>
            <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{Object.values(aiAgents).filter(a => a.status === 'active').length}</p>
          </div>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm p-6 flex items-center`}>
          <div className={`rounded-full ${theme === 'dark' ? 'bg-yellow-900' : 'bg-yellow-100'} p-3 mr-4`}>
            <Activity size={24} className={`${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'}`} />
          </div>
          <div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Active Conversations</p>
            <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{activeConversations}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className={`lg:col-span-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm p-6`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <BarChart3 size={20} className="text-blue-500 mr-2" />
            AI Performance Overview
          </h2>

          <div className="space-y-4">
            {Object.values(aiAgents).map(agent => (
              <div key={agent.id} className={`${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} border-b pb-4`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
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
                      <Bot size={16} />
                    </div>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{agent.name}</span>
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{agent.model}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Success Rate</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{agent.successRate}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Conversations</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{agent.conversationsProcessed}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Avg Response</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{agent.avgResponseTime}</p>
                  </div>
                </div>

                <div className={`w-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2`}>
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: agent.successRate }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm p-6`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <MessageCircle size={20} className="text-blue-500 mr-2" />
            Recent Conversations
          </h2>

          <div className="space-y-3">
            {recentConversations.map(conversation => (
              <div
                key={conversation.id}
                className={`p-3 ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-100 hover:bg-gray-50'} border rounded-lg cursor-pointer`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {conversation.tags.includes('recent') ? '🔴 ' : ''}{conversation.id}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    conversation.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>

                <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} mb-1`}>
                  <Users size={14} className="mr-1" />
                  <span>{conversation.userName}</span>
                </div>

                <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  <Bot size={14} className="mr-1" />
                  <span>{conversation.aiAgentName}</span>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center">
                    <Clock size={14} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} mr-1`} />
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
                      {new Date(conversation.startTimestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center">
                    {conversation.conclusion === 'successful' ? (
                      <CheckCircle size={14} className="text-green-500 mr-1" />
                    ) : conversation.conclusion === 'unsuccessful' ? (
                      <XCircle size={14} className="text-red-500 mr-1" />
                    ) : (
                      <Clock size={14} className="text-yellow-500 mr-1" />
                    )}
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} capitalize`}>{conversation.conclusion}</span>
                  </div>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{conversation.confidence}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm p-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Conversation Outcomes</h2>

          <div className="flex items-center justify-center h-64">
            <div className={`w-48 h-48 rounded-full ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} border-8 relative`}>
              <div
                className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-green-500 border-t-transparent border-r-transparent border-b-transparent"
                style={{ transform: `rotate(${successRate * 3.6}deg)` }}
              ></div>
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col">
                <span className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{successRate}%</span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Success Rate</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Successful</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{successfulConversations}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Unsuccessful</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{unsuccessfulConversations}</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm p-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Conversation Tags</h2>

          <div className="space-y-3">
            {['money-box', 'quick-resolution', 'technical-issue', 'escalation', 'account-inquiry', 'password-reset'].map((tag, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{tag}</span>
                <div className={`w-2/3 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2.5`}>
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
