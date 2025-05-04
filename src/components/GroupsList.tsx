import React, { useState } from 'react';
import { Package, Database, Users, Plus, Activity, Shield, Zap } from 'lucide-react';
import { Group } from '../data/types';
import NewGroupModal from './modals/NewGroupModal';

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
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  return (
    <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Groups</h2>
          <button
            onClick={() => setIsNewGroupModalOpen(true)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <Plus size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search groups..."
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {Object.values(groups).map((group) => (
        <div
          key={group.id}
          onClick={() => setSelectedGroup(group)}
          className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
            selectedGroup?.id === group.id ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex items-center mb-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              group.purpose === 'evaluation' ? 'bg-purple-100 text-purple-600' :
              group.purpose === 'security' ? 'bg-red-100 text-red-600' :
              'bg-green-100 text-green-600'
            }`}>
              {group.purpose === 'evaluation' ? <Activity size={20} /> :
               group.purpose === 'security' ? <Shield size={20} /> :
               <Zap size={20} />}
            </div>
            <div>
              <h3 className="font-medium">{group.name}</h3>
              <p className="text-xs text-gray-500">{group.purpose} group</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3">{group.description}</p>

          <div className="flex items-center justify-between text-xs text-gray-500">
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
