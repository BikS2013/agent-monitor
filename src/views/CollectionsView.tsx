import React, { useState } from 'react';
import { Database } from 'lucide-react';
import CollectionsList from '../components/CollectionsList';
import CollectionDetail from '../components/CollectionDetail';
import { useData } from '../context/DataContext';
import { Collection, Conversation } from '../data/types';

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
  const { collections, getConversationsByCollectionId } = useData();

  // If no collection is selected and there are collections available, select the first one
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
    <div className="flex flex-1 bg-gray-50">
      <CollectionsList
        collections={collections}
        selectedCollection={selectedCollection}
        setSelectedCollection={setSelectedCollection}
      />

      {selectedCollection ? (
        <CollectionDetail
          collection={selectedCollection}
          conversations={getConversationsByCollectionId(selectedCollection.id)}
          onSelectConversation={handleSelectConversation}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Database size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a collection</h3>
            <p className="text-gray-500">Choose a collection to view its conversations and details</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsView;
