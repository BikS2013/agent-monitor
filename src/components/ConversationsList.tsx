import React, { useState, memo, useMemo } from 'react';
import { Filter, Search, Users, Bot, Brain, CheckCircle, XCircle } from 'lucide-react';
import { Conversation, AIAgent } from '../data/types';
import { useTheme } from '../context/ThemeContext';
import { useConversationsData } from '../context/ConversationsDataContext';
import { formatThreadId } from '../utils/formatters';

interface ConversationsListProps {
  conversations: Record<string, Conversation>;
  selectedConversation: Conversation | null;
  setSelectedConversation: (conversation: Conversation) => void;
}

// Optimize rendering with memo to prevent unnecessary re-renders
const ConversationsList = memo<ConversationsListProps>(({
  conversations,
  selectedConversation,
  setSelectedConversation
}) => {
  const { theme } = useTheme();
  const { aiAgents = {} } = useConversationsData();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Add state for filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [conclusionFilter, setConclusionFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');

  // Use useMemo to prevent recomputing the filtered conversations on every render
  const filteredConversations = useMemo(() => {
    return Object.values(conversations).filter(conversation => {
      // Apply search filter
      if (searchTerm) {
        const searchMatch =
          conversation.thread_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conversation.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conversation.aiAgentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conversation.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!searchMatch) return false;
      }

      // Apply status filter
      if (statusFilter !== 'all' && conversation.status !== statusFilter) {
        return false;
      }

      // Apply conclusion filter
      if (conclusionFilter !== 'all' && conversation.conclusion !== conclusionFilter) {
        return false;
      }

      // Apply agent filter
      if (agentFilter !== 'all' && conversation.aiAgentId !== agentFilter) {
        return false;
      }

      return true;
    });
  }, [conversations, searchTerm, statusFilter, conclusionFilter, agentFilter]);

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex flex-col h-full`}>
      {/* A2 area - Fixed header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-b`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Conversations</h2>
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded`}
            >
              <Filter size={20} className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
          </div>

          <div className="relative">
            <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search conversations..."
              className={`w-full pl-10 pr-4 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isFiltersOpen && (
          <div className={`p-4 border-b ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Filters</h3>
            <div className="space-y-2">
              <div>
                <label className={`block text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Status</label>
                <select
                  className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Conclusion</label>
                <select
                  className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  value={conclusionFilter}
                  onChange={(e) => setConclusionFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="successful">Successful</option>
                  <option value="unsuccessful">Unsuccessful</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>AI Agent</label>
                <select
                  className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  {Object.values(aiAgents).map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* B1 area - Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conversation) => (
        <div
          key={conversation.thread_id}
          onClick={() => setSelectedConversation(conversation)}
          className={`p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-b cursor-pointer ${
            theme === 'dark'
              ? (selectedConversation?.thread_id === conversation.thread_id ? 'bg-gray-700' : 'hover:bg-gray-700')
              : (selectedConversation?.thread_id === conversation.thread_id ? 'bg-blue-50' : 'hover:bg-gray-50')
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span
                className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                title={conversation.thread_id} // Show full ID on hover
              >
                {formatThreadId(conversation.thread_id)}
              </span>
              {conversation.conclusion === 'successful' ? (
                <CheckCircle size={14} className="text-green-500" />
              ) : conversation.conclusion === 'unsuccessful' ? (
                <XCircle size={14} className="text-red-500" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-400"></div>
              )}
            </div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {new Date(conversation.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
          <div className="text-sm space-y-1">
            <div className="flex items-center space-x-2">
              <Users size={14} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{conversation.userName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Bot size={14} className="text-blue-500" />
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                {conversation.aiAgentName} ({conversation.aiAgentType})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain size={14} className="text-purple-500" />
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Confidence: {conversation.confidence}</span>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // We're not using the memo optimization for this component anymore
  // since we have filter state that's not part of the props
  // This ensures the component always re-renders when filter state changes
  return false;

  // Note: The original memo optimization logic is kept below for reference
  // but it's not being used anymore

  /*
  // 1. Check if selected conversation has changed (most common case)
  const prevSelectedId = prevProps.selectedConversation?.thread_id;
  const nextSelectedId = nextProps.selectedConversation?.thread_id;
  if (prevSelectedId !== nextSelectedId) {
    return false; // Selection changed, need to re-render
  }

  // 2. Fast check for conversation count change
  const prevCount = Object.keys(prevProps.conversations).length;
  const nextCount = Object.keys(nextProps.conversations).length;
  if (prevCount !== nextCount) {
    return false; // Count changed, need to re-render
  }

  // 3. Only if counts are the same, do a more detailed comparison
  // This is faster than joining and comparing strings
  const prevKeys = Object.keys(prevProps.conversations).sort();
  const nextKeys = Object.keys(nextProps.conversations).sort();

  // Check if any keys differ
  for (let i = 0; i < prevKeys.length; i++) {
    if (prevKeys[i] !== nextKeys[i]) {
      return false; // Keys are different, need to re-render
    }
  }

  // 4. Additional check for content changes in conversations with same keys
  // This detects if a conversation object was modified (conclusion changed, etc.)
  // Only check a few key properties to keep this efficient
  for (const key of prevKeys) {
    const prevConv = prevProps.conversations[key];
    const nextConv = nextProps.conversations[key];

    // Check critical fields that would affect rendering
    if (prevConv.conclusion !== nextConv.conclusion ||
        prevConv.confidence !== nextConv.confidence) {
      return false; // Content changed, need to re-render
    }
  }

  // If we got here, no important changes detected
  return true; // Skip re-render
  */
});

export default ConversationsList;
