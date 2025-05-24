import React from 'react';
import { Database, Plus, Search, Edit, Share2, Download, Calendar, Users, Filter, Trash2 } from 'lucide-react';
import CollectionsList from '../components/CollectionsList';
import CollectionDetail from '../components/CollectionDetail';
import NewCollectionModal from '../components/modals/NewCollectionModal';
import DeleteCollectionModal from '../components/modals/DeleteCollectionModal';
import { useCollectionsData } from '../hooks/useCollectionsData';
import { Collection, Conversation } from '../data/types';
import { useTheme } from '../context/ThemeContext';
import { filterConversationsByCollection } from '../data/filterUtils';

interface CollectionsViewProps {
  onSelectConversation: (conversation: Conversation) => void;
  onChangeView: (view: string) => void;
  selectedCollection: Collection | null;
  setSelectedCollection: (collection: Collection | null) => void;
}

// Helper function to determine collection filter type
const getCollectionFilterType = (collection: Collection): string => {
  // Handle new filter format (array of FilterElement)
  if (collection.filter && Array.isArray(collection.filter) && collection.filter.length > 0) {
    const firstFilter = collection.filter[0];
    if (firstFilter.aiAgentIds && firstFilter.aiAgentIds.length > 0) return 'AI Agent';
    if (firstFilter.timeRange) return 'Time-based';
    if (firstFilter.outcome && firstFilter.outcome !== 'all') return 'Outcome';
    return 'Multi-factor';
  }

  // Handle legacy filterCriteria format
  if (collection.filterCriteria) {
    if (collection.filterCriteria.aiAgentBased) return 'AI Agent';
    if (collection.filterCriteria.timeBased) return 'Time-based';
    if (collection.filterCriteria.outcomeBased) return 'Outcome';
    return 'Multi-factor';
  }

  return 'No filter';
};

// Helper function to get conversations for a collection based on filters
const getCollectionConversations = (collection: Collection, allConversations: Record<string, Conversation>): Conversation[] => {
  // Use the filter function to get conversations that match the collection's criteria
  return filterConversationsByCollection(allConversations, collection);
};

