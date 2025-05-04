import React, { useState, memo, useMemo } from 'react';
import { Calendar, Users, Database, Filter, CheckCircle, XCircle, Download, Share2, Edit } from 'lucide-react';
import { Collection, Conversation } from '../data/types';
import NewCollectionModal from './modals/NewCollectionModal';
import { useTheme } from '../context/ThemeContext';

interface CollectionDetailProps {
  collection: Collection;
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
}

// Optimize rendering with memo to prevent unnecessary re-renders
const CollectionDetail = memo<CollectionDetailProps>(({
  collection,
  conversations,
  onSelectConversation
}) => {
  const { theme } = useTheme();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  return (
    <div className="p-4">
      <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Conversations in this Collection</h3>

      <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
        <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-600' : 'divide-gray-200'}`}>
          <thead className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>ID</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>User</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>AI Agent</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Conclusion</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Duration</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Confidence</th>
            </tr>
          </thead>
          <tbody className={`${theme === 'dark' ? 'bg-gray-700 divide-y divide-gray-600' : 'bg-white divide-y divide-gray-200'}`}>
            {conversations.map((conversation) => (
              <tr
                key={conversation.id}
                className={`${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-50'} cursor-pointer`}
                onClick={() => onSelectConversation(conversation)}
              >
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{conversation.id}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{conversation.userName}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{conversation.aiAgentName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    theme === 'dark' ? (
                      conversation.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-300'
                    ) : (
                      conversation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    )
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
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{conversation.conclusion}</span>
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{conversation.duration}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{conversation.confidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Collection Modal */}
      <NewCollectionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        collectionToEdit={collection}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Compare collection IDs
  if (prevProps.collection.id !== nextProps.collection.id) {
    return false; // Collection changed, need to re-render
  }

  // Fast path: check conversation count
  if (prevProps.conversations.length !== nextProps.conversations.length) {
    return false; // Conversation count changed, need to re-render
  }

  // Check if conversations array has changed
  const prevConvIds = prevProps.conversations.map(c => c.id).sort().join(',');
  const nextConvIds = nextProps.conversations.map(c => c.id).sort().join(',');
  if (prevConvIds !== nextConvIds) {
    return false; // Conversation IDs changed, need to re-render
  }

  // Check for critical field changes in the collection object
  if (prevProps.collection.name !== nextProps.collection.name ||
      prevProps.collection.description !== nextProps.collection.description) {
    return false; // Collection metadata changed, need to re-render
  }

  // If we got here, no important changes detected
  return true; // Skip re-render
});

export default CollectionDetail;
