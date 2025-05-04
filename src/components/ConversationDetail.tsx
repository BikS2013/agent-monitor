import React, { memo } from 'react';
import { Bot } from 'lucide-react';
import { Conversation, Message } from '../data/types';
import { useTheme } from '../context/ThemeContext';

interface ConversationDetailProps {
  conversation: Conversation;
  messages: Message[];
  loading?: boolean;
  error?: string | null;
}

// Optimize rendering with memo to prevent unnecessary re-renders
const ConversationDetail = memo<ConversationDetailProps>(({
  conversation,
  messages,
  loading = false,
  error = null
}) => {
  const { theme } = useTheme();
  return (
    <div className="flex-1 flex flex-col">
      <div className={`${theme === 'dark' ? 'bg-blue-800' : 'bg-blue-500'} text-white p-4 border-b`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{conversation.id}</h2>
            <p className="text-sm opacity-90">{conversation.userName} with {conversation.aiAgentName}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded text-sm ${
              conversation.conclusion === 'successful' ? 'bg-green-600' :
              conversation.conclusion === 'unsuccessful' ? 'bg-red-600' : 'bg-yellow-600'
            }`}>
              {conversation.conclusion}
            </span>
            <span className="px-3 py-1 bg-blue-600 rounded text-sm">
              {conversation.confidence} confidence
            </span>
          </div>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Loading messages...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-red-500">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>No messages found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  message.sender === 'ai' ? 'bg-blue-600' : 'bg-gray-600'
                }`}>
                  {message.sender === 'ai' ? <Bot size={16} /> : message.senderName[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{message.senderName}</span>
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    {message.metadata?.confidence && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        theme === 'dark' ? (
                          parseInt(message.metadata.confidence) > 90 ? 'bg-green-900 text-green-200' :
                          parseInt(message.metadata.confidence) > 70 ? 'bg-yellow-900 text-yellow-200' :
                          'bg-red-900 text-red-200'
                        ) : (
                          parseInt(message.metadata.confidence) > 90 ? 'bg-green-100 text-green-800' :
                          parseInt(message.metadata.confidence) > 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        )
                      }`}>
                        {message.metadata.confidence} confident
                      </span>
                    )}
                  </div>
                  <div className={`mt-1 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} p-4 rounded-lg shadow-sm border`}>
                    <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`p-4 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-t'}`}>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Type a message..."
            className={`flex-1 p-3 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'} rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <button className={`${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-3 rounded-r`}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if something important changes
  
  // Check if conversation ID has changed (most important check)
  if (prevProps.conversation.id !== nextProps.conversation.id) {
    return false; // Re-render needed
  }
  
  // Check loading state
  if (prevProps.loading !== nextProps.loading) {
    return false; // Re-render needed
  }
  
  // Check error state
  if (prevProps.error !== nextProps.error) {
    return false; // Re-render needed
  }
  
  // Efficient message comparison - first check length
  if (prevProps.messages.length !== nextProps.messages.length) {
    return false; // Re-render needed
  }
  
  // Only do deep comparison if everything else is the same
  // Compare message IDs to detect content changes
  // This avoids expensive JSON.stringify operations
  for (let i = 0; i < prevProps.messages.length; i++) {
    if (prevProps.messages[i].id !== nextProps.messages[i].id) {
      return false; // Re-render needed
    }
  }
  
  // If we got here, no changes require a re-render
  return true;
});

export default ConversationDetail;
