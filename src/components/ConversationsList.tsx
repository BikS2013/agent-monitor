import React, { useState } from 'react';
import { Filter, Search, Users, Bot, Brain, CheckCircle, XCircle } from 'lucide-react';
import { Conversation } from '../data/types';

interface ConversationsListProps {
  conversations: Record<string, Conversation>;
  selectedConversation: Conversation | null;
  setSelectedConversation: (conversation: Conversation) => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({ 
  conversations, 
  selectedConversation, 
  setSelectedConversation 
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = Object.values(conversations).filter(conversation => {
    if (!searchTerm) return true;
    
    return (
      conversation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.aiAgentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {isFiltersOpen && (
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-medium mb-2">Filters</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <select className="w-full p-2 border border-gray-300 rounded">
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Conclusion</label>
              <select className="w-full p-2 border border-gray-300 rounded">
                <option value="all">All</option>
                <option value="successful">Successful</option>
                <option value="unsuccessful">Unsuccessful</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">AI Agent</label>
              <select className="w-full p-2 border border-gray-300 rounded">
                <option value="all">All</option>
                <option value="ai1">Customer Service Bot</option>
                <option value="ai2">Technical Support AI</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {filteredConversations.map((conversation) => (
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
              ) : conversation.conclusion === 'unsuccessful' ? (
                <XCircle size={14} className="text-red-500" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-400"></div>
              )}
            </div>
            <span className="text-xs text-gray-500">{new Date(conversation.startTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <div className="text-sm space-y-1">
            <div className="flex items-center space-x-2">
              <Users size={14} className="text-gray-500" />
              <span>{conversation.userName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Bot size={14} className="text-blue-500" />
              <span>{conversation.aiAgentName} ({conversation.aiAgentType})</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain size={14} className="text-purple-500" />
              <span>Confidence: {conversation.confidence}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationsList;
