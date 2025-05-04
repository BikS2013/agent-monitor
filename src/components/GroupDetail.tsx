import React from 'react';
import { Activity, Shield, Zap, Users, Database, Settings, Download, Share2 } from 'lucide-react';
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
  const getPurposeIcon = () => {
    switch (group.purpose) {
      case 'evaluation':
        return <Activity size={24} className="text-purple-500" />;
      case 'security':
        return <Shield size={24} className="text-red-500" />;
      case 'efficiency':
        return <Zap size={24} className="text-green-500" />;
      default:
        return null;
    }
  };

  const getPurposeColor = () => {
    switch (group.purpose) {
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
            <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-3">
              {getPurposeIcon()}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{group.name}</h2>
              <p className="text-sm opacity-90">{group.description}</p>
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
              <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{collections.length}</div>
            </div>
          </div>

          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-3 rounded shadow-sm flex items-center space-x-3`}>
            <Users size={18} className="text-indigo-500" />
            <div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Admins</div>
              <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{group.adminUsers.length}</div>
            </div>
          </div>

          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-3 rounded shadow-sm flex items-center space-x-3`}>
            {getPurposeIcon()}
            <div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Purpose</div>
              <div className={`font-medium capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{group.purpose}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-4">
          <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Collections in this Group</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collections.map((collection) => (
              <div
                key={collection.id}
                onClick={() => onSelectCollection(collection)}
                className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer`}
              >
                <h4 className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{collection.name}</h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3`}>{collection.description}</p>

                <div className={`flex items-center justify-between text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="flex items-center">
                    <Database size={12} className="mr-1" />
                    <span>{collection.conversations.length} conversations</span>
                  </div>
                  <div>
                    Created {new Date(collection.creationTimestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`p-4 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border-t`}>
        <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Admin Users</h3>
        <div className="space-y-2">
          {group.adminUsers.map((adminId) => (
            <div key={adminId} className={`flex items-center justify-between p-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded`}>
              <div className="flex items-center">
                <div className={`w-8 h-8 ${theme === 'dark' ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-600'} rounded-full flex items-center justify-center mr-2`}>
                  <Users size={16} />
                </div>
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{adminId}</span>
              </div>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {group.permissionLevels[adminId] || 'read'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
