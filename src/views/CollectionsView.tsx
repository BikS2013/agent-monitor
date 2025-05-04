import React from 'react';
import { Database } from 'lucide-react';
import CollectionsList from '../components/CollectionsList';
import CollectionDetail from '../components/CollectionDetail';
import { useData } from '../context/DataContext';
import { Collection, Conversation } from '../data/types';
import { useTheme } from '../context/ThemeContext';

interface CollectionsViewProps {
  onSelectConversation: (conversation: Conversation) => void;
  onChangeView: (view: string) => void;
  selectedCollection: Collection | null;
  setSelectedCollection: (collection: Collection | null) => void;
}

const CollectionsView: React.FC<CollectionsViewProps> = ({
  onSelectConversation,
  onChangeView,
  selectedCollection,
  setSelectedCollection
}) => {
  const { collections, loading, conversations } = useData();
  const { theme } = useTheme();

  // Debug: Log collections data
  React.useEffect(() => {
    console.log('CollectionsView: Collections data', {
      count: Object.keys(collections).length,
      ids: Object.keys(collections),
      loading: loading.collections
    });
  }, [collections, loading.collections]);

  // Debug: Log conversations data
  React.useEffect(() => {
    console.log('CollectionsView: Conversations data', {
      count: Object.keys(conversations).length,
      ids: Object.keys(conversations).slice(0, 5) // Show first 5 for brevity
    });
  }, [conversations]);

  // Debug log to check if collections are loaded
  console.log('Collections in CollectionsView:', Object.keys(collections).length, collections);

  // Only auto-select the first collection if there's no selected collection
  // This preserves the selection when navigating from Groups view
  React.useEffect(() => {
    if (!selectedCollection && Object.values(collections).length > 0) {
      setSelectedCollection(Object.values(collections)[0]);
    }
  }, [collections, selectedCollection, setSelectedCollection]);

  const handleSelectConversation = (conversation: Conversation) => {
    onSelectConversation(conversation);
    onChangeView('conversations');
  };

  return (
    <div className="flex flex-1 h-screen">
      <div className={`w-96 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r overflow-y-auto`} style={{ height: 'calc(100vh - 64px)' }}>
        <CollectionsList
          collections={collections}
          selectedCollection={selectedCollection}
          setSelectedCollection={setSelectedCollection}
        />
      </div>

      {selectedCollection ? (
        <div className={`flex-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} overflow-y-auto`} style={{ height: 'calc(100vh - 64px)' }}>
          <CollectionDetail
            collection={selectedCollection}
            conversations={selectedCollection.conversations.map(id => conversations[id]).filter(Boolean)}
            onSelectConversation={handleSelectConversation}
          />
        </div>
      ) : (
        <div className={`flex-1 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`} style={{ height: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <Database size={48} className={`mx-auto ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-4`} />
            <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>Select a collection</h3>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Choose a collection to view its conversations and details</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsView;
