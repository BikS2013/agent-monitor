import React, { useState } from 'react';
import { Package } from 'lucide-react';
import GroupsList from '../components/GroupsList';
import GroupDetail from '../components/GroupDetail';
import { useData } from '../context/DataContext';
import { Group, Collection, Conversation } from '../data/types';
import { useTheme } from '../context/ThemeContext';

interface GroupsViewProps {
  onSelectCollection: (collection: Collection) => void;
  onChangeView: (view: string) => void;
  selectedGroup: Group | null;
  setSelectedGroup: (group: Group | null) => void;
}

const GroupsView: React.FC<GroupsViewProps> = ({
  onSelectCollection,
  onChangeView,
  selectedGroup,
  setSelectedGroup
}) => {
  const { groups, loading, collections } = useData();
  const { theme } = useTheme();

  // Debug: Log groups data
  React.useEffect(() => {
    console.log('GroupsView: Groups data', {
      count: Object.keys(groups).length,
      ids: Object.keys(groups),
      loading: loading.groups
    });
  }, [groups, loading.groups]);

  // Debug: Log collections data
  React.useEffect(() => {
    console.log('GroupsView: Collections data', {
      count: Object.keys(collections).length,
      ids: Object.keys(collections).slice(0, 5) // Show first 5 for brevity
    });
  }, [collections]);

  // Only auto-select the first group if there's no selected group
  // This preserves the selection when navigating between views
  React.useEffect(() => {
    if (!selectedGroup && Object.values(groups).length > 0) {
      setSelectedGroup(Object.values(groups)[0]);
    }
  }, [groups, selectedGroup]);

  const handleSelectCollection = (collection: Collection) => {
    onSelectCollection(collection);
    onChangeView('collections');
  };

  return (
    <div className={`flex flex-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <GroupsList
        groups={groups}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
      />

      {selectedGroup ? (
        <GroupDetail
          group={selectedGroup}
          collections={selectedGroup.collectionIds.map(id => collections[id]).filter(Boolean)}
          onSelectCollection={handleSelectCollection}
        />
      ) : (
        <div className={`flex-1 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="text-center">
            <Package size={48} className={`mx-auto ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-4`} />
            <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>Select a group</h3>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Choose a group to view its collections and details</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsView;
