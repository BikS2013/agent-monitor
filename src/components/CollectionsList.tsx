import React from 'react';
import { Database, Calendar, CheckCircle, Users, Plus } from 'lucide-react';
import { Collection } from '../data/types';

interface CollectionsListProps {
  collections: Record<string, Collection>;
  selectedCollection: Collection | null;
  setSelectedCollection: (collection: Collection) => void;
}

const CollectionsList: React.FC<CollectionsListProps> = ({ 
  collections, 
  selectedCollection, 
  setSelectedCollection 
}) => {
  return (
    <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Collections</h2>
          <button className="p-2 hover:bg-gray-100 rounded">
            <Plus size={20} className="text-gray-600" />
          </button>
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search collections..." 
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      {Object.values(collections).map((collection) => (
        <div
          key={collection.id}
          onClick={() => setSelectedCollection(collection)}
          className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
            selectedCollection?.id === collection.id ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">{collection.name}</h3>
            <span className="text-xs text-gray-500">{new Date(collection.creationTimestamp).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{collection.description}</p>
          <div className="flex flex-wrap gap-2">
            {collection.filterCriteria.aiAgentBased && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                <Bot size={12} className="mr-1" />
                AI Agent Filter
              </span>
            )}
            {collection.filterCriteria.timeBased && (
              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                <Calendar size={12} className="mr-1" />
                Time Filter
              </span>
            )}
            {collection.filterCriteria.outcomeBased && (
              <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                <CheckCircle size={12} className="mr-1" />
                Outcome Filter
              </span>
            )}
            {collection.filterCriteria.multiFactorFilters && (
              <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                <Database size={12} className="mr-1" />
                Multi-factor
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <Users size={12} className="mr-1" />
            <span>Created by {collection.creator}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CollectionsList;
