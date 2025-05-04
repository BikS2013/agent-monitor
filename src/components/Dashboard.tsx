import React from 'react';
import { MessageCircle, Users, Bot, CheckCircle, XCircle, Clock, Activity, BarChart3 } from 'lucide-react';
import { AIAgent, Conversation } from '../data/types';

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
  // Calculate statistics
  const totalConversations = Object.keys(conversations).length;
  const activeConversations = Object.values(conversations).filter(c => c.status === 'active').length;
  const successfulConversations = Object.values(conversations).filter(c => c.conclusion === 'successful').length;
  const unsuccessfulConversations = Object.values(conversations).filter(c => c.conclusion === 'unsuccessful').length;
  
  const successRate = totalConversations > 0 
    ? Math.round((successfulConversations / totalConversations) * 100) 
    : 0;
  
  const recentConversations = Object.values(conversations)
    .sort((a, b) => new Date(b.startTimestamp).getTime() - new Date(a.startTimestamp).getTime())
    .slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">AI Contact Center Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <MessageCircle size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Conversations</p>
            <p className="text-2xl font-semibold">{totalConversations}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <CheckCircle size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Success Rate</p>
            <p className="text-2xl font-semibold">{successRate}%</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <Bot size={24} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active AI Agents</p>
            <p className="text-2xl font-semibold">{Object.values(aiAgents).filter(a => a.status === 'active').length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
          <div className="rounded-full bg-yellow-100 p-3 mr-4">
            <Activity size={24} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Conversations</p>
            <p className="text-2xl font-semibold">{activeConversations}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 size={20} className="text-blue-500 mr-2" />
            AI Performance Overview
          </h2>
          
          <div className="space-y-4">
            {Object.values(aiAgents).map(agent => (
              <div key={agent.id} className="border-b pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                      agent.status === 'active' ? 'bg-green-100 text-green-600' :
                      agent.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <Bot size={16} />
                    </div>
                    <span className="font-medium">{agent.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{agent.model}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div>
                    <p className="text-xs text-gray-500">Success Rate</p>
                    <p className="font-medium">{agent.successRate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Conversations</p>
                    <p className="font-medium">{agent.conversationsProcessed}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Avg Response</p>
                    <p className="font-medium">{agent.avgResponseTime}</p>
                  </div>
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
            <MessageCircle size={20} className="text-blue-500 mr-2" />
            Recent Conversations
          </h2>
          
          <div className="space-y-3">
            {recentConversations.map(conversation => (
              <div 
                key={conversation.id} 
                className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{conversation.id}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    conversation.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Users size={14} className="mr-1" />
                  <span>{conversation.userName}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Bot size={14} className="mr-1" />
                  <span>{conversation.aiAgentName}</span>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    {conversation.conclusion === 'successful' ? (
                      <CheckCircle size={14} className="text-green-500 mr-1" />
                    ) : conversation.conclusion === 'unsuccessful' ? (
                      <XCircle size={14} className="text-red-500 mr-1" />
                    ) : (
                      <Clock size={14} className="text-yellow-500 mr-1" />
                    )}
                    <span className="text-xs capitalize">{conversation.conclusion}</span>
                  </div>
                  <span className="text-xs">{conversation.confidence}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Conversation Outcomes</h2>
          
          <div className="flex items-center justify-center h-64">
            <div className="w-48 h-48 rounded-full border-8 border-gray-200 relative">
              <div 
                className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-green-500 border-t-transparent border-r-transparent border-b-transparent"
                style={{ transform: `rotate(${successRate * 3.6}deg)` }}
              ></div>
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col">
                <span className="text-3xl font-bold">{successRate}%</span>
                <span className="text-sm text-gray-500">Success Rate</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <div>
                <p className="text-sm">Successful</p>
                <p className="font-medium">{successfulConversations}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <div>
                <p className="text-sm">Unsuccessful</p>
                <p className="font-medium">{unsuccessfulConversations}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Conversation Tags</h2>
          
          <div className="space-y-3">
            {['money-box', 'quick-resolution', 'technical-issue', 'escalation', 'account-inquiry', 'password-reset'].map((tag, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{tag}</span>
                <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
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
