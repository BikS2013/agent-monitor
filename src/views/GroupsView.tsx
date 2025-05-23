import React, { useState } from 'react';
import GroupsList from '../components/GroupsList';
import GroupDetail from '../components/GroupDetail';
import NewGroupModal from '../components/modals/NewGroupModal';
import EditGroupModal from '../components/modals/EditGroupModal';
import { useData } from '../context/DataContext';
import { Group, Collection, Conversation } from '../data/types';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxArchive,
  faPlus,
  faMagnifyingGlass,
  faPenToSquare,
  faShareNodes,
  faDownload,
  faGear,
  faRefresh
} from '@fortawesome/free-solid-svg-icons';

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
  const { groups, loading, collections, refreshData } = useData();
  const { theme } = useTheme();
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = React.useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [isRefreshing, setIsRefreshing] = React.useState(false);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      console.log('GroupsView: Data refreshed successfully');
    } catch (error) {
      console.error('GroupsView: Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-1 h-screen">
      {/* Left sidebar with fixed header (A2) and scrollable content (B1) */}
      <div className={`w-96 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`} style={{ height: 'calc(100vh - 64px)' }}>
        {/* A2 area - Fixed sidebar header */}
        <div className={`p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-b`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Groups</h2>
            <button
              onClick={() => setIsNewGroupModalOpen(true)}
              className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded`}
            >
              <FontAwesomeIcon icon={faPlus} className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
          </div>

          <div className="relative">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}
            />
            <input
              type="text"
              placeholder="Search groups..."
              className={`w-full pl-10 pr-4 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {/* B1 area - Scrollable sidebar content */}
        <div className="flex-1 overflow-y-auto">
          <GroupsList
            groups={groups}
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            searchText={searchText}
            onOpenNewGroupModal={() => setIsNewGroupModalOpen(true)}
          />
        </div>
      </div>

      {selectedGroup ? (
        <div className={`flex-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} flex flex-col`} style={{ height: 'calc(100vh - 64px)' }}>
          {/* A3 area - Fixed content header */}
          <div className={`${selectedGroup.purpose === 'evaluation' ? 'bg-purple-700' :
                            selectedGroup.purpose === 'security' ? 'bg-red-700' :
                            selectedGroup.purpose === 'efficiency' ? 'bg-green-700' :
                            'bg-blue-700'} text-white p-4 border-b`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-30 p-2 rounded-lg mr-3">
                  <div className="text-white">
                    <FontAwesomeIcon icon={faBoxArchive} size="lg" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{selectedGroup.name || 'Unnamed Group'}</h2>
                  <p className="text-sm opacity-90">{selectedGroup.description || 'No description available'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="p-2 hover:bg-white hover:bg-opacity-10 rounded"
                  title="Refresh Groups"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <FontAwesomeIcon 
                    icon={faRefresh} 
                    className={isRefreshing ? 'animate-spin' : ''}
                  />
                </button>
                <button
                  className="p-2 hover:bg-white hover:bg-opacity-10 rounded"
                  title="Edit Group"
                  onClick={() => setIsEditGroupModalOpen(true)}
                >
                  <FontAwesomeIcon icon={faPenToSquare} />
                </button>
                <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded" title="Share Group">
                  <FontAwesomeIcon icon={faShareNodes} />
                </button>
                <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded" title="Download Group Data">
                  <FontAwesomeIcon icon={faDownload} />
                </button>
                <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded" title="Group Settings">
                  <FontAwesomeIcon icon={faGear} />
                </button>
              </div>
            </div>
          </div>

          {/* B2 area - Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <GroupDetail
              group={selectedGroup}
              collections={selectedGroup.collectionIds.map(id => collections[id]).filter(Boolean)}
              onSelectCollection={handleSelectCollection}
            />
          </div>
        </div>
      ) : (
        <div className={`flex-1 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`} style={{ height: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <FontAwesomeIcon icon={faBoxArchive} size="3x" className={`mx-auto ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-4`} />
            <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>Select a group</h3>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Choose a group to view its collections and details</p>
          </div>
        </div>
      )}

      {/* New Group Modal */}
      <NewGroupModal
        isOpen={isNewGroupModalOpen}
        onClose={() => setIsNewGroupModalOpen(false)}
      />

      {/* Edit Group Modal */}
      {selectedGroup && (
        <EditGroupModal
          isOpen={isEditGroupModalOpen}
          onClose={() => setIsEditGroupModalOpen(false)}
          group={selectedGroup}
        />
      )}
    </div>
  );
};

export default GroupsView;
