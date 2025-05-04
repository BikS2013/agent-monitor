import React from 'react';
import { Bot, Activity, Clock, CheckCircle, MessageCircle, BarChart3, Settings, Power, Zap } from 'lucide-react';
import { AIAgent } from '../data/types';

interface AIAgentDetailProps {
  agent: AIAgent;
}

const AIAgentDetail: React.FC<AIAgentDetailProps> = ({ agent }) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-blue-600 text-white p-4 border-b">
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
            <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded">
              <Power size={18} />
            </button>
            <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded shadow-sm flex items-center space-x-3">
            <MessageCircle size={18} className="text-blue-500" />
            <div>
              <div className="text-xs text-gray-500">Conversations</div>
              <div className="font-medium">{agent.conversationsProcessed}</div>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded shadow-sm flex items-center space-x-3">
            <CheckCircle size={18} className="text-green-500" />
            <div>
              <div className="text-xs text-gray-500">Success Rate</div>
              <div className="font-medium">{agent.successRate}</div>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded shadow-sm flex items-center space-x-3">
            <Clock size={18} className="text-purple-500" />
            <div>
              <div className="text-xs text-gray-500">Avg Response</div>
              <div className="font-medium">{agent.avgResponseTime}</div>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded shadow-sm flex items-center space-x-3">
            <Activity size={18} className="text-orange-500" />
            <div>
              <div className="text-xs text-gray-500">Last Active</div>
              <div className="font-medium">{agent.lastActive}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Zap size={18} className="text-blue-500 mr-2" />
                Capabilities
              </h3>
              
              {agent.capabilities && (
                <div className="space-y-2">
                  {agent.capabilities.map((capability, index) => (
                    <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                      <CheckCircle size={16} className="text-green-500 mr-2" />
                      <span className="capitalize">{capability}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Bot size={18} className="text-blue-500 mr-2" />
                Specializations
              </h3>
              
              {agent.specializations && (
                <div className="space-y-2">
                  {agent.specializations.map((specialization, index) => (
                    <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                      <CheckCircle size={16} className="text-green-500 mr-2" />
                      <span className="capitalize">{specialization}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <BarChart3 size={18} className="text-blue-500 mr-2" />
              Performance Metrics
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-sm text-gray-500">{agent.successRate}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: agent.successRate }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-sm text-gray-500">{agent.avgResponseTime}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: '70%' }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">User Satisfaction</span>
                  <span className="text-sm text-gray-500">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
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
    </div>
  );
};

export default AIAgentDetail;
