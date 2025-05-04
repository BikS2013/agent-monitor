import React from 'react';
import { Bot } from 'lucide-react';
import { Conversation, Message } from '../data/types';

interface ConversationDetailProps {
  conversation: Conversation;
  messages: Message[];
}

const ConversationDetail: React.FC<ConversationDetailProps> = ({ conversation, messages }) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-blue-500 text-white p-4 border-b">
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
      
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
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
                  <span className="font-medium text-gray-900">{message.senderName}</span>
                  <span className="text-sm text-gray-500">{new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  {message.metadata.confidence && (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      parseInt(message.metadata.confidence) > 90 ? 'bg-green-100 text-green-800' :
                      parseInt(message.metadata.confidence) > 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {message.metadata.confidence} confident
                    </span>
                  )}
                </div>
                <div className="mt-1 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <p className="text-gray-800">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 bg-white border-t">
        <div className="flex items-center">
          <input 
            type="text" 
            placeholder="Type a message..." 
            className="flex-1 p-3 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-500 text-white px-4 py-3 rounded-r hover:bg-blue-600">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationDetail;
