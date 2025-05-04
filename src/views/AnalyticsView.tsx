import React from 'react';
import { BarChart3, PieChart, LineChart, Calendar, Bot, MessageCircle, Users, Filter, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';

const AnalyticsView: React.FC = () => {
  const { conversations, aiAgents } = useData();

  // Calculate statistics
  const totalConversations = Object.keys(conversations).length;
  const successfulConversations = Object.values(conversations).filter(c => c.conclusion === 'successful').length;
  const unsuccessfulConversations = Object.values(conversations).filter(c => c.conclusion === 'unsuccessful').length;

  const successRate = totalConversations > 0
    ? Math.round((successfulConversations / totalConversations) * 100)
    : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

        <div className="flex items-center space-x-2">
          <select className="border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Custom range</option>
          </select>

          <button className="bg-white border border-gray-300 rounded p-1.5 hover:bg-gray-50">
            <Filter size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Total Conversations</h3>
            <MessageCircle size={20} className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold">{totalConversations}</p>
          <p className="text-sm text-gray-500 mt-1">+12% from last period</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Success Rate</h3>
            <PieChart size={20} className="text-green-500" />
          </div>
          <p className="text-3xl font-bold">{successRate}%</p>
          <p className="text-sm text-gray-500 mt-1">+5% from last period</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Avg. Response Time</h3>
            <Clock size={20} className="text-purple-500" />
          </div>
          <p className="text-3xl font-bold">1.8s</p>
          <p className="text-sm text-gray-500 mt-1">-0.3s from last period</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Active AI Agents</h3>
            <Bot size={20} className="text-indigo-500" />
          </div>
          <p className="text-3xl font-bold">{Object.values(aiAgents).filter(a => a.status === 'active').length}</p>
          <p className="text-sm text-gray-500 mt-1">No change from last period</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <LineChart size={20} className="text-blue-500 mr-2" />
            Conversation Trends
          </h2>

          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 size={48} className="mx-auto mb-2 opacity-30" />
              <p>Chart visualization would appear here</p>
              <p className="text-sm">Showing daily conversation volume over time</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <PieChart size={20} className="text-blue-500 mr-2" />
            Conversation Outcomes
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full border-8 border-green-200"></div>
                <div
                  className="absolute inset-0 rounded-full border-8 border-transparent border-t-green-500 border-r-green-500"
                  style={{ transform: 'rotate(45deg)' }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold">{successRate}%</span>
                  <span className="text-xs text-gray-500">Success</span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="font-medium">{successfulConversations}</p>
                <p className="text-sm text-gray-500">Successful</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full border-8 border-red-200"></div>
                <div
                  className="absolute inset-0 rounded-full border-8 border-transparent border-t-red-500 border-r-red-500"
                  style={{ transform: `rotate(${(100 - successRate) * 3.6}deg)` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold">{100 - successRate}%</span>
                  <span className="text-xs text-gray-500">Failed</span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="font-medium">{unsuccessfulConversations}</p>
                <p className="text-sm text-gray-500">Unsuccessful</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Bot size={20} className="text-blue-500 mr-2" />
            AI Agent Performance
          </h2>

          <div className="space-y-4">
            {Object.values(aiAgents).map(agent => (
              <div key={agent.id} className="border-b pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{agent.name}</span>
                  <span className="text-sm">{agent.successRate}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: agent.successRate }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar size={20} className="text-blue-500 mr-2" />
            Conversation by Time
          </h2>

          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 size={48} className="mx-auto mb-2 opacity-30" />
              <p>Chart visualization would appear here</p>
              <p className="text-sm">Showing hourly distribution of conversations</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Users size={20} className="text-blue-500 mr-2" />
            User Satisfaction
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Very Satisfied</span>
                <span className="text-sm">68%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Satisfied</span>
                <span className="text-sm">22%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '22%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Neutral</span>
                <span className="text-sm">7%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '7%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Unsatisfied</span>
                <span className="text-sm">3%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '3%' }}></div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="font-medium">Overall Satisfaction</span>
              <span className="font-medium text-green-500">90%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
