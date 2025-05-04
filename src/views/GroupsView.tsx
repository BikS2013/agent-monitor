import React, { useState } from 'react';
import { Package } from 'lucide-react';
import GroupsList from '../components/GroupsList';
import GroupDetail from '../components/GroupDetail';
import { useData } from '../context/DataContext';
import { Group, Collection, Conversation } from '../data/types';

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
  const { groups, getCollectionsByGroupId } = useData();

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
    <div className="flex flex-1 bg-gray-50">
      <GroupsList
        groups={groups}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
      />

      {selectedGroup ? (
        <GroupDetail
          group={selectedGroup}
          collections={getCollectionsByGroupId(selectedGroup.id)}
          onSelectCollection={handleSelectCollection}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a group</h3>
            <p className="text-gray-500">Choose a group to view its collections and details</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsView;
