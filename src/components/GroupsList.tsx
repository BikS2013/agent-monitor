import React, { useState, useMemo } from 'react';
import { Group } from '../data/types';
import NewGroupModal from './modals/NewGroupModal';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxArchive,
  faDatabase,
  faUsers,
  faChartLine,
  faShield,
  faBolt
} from '@fortawesome/free-solid-svg-icons';

interface GroupsListProps {
  groups: Record<string, Group>;
  selectedGroup: Group | null;
  setSelectedGroup: (group: Group) => void;
  searchText?: string;
  onOpenNewGroupModal?: () => void;
}

const GroupsList: React.FC<GroupsListProps> = ({
  groups,
  selectedGroup,
  setSelectedGroup,
  searchText = '',
  onOpenNewGroupModal
}) => {
  const { theme } = useTheme();
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);

  // Get groups array safely
  const groupsArray = groups ? Object.values(groups) : [];

  // Filter groups with proper defensive checks
  const filteredGroups = useMemo(() => {
    // Return all groups if search is empty
    if (!searchText.trim()) {
      return groupsArray;
    }

    const search = searchText.toLowerCase();

    // Filter with proper null/undefined checks
    return groupsArray.filter(group => {
      // Skip invalid groups
      if (!group || typeof group !== 'object') {
        return false;
      }

      // Search in name with null check
      const nameMatch = group.name && typeof group.name === 'string'
        ? group.name.toLowerCase().includes(search)
        : false;

      // Search in description with null check
      const descriptionMatch = group.description && typeof group.description === 'string'
        ? group.description.toLowerCase().includes(search)
        : false;

      // Search in purpose with null check
      const purposeMatch = group.purpose && typeof group.purpose === 'string'
        ? group.purpose.toLowerCase().includes(search)
        : false;

      // Return true if any field matches
      return nameMatch || descriptionMatch || purposeMatch;
    });
  }, [groupsArray, searchText]);

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex flex-col h-full`}>
      {/* Group list */}
      <div className="flex-1">
        {filteredGroups.length === 0 ? (
          <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No groups match your search
          </div>
        ) : (
          filteredGroups.map((group) => (
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
                group.purpose === 'efficiency' ? 'bg-green-900 text-green-300' :
                'bg-blue-900 text-blue-300'
              ) : (
                group.purpose === 'evaluation' ? 'bg-purple-100 text-purple-600' :
                group.purpose === 'security' ? 'bg-red-100 text-red-600' :
                group.purpose === 'efficiency' ? 'bg-green-100 text-green-600' :
                'bg-blue-100 text-blue-600'
              )
            }`}>
              {group.purpose === 'evaluation' ? <FontAwesomeIcon icon={faChartLine} /> :
               group.purpose === 'security' ? <FontAwesomeIcon icon={faShield} /> :
               group.purpose === 'efficiency' ? <FontAwesomeIcon icon={faBolt} /> :
               <FontAwesomeIcon icon={faBoxArchive} />}
            </div>
            <div>
              <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {group.name || 'Unnamed Group'}
              </h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {group.purpose || 'general'} group
              </p>
            </div>
          </div>

          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
            {group.description || 'No description available'}
          </p>

          <div className={`flex items-center justify-between text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faDatabase} className="mr-1" size="xs" />
              <span>
                {group.collectionIds && Array.isArray(group.collectionIds)
                  ? `${group.collectionIds.length} collections`
                  : '0 collections'}
              </span>
            </div>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faUsers} className="mr-1" size="xs" />
              <span>
                {group.adminUsers && Array.isArray(group.adminUsers)
                  ? `${group.adminUsers.length} admins`
                  : '0 admins'}
              </span>
            </div>
          </div>
        </div>
      )))}

      </div>

      <NewGroupModal
        isOpen={isNewGroupModalOpen}
        onClose={() => setIsNewGroupModalOpen(false)}
      />
    </div>
  );
};

export default GroupsList;
