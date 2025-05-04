import React, { useState } from 'react';
import { Package, Plus, Search, Edit, Share2, Download, Settings } from 'lucide-react';
import GroupsList from '../components/GroupsList';
import GroupDetail from '../components/GroupDetail';
import NewGroupModal from '../components/modals/NewGroupModal';
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
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');

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
              <Plus size={20} className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
          </div>

          <div className="relative">
            <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
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
                    {selectedGroup.purpose === 'evaluation' ? <Package size={24} /> :
                     selectedGroup.purpose === 'security' ? <Package size={24} /> :
                     selectedGroup.purpose === 'efficiency' ? <Package size={24} /> :
                     <Package size={24} />}
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{selectedGroup.name || 'Unnamed Group'}</h2>
                  <p className="text-sm opacity-90">{selectedGroup.description || 'No description available'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded">
                  <Edit size={18} />
                </button>
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
            <Package size={48} className={`mx-auto ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-4`} />
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
    </div>
  );
};

export default GroupsView;
