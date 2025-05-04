import React from 'react';
import { BarChart3, PieChart, LineChart, Calendar, Bot, MessageCircle, Users, Filter, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';

const AnalyticsView: React.FC = () => {
  const { conversations, aiAgents } = useData();
  const { theme } = useTheme();

  // Calculate statistics
  const totalConversations = Object.keys(conversations).length;
  const successfulConversations = Object.values(conversations).filter(c => c.conclusion === 'successful').length;
  const unsuccessfulConversations = Object.values(conversations).filter(c => c.conclusion === 'unsuccessful').length;

  const successRate = totalConversations > 0
    ? Math.round((successfulConversations / totalConversations) * 100)
    : 0;

  return (
    <div className={`flex-1 overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} p-6`}>
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Analytics Dashboard</h1>

        <div className="flex items-center space-x-2">
          <select className={`border rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            theme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Custom range</option>
          </select>

          <button className={`border rounded p-1.5 ${
            theme === 'dark'
              ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
              : 'bg-white border-gray-300 hover:bg-gray-50'
          }`}>
            <Filter size={18} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm p-6`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Total Conversations</h3>
            <MessageCircle size={20} className="text-blue-500" />
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{totalConversations}</p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} mt-1`}>+12% from last period</p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm p-6`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Success Rate</h3>
            <PieChart size={20} className="text-green-500" />
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{successRate}%</p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} mt-1`}>+5% from last period</p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm p-6`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Avg. Response Time</h3>
            <Clock size={20} className="text-purple-500" />
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>1.8s</p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} mt-1`}>-0.3s from last period</p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm p-6`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Active AI Agents</h3>
            <Bot size={20} className="text-indigo-500" />
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{Object.values(aiAgents).filter(a => a.status === 'active').length}</p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} mt-1`}>No change from last period</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm p-6`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <LineChart size={20} className="text-blue-500 mr-2" />
            Conversation Trends
          </h2>

          <div className="h-64 flex items-center justify-center">
            <div className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <BarChart3 size={48} className="mx-auto mb-2 opacity-30" />
              <p>Chart visualization would appear here</p>
              <p className="text-sm">Showing daily conversation volume over time</p>
            </div>
          </div>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm p-6`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <PieChart size={20} className="text-blue-500 mr-2" />
            Conversation Outcomes
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <div className={`absolute inset-0 rounded-full border-8 ${theme === 'dark' ? 'border-green-900' : 'border-green-200'}`}></div>
                <div
                  className="absolute inset-0 rounded-full border-8 border-transparent border-t-green-500 border-r-green-500"
                  style={{ transform: 'rotate(45deg)' }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{successRate}%</span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Success</span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{successfulConversations}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Successful</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <div className={`absolute inset-0 rounded-full border-8 ${theme === 'dark' ? 'border-red-900' : 'border-red-200'}`}></div>
                <div
                  className="absolute inset-0 rounded-full border-8 border-transparent border-t-red-500 border-r-red-500"
                  style={{ transform: `rotate(${(100 - successRate) * 3.6}deg)` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{100 - successRate}%</span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Failed</span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{unsuccessfulConversations}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Unsuccessful</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm p-6`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Bot size={20} className="text-blue-500 mr-2" />
            AI Agent Performance
          </h2>

          <div className="space-y-4">
            {Object.values(aiAgents).map(agent => (
              <div key={agent.id} className={`${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} border-b pb-3`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{agent.name}</span>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{agent.successRate}</span>
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
            <Calendar size={20} className="text-blue-500 mr-2" />
            Conversation by Time
          </h2>

          <div className="h-64 flex items-center justify-center">
            <div className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <BarChart3 size={48} className="mx-auto mb-2 opacity-30" />
              <p>Chart visualization would appear here</p>
              <p className="text-sm">Showing hourly distribution of conversations</p>
            </div>
          </div>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm p-6`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Users size={20} className="text-blue-500 mr-2" />
            User Satisfaction
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Very Satisfied</span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>68%</span>
              </div>
              <div className={`w-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2`}>
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Satisfied</span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>22%</span>
              </div>
              <div className={`w-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2`}>
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '22%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Neutral</span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>7%</span>
              </div>
              <div className={`w-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2`}>
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '7%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Unsatisfied</span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>3%</span>
              </div>
              <div className={`w-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2`}>
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '3%' }}></div>
              </div>
            </div>
          </div>

          <div className={`mt-4 pt-4 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} border-t`}>
            <div className="flex items-center justify-between">
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Overall Satisfaction</span>
              <span className="font-medium text-green-500">90%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
