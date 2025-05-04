import React, { useState } from 'react';
import { Package, Database, Users, Plus, Activity, Shield, Zap } from 'lucide-react';
import { Group } from '../data/types';
import NewGroupModal from './modals/NewGroupModal';
import { useTheme } from '../context/ThemeContext';

interface GroupsListProps {
  groups: Record<string, Group>;
  selectedGroup: Group | null;
  setSelectedGroup: (group: Group) => void;
}

const GroupsList: React.FC<GroupsListProps> = ({
  groups,
  selectedGroup,
  setSelectedGroup
}) => {
  const { theme } = useTheme();
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  return (
    <div className={`w-96 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r overflow-y-auto`}>
      <div className={`p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-b`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Groups</h2>
          <button
            onClick={() => setIsNewGroupModalOpen(true)}
            className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded`}
          >
            <Plus size={20} className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search groups..."
            className={`w-full px-4 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
        </div>
      </div>

      {Object.values(groups).map((group) => (
        <div
          key={group.id}
          onClick={() => setSelectedGroup(group)}
          className={`p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-b cursor-pointer ${
            theme === 'dark'
              ? (selectedGroup?.id === group.id ? 'bg-gray-700' : 'hover:bg-gray-700')
              : (selectedGroup?.id === group.id ? 'bg-blue-50' : 'hover:bg-gray-50')
          }`}
        >
          <div className="flex items-center mb-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              theme === 'dark' ? (
                group.purpose === 'evaluation' ? 'bg-purple-900 text-purple-300' :
                group.purpose === 'security' ? 'bg-red-900 text-red-300' :
                'bg-green-900 text-green-300'
              ) : (
                group.purpose === 'evaluation' ? 'bg-purple-100 text-purple-600' :
                group.purpose === 'security' ? 'bg-red-100 text-red-600' :
                'bg-green-100 text-green-600'
              )
            }`}>
              {group.purpose === 'evaluation' ? <Activity size={20} /> :
               group.purpose === 'security' ? <Shield size={20} /> :
               <Zap size={20} />}
            </div>
            <div>
              <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{group.name}</h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{group.purpose} group</p>
            </div>
          </div>

          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3`}>{group.description}</p>

          <div className={`flex items-center justify-between text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="flex items-center">
              <Database size={12} className="mr-1" />
              <span>{group.collectionIds.length} collections</span>
            </div>
            <div className="flex items-center">
              <Users size={12} className="mr-1" />
              <span>{group.adminUsers.length} admins</span>
            </div>
          </div>
        </div>
      ))}

      <NewGroupModal
        isOpen={isNewGroupModalOpen}
        onClose={() => setIsNewGroupModalOpen(false)}
      />
    </div>
  );
};

export default GroupsList;