const CollectionsView: React.FC<CollectionsViewProps> = ({
  onSelectConversation,
  onChangeView,
  selectedCollection,
  setSelectedCollection
}) => {
  const { collections, loading, conversations, deleteCollection, isUsingCollectionsApi } = useCollectionsData();
  const { theme } = useTheme();
  const [isNewCollectionModalOpen, setIsNewCollectionModalOpen] = React.useState(false);
  const [isDeleteCollectionModalOpen, setIsDeleteCollectionModalOpen] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [collectionToEdit, setCollectionToEdit] = React.useState<Collection | null>(null);
  const [filteredConversations, setFilteredConversations] = React.useState<Conversation[]>([]);

  // Debug: Log collections data
  React.useEffect(() => {
    console.log('CollectionsView: Collections data', {
      count: Object.keys(collections).length,
      ids: Object.keys(collections),
      loading: loading.collections,
      usingCollectionsApi: isUsingCollectionsApi
    });
  }, [collections, loading.collections, isUsingCollectionsApi]);

  // Debug: Log conversations data
  React.useEffect(() => {
    console.log('CollectionsView: Conversations data', {
      count: Object.keys(conversations).length,
      ids: Object.keys(conversations).slice(0, 5), // Show first 5 for brevity
      usingCollectionsApi: isUsingCollectionsApi
    });
  }, [conversations, isUsingCollectionsApi]);

  // Debug log to check if collections are loaded
  console.log('Collections in CollectionsView:', Object.keys(collections).length, collections);

  // Only auto-select the first collection if there's no selected collection
  // This preserves the selection when navigating from Groups view
  React.useEffect(() => {
    if (!selectedCollection && Object.values(collections).length > 0) {
      setSelectedCollection(Object.values(collections)[0]);
    }
  }, [collections, selectedCollection, setSelectedCollection]);

  // Filter conversations when selected collection changes
  React.useEffect(() => {
    if (selectedCollection && conversations) {
      const filtered = getCollectionConversations(selectedCollection, conversations);
      setFilteredConversations(filtered);
      console.log(`Filtered ${filtered.length} conversations for collection "${selectedCollection.name}"`);
    } else {
      setFilteredConversations([]);
    }
  }, [selectedCollection, conversations]);

  const handleSelectConversation = (conversation: Conversation) => {
    onSelectConversation(conversation);
    onChangeView('conversations');
  };

  const handleDeleteCollection = async () => {
    if (!selectedCollection) return;

    try {
      const success = await deleteCollection(selectedCollection.id);
      if (success) {
        // Clear the selection and select the first remaining collection if any
        const remainingCollections = Object.values(collections).filter(c => c.id !== selectedCollection.id);
        if (remainingCollections.length > 0) {
          setSelectedCollection(remainingCollections[0]);
        } else {
          setSelectedCollection(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete collection:', error);
      // You might want to show an error notification here
    }
  };

  return (
    <div className="flex flex-1 h-screen">
      {/* Left sidebar with fixed header (A2) and scrollable content (B1) */}
      <div className={`w-96 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`} style={{ height: 'calc(100vh - 64px)' }}>
        {/* A2 area - Fixed sidebar header */}
        <div className={`p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-b`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Collections</h2>
              {isUsingCollectionsApi && (
                <p className="text-xs text-blue-600 mt-1">Using Collections API</p>
              )}
            </div>
            <button
              onClick={() => {
                setCollectionToEdit(null);
                setIsNewCollectionModalOpen(true);
              }}
              className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded`}
              title="Add New Collection"
            >
              <Plus size={18} className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
          </div>

          <div className="relative">
            <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search collections..."
              className={`w-full pl-10 pr-4 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {/* B1 area - Scrollable sidebar content */}
        <div className="flex-1 overflow-y-auto">
          <CollectionsList
            collections={collections}
            selectedCollection={selectedCollection}
            setSelectedCollection={setSelectedCollection}
            searchText={searchText}
            onOpenNewCollectionModal={() => setIsNewCollectionModalOpen(true)}
          />
        </div>
      </div>

      {selectedCollection ? (
        <div className={`flex-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} flex flex-col`} style={{ height: 'calc(100vh - 64px)' }}>
          {/* A3 area - Fixed content header */}
          <div className={`${theme === 'dark' ? 'bg-indigo-800' : 'bg-indigo-600'} text-white p-4 border-b`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{selectedCollection.name}</h2>
                <p className="text-sm opacity-90">{selectedCollection.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setCollectionToEdit(null);
                    setIsNewCollectionModalOpen(true);
                  }}
                  className={`p-2 ${theme === 'dark' ? 'hover:bg-indigo-900' : 'hover:bg-indigo-700'} rounded`}
                  title="Add New Collection"
                >
                  <Plus size={18} />
                </button>
                <div className={`h-6 w-px ${theme === 'dark' ? 'bg-indigo-700' : 'bg-indigo-500'}`}></div>
                <button
                  onClick={() => {
                    setCollectionToEdit(selectedCollection);
                    setIsNewCollectionModalOpen(true);
                  }}
                  className={`p-2 ${theme === 'dark' ? 'hover:bg-indigo-900' : 'hover:bg-indigo-700'} rounded`}
                  title="Edit Collection"
                >
                  <Edit size={18} />
                </button>
                <button className={`p-2 ${theme === 'dark' ? 'hover:bg-indigo-900' : 'hover:bg-indigo-700'} rounded`} title="Share Collection">
                  <Share2 size={18} />
                </button>
                <button className={`p-2 ${theme === 'dark' ? 'hover:bg-indigo-900' : 'hover:bg-indigo-700'} rounded`} title="Download Collection">
                  <Download size={18} />
                </button>
                <button
                  onClick={() => setIsDeleteCollectionModalOpen(true)}
                  className={`p-2 ${theme === 'dark' ? 'hover:bg-red-700' : 'hover:bg-red-600'} rounded`}
                  title="Delete Collection"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Collection metrics */}
          <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b`}>
            <div className="grid grid-cols-4 gap-4">
              {/* Created */}
              <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg shadow-sm`}>
                <div className="flex items-center mb-2">
                  <Calendar size={20} className="text-indigo-500 mr-2" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Created</span>
                </div>
                <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {new Date(selectedCollection.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Creator */}
              <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg shadow-sm`}>
                <div className="flex items-center mb-2">
                  <Users size={20} className="text-indigo-500 mr-2" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Creator</span>
                </div>
                <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {selectedCollection.creator}
                </div>
              </div>

              {/* Conversations */}
              <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg shadow-sm`}>
                <div className="flex items-center mb-2">
                  <Database size={20} className="text-indigo-500 mr-2" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Conversations</span>
                </div>
                <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {filteredConversations.length}
                </div>
              </div>

              {/* Filter Type */}
              <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg shadow-sm`}>
                <div className="flex items-center mb-2">
                  <Filter size={20} className="text-indigo-500 mr-2" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Filter Type</span>
                </div>
                <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {getCollectionFilterType(selectedCollection)}
                </div>
              </div>
            </div>
          </div>

          {/* B2 area - Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {loading.conversations ? (
              <div className="flex items-center justify-center h-full">
                <div className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                  <p>Loading conversations...</p>
                </div>
              </div>
            ) : (
              <CollectionDetail
                collection={selectedCollection}
                conversations={filteredConversations}
                onSelectConversation={handleSelectConversation}
              />
            )}
          </div>
        </div>
      ) : (
        <div className={`flex-1 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`} style={{ height: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <Database size={48} className={`mx-auto ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-4`} />
            <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>Select a collection</h3>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-4`}>Choose a collection to view its conversations and details</p>
            <button
              onClick={() => {
                setCollectionToEdit(null);
                setIsNewCollectionModalOpen(true);
              }}
              className={`px-4 py-2 ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded flex items-center space-x-2 mx-auto`}
            >
              <Plus size={18} />
              <span>Create New Collection</span>
            </button>
          </div>
        </div>
      )}

      {/* New Collection Modal */}
      <NewCollectionModal
        isOpen={isNewCollectionModalOpen}
        onClose={() => {
          setIsNewCollectionModalOpen(false);
          setCollectionToEdit(null);
        }}
        collectionToEdit={collectionToEdit}
      />

      {/* Delete Collection Modal */}
      <DeleteCollectionModal
        isOpen={isDeleteCollectionModalOpen}
        onClose={() => setIsDeleteCollectionModalOpen(false)}
        collection={selectedCollection}
        onConfirmDelete={handleDeleteCollection}
      />
    </div>
  );
};

export default CollectionsView;
