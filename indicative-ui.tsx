import React, { useState } from 'react';
import { Home, Package, MessageCircle, Database, Bot, BarChart3, Settings, Filter, Users, Search, CheckCircle, XCircle, Brain, Activity, Zap } from 'lucide-react';

const AIContactCenterSystem = () => {
  const [currentView, setCurrentView] = useState('conversations');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const navItems = [
    { name: 'Dashboard', icon: Home, view: 'dashboard' },
    { name: 'Conversations', icon: MessageCircle, view: 'conversations' },
    { name: 'Collections', icon: Database, view: 'collections' },
    { name: 'Groups', icon: Package, view: 'groups' },
    { name: 'AI Agents', icon: Bot, view: 'agents' },
    { name: 'Analytics', icon: BarChart3, view: 'analytics' },
    { name: 'Settings', icon: Settings, view: 'settings' }
  ];
  
  const aiAgents = [
    {
      id: 'ai1',
      name: 'Customer Service Bot',
      model: 'GPT-4-Turbo',
      status: 'active',
      conversationsProcessed: 1247,
      successRate: '94%',
      avgResponseTime: '1.2s',
      lastActive: '2m ago'
    },
    {
      id: 'ai2',
      name: 'Technical Support AI',
      model: 'Claude-3-Opus',
      status: 'active',
      conversationsProcessed: 856,
      successRate: '89%',
      avgResponseTime: '2.5s',
      lastActive: '5m ago'
    }
  ];
  
  const conversations = [
    {
      id: 't92178',
      user: 'Customer #4521',
      agent: 'Customer Service Bot',
      agentType: 'GPT-4-Turbo',
      conclusion: 'successful',
      priority: 'high',
      duration: '15m',
      messageCount: 12,
      timestamp: '04:24 PM',
      tags: ['money-box', 'quick-resolution'],
      confidence: '98%'
    },
    {
      id: 't92179',
      user: 'Customer #4522',
      agent: 'Technical Support AI',
      agentType: 'Claude-3-Opus',
      conclusion: 'unsuccessful',
      priority: 'medium',
      duration: '45m',
      messageCount: 28,
      timestamp: '04:10 PM',
      tags: ['technical-issue', 'escalation'],
      confidence: '62%'
    }
  ];
  
  const messages = [
    {
      id: 1,
      sender: 'Customer Service Bot',
      senderType: 'ai',
      text: 'Γεια σας 👋 Είμαι ο AI Βοηθός του Contact Center. Πως μπορώ να σας εξυπηρετήσω;',
      time: '04:24 PM',
      confidence: '98%'
    },
    {
      id: 2,  
      sender: 'Customer #4521',
      senderType: 'user',
      text: 'Το Money Box ανοίγεται δωρεάν. Δεν απαιτείται αρχική κατάθεση. Χωρίς μηνιαία προμήθεια.',
      time: '04:24 PM'
    }
  ];
  
  const renderConversationsView = () => (
    <div className="flex flex-1 bg-gray-50">
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Conversations</h2>
            <button 
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <Filter size={20} className="text-gray-600" />
            </button>
          </div>
          
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => setSelectedConversation(conversation)}
            className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
              selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{conversation.id}</span>
                {conversation.conclusion === 'successful' ? (
                  <CheckCircle size={14} className="text-green-500" />
                ) : (
                  <XCircle size={14} className="text-red-500" />
                )}
              </div>
              <span className="text-xs text-gray-500">{conversation.timestamp}</span>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex items-center space-x-2">
                <Users size={14} className="text-gray-500" />
                <span>{conversation.user}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Bot size={14} className="text-blue-500" />
                <span>{conversation.agent} ({conversation.agentType})</span>
              </div>
              <div className="flex items-center space-x-2">
                <Brain size={14} className="text-purple-500" />
                <span>Confidence: {conversation.confidence}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          <div className="bg-blue-500 text-white p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{selectedConversation.id}</h2>
                <p className="text-sm opacity-90">{selectedConversation.user} with {selectedConversation.agent}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded text-sm ${
                  selectedConversation.conclusion === 'successful' ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  {selectedConversation.conclusion}
                </span>
                <span className="px-3 py-1 bg-blue-600 rounded text-sm">
                  {selectedConversation.confidence} confidence
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    message.senderType === 'ai' ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    {message.senderType === 'ai' ? <Bot size={16} /> : message.sender[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{message.sender}</span>
                      <span className="text-sm text-gray-500">{message.time}</span>
                      {message.confidence && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          parseInt(message.confidence) > 90 ? 'bg-green-100 text-green-800' :
                          parseInt(message.confidence) > 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {message.confidence} confident
                        </span>
                      )}
                    </div>
                    <div className="mt-1 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <p className="text-gray-800">{message.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose a conversation to view messages and AI analysis</p>
          </div>
        </div>
      )}
    </div>
  );
  
  const renderContent = () => {
    switch (currentView) {
      case 'conversations':
        return renderConversationsView();
      default:
        return (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Bot size={64} className="mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">AI Contact Center</h3>
              <p className="text-gray-500">Monitor and manage AI agent interactions</p>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <nav className="bg-indigo-900 text-white flex items-center h-12">
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => setCurrentView(item.view)}
            className={`px-6 py-3 hover:bg-indigo-800 focus:outline-none flex items-center space-x-2 ${
              currentView === item.view ? 'bg-indigo-800' : ''
            }`}
          >
            <item.icon size={16} />
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      {renderContent()}
    </div>
  );
};

export default AIContactCenterSystem;