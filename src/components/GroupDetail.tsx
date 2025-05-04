import React from 'react';
import { Database } from 'lucide-react';
import { Group, Collection } from '../data/types';
import { useTheme } from '../context/ThemeContext';

interface GroupDetailProps {
  group: Group;
  collections: Collection[];
  onSelectCollection: (collection: Collection) => void;
}

const GroupDetail: React.FC<GroupDetailProps> = ({
  group,
  collections,
  onSelectCollection
}) => {
  const { theme } = useTheme();

  return (
    <div className="p-4">
      <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Collections in this Group</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.isArray(collections) && collections.length > 0 ? collections.map((collection) => (
          <div
            key={collection.id}
            onClick={() => onSelectCollection(collection)}
            className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer`}
          >
            <h4 className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {collection.name || 'Unnamed Collection'}
            </h4>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
              {collection.description || 'No description available'}
            </p>

            <div className={`flex items-center justify-between text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="flex items-center">
                <Database size={12} className="mr-1" />
                <span>
                  {collection.conversations && Array.isArray(collection.conversations)
                    ? `${collection.conversations.length} conversations`
                    : '0 conversations'}
                </span>
              </div>
              <div>
                Created {collection.creationTimestamp
                  ? new Date(collection.creationTimestamp).toLocaleDateString()
                  : 'unknown date'}
              </div>
            </div>
          </div>
        )) : (
          <div className={`col-span-2 p-8 text-center ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} rounded-lg shadow-sm border`}>
            <Database size={24} className={`mx-auto mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>No collections found in this group</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;
