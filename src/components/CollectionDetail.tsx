import React from 'react';
import { Calendar, Users, Database, Filter, CheckCircle, XCircle, Download, Share2 } from 'lucide-react';
import { Collection, Conversation } from '../data/types';

interface CollectionDetailProps {
  collection: Collection;
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
}

const CollectionDetail: React.FC<CollectionDetailProps> = ({ 
  collection, 
  conversations,
  onSelectConversation
}) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-indigo-600 text-white p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{collection.name}</h2>
            <p className="text-sm opacity-90">{collection.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-indigo-700 rounded">
              <Share2 size={18} />
            </button>
            <button className="p-2 hover:bg-indigo-700 rounded">
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex flex-wrap gap-4">
          <div className="bg-white p-3 rounded shadow-sm flex items-center space-x-3">
            <Calendar size={18} className="text-indigo-500" />
            <div>
              <div className="text-xs text-gray-500">Created</div>
              <div className="font-medium">{new Date(collection.creationTimestamp).toLocaleDateString()}</div>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded shadow-sm flex items-center space-x-3">
            <Users size={18} className="text-indigo-500" />
            <div>
              <div className="text-xs text-gray-500">Creator</div>
              <div className="font-medium">{collection.creator}</div>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded shadow-sm flex items-center space-x-3">
            <Database size={18} className="text-indigo-500" />
            <div>
              <div className="text-xs text-gray-500">Conversations</div>
              <div className="font-medium">{conversations.length}</div>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded shadow-sm flex items-center space-x-3">
            <Filter size={18} className="text-indigo-500" />
            <div>
              <div className="text-xs text-gray-500">Filter Type</div>
              <div className="font-medium">
                {collection.filterCriteria.aiAgentBased ? 'AI Agent' : 
                 collection.filterCriteria.timeBased ? 'Time-based' :
                 collection.filterCriteria.outcomeBased ? 'Outcome' : 'Multi-factor'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-lg font-medium mb-4">Conversations in this Collection</h3>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conclusion</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {conversations.map((conversation) => (
                  <tr 
                    key={conversation.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onSelectConversation(conversation)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{conversation.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{conversation.userName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{conversation.aiAgentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        conversation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {conversation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {conversation.conclusion === 'successful' ? (
                          <CheckCircle size={16} className="text-green-500 mr-1" />
                        ) : conversation.conclusion === 'unsuccessful' ? (
                          <XCircle size={16} className="text-red-500 mr-1" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-yellow-400 mr-1"></div>
                        )}
                        <span className="text-sm">{conversation.conclusion}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{conversation.duration}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{conversation.confidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionDetail;
