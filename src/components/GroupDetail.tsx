import React from 'react';
import { Activity, Shield, Zap, Users, Database, Settings, Download, Share2, Package } from 'lucide-react';
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

  const getPurposeColor = () => {
    // Add null check for group.purpose
    const purpose = group.purpose || 'general';

    switch (purpose) {
      case 'evaluation':
        return 'bg-purple-600';
      case 'security':
        return 'bg-red-600';
      case 'efficiency':
        return 'bg-green-600';
      default:
        return 'bg-blue-600';
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className={`${getPurposeColor()} text-white p-4 border-b`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-30 p-2 rounded-lg mr-3">
              <div className="text-white">
                {group.purpose === 'evaluation' ? <Activity size={24} /> :
                 group.purpose === 'security' ? <Shield size={24} /> :
                 group.purpose === 'efficiency' ? <Zap size={24} /> :
                 <Package size={24} />}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold">{group.name || 'Unnamed Group'}</h2>
              <p className="text-sm opacity-90">{group.description || 'No description available'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded">
              <Share2 size={18} />
            </button>
            <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded">
              <Download size={18} />
            </button>
            <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b`}>
        <div className="flex flex-wrap gap-4">
          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-3 rounded shadow-sm flex items-center space-x-3`}>
            <Database size={18} className="text-indigo-500" />
            <div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Collections</div>
              <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {Array.isArray(collections) ? collections.length : 0}
              </div>
            </div>
          </div>

          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-3 rounded shadow-sm flex items-center space-x-3`}>
            <Users size={18} className="text-indigo-500" />
            <div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Admins</div>
              <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {group.adminUsers && Array.isArray(group.adminUsers) ? group.adminUsers.length : 0}
              </div>
            </div>
          </div>

          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-3 rounded shadow-sm flex items-center space-x-3`}>
            <div className={
              group.purpose === 'evaluation' ? 'text-purple-500' :
              group.purpose === 'security' ? 'text-red-500' :
              group.purpose === 'efficiency' ? 'text-green-500' :
              'text-blue-500'
            }>
              {group.purpose === 'evaluation' ? <Activity size={18} /> :
               group.purpose === 'security' ? <Shield size={18} /> :
               group.purpose === 'efficiency' ? <Zap size={18} /> :
               <Package size={18} />}
            </div>
            <div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Purpose</div>
              <div className={`font-medium capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {group.purpose || 'general'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
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
      </div>

      <div className={`p-4 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border-t`}>
        <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Admin Users</h3>
        <div className="space-y-2">
          {group.adminUsers && Array.isArray(group.adminUsers) ? group.adminUsers.map((adminId) => (
            <div key={adminId} className={`flex items-center justify-between p-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded`}>
              <div className="flex items-center">
                <div className={`w-8 h-8 ${theme === 'dark' ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-600'} rounded-full flex items-center justify-center mr-2`}>
                  <Users size={16} />
                </div>
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{adminId}</span>
              </div>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {group.permissionLevels && group.permissionLevels[adminId] || 'read'}
              </span>
            </div>
          )) : (
            <div className={`p-3 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              No admin users found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
