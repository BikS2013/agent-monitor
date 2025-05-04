import React, { useState, useMemo } from 'react';
import { Database, Calendar, CheckCircle, Users, Plus, Bot, Search } from 'lucide-react';
import { Collection } from '../data/types';
import NewCollectionModal from './modals/NewCollectionModal';
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();
  const [isNewCollectionModalOpen, setIsNewCollectionModalOpen] = useState(false);
  // Add state for search functionality
  const [searchText, setSearchText] = useState('');
  
  // Get collections array safely
  const collectionsArray = collections ? Object.values(collections) : [];
  
  // Filter collections with proper defensive checks
  const filteredCollections = useMemo(() => {
    // Return all collections if search is empty
    if (!searchText.trim()) {
      return collectionsArray;
    }
    
    const search = searchText.toLowerCase();
    
    // Filter with proper null/undefined checks
    return collectionsArray.filter(collection => {
      // Skip invalid collections
      if (!collection || typeof collection !== 'object') {
        return false;
      }
      
      // Search in name with null check
      const nameMatch = collection.name && typeof collection.name === 'string'
        ? collection.name.toLowerCase().includes(search)
        : false;
        
      // Search in description with null check  
      const descriptionMatch = collection.description && typeof collection.description === 'string'
        ? collection.description.toLowerCase().includes(search)
        : false;
        
      // Search in creator with null check
      const creatorMatch = collection.creator && typeof collection.creator === 'string'
        ? collection.creator.toLowerCase().includes(search)
        : false;
        
      // Return true if any field matches
      return nameMatch || descriptionMatch || creatorMatch;
    });
  }, [collectionsArray, searchText]);
  
  return (
    <div className={`w-96 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r overflow-y-auto`}>
      <div className={`p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-b`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Collections</h2>
          <button
            onClick={() => setIsNewCollectionModalOpen(true)}
            className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded`}
          >
            <Plus size={20} className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
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

      {filteredCollections.length === 0 ? (
        <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          No collections match your search
        </div>
      ) : (
        filteredCollections.map((collection) => (
        <div
          key={collection.id}
          onClick={() => setSelectedCollection(collection)}
          className={`p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-b cursor-pointer ${
            theme === 'dark'
              ? (selectedCollection?.id === collection.id ? 'bg-gray-700' : 'hover:bg-gray-700')
              : (selectedCollection?.id === collection.id ? 'bg-blue-50' : 'hover:bg-gray-50')
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{collection.name || 'Unnamed Collection'}</h3>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {collection.creationTimestamp 
                ? new Date(collection.creationTimestamp).toLocaleDateString() 
                : 'No date'}
            </span>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
            {collection.description || 'No description available'}
          </p>
          <div className="flex flex-wrap gap-2">
            {collection.filterCriteria && collection.filterCriteria.aiAgentBased && (
              <span className={`inline-flex items-center px-2 py-1 ${theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'} text-xs rounded`}>
                <Bot size={12} className="mr-1" />
                AI Agent Filter
              </span>
            )}
            {collection.filterCriteria && collection.filterCriteria.timeBased && (
              <span className={`inline-flex items-center px-2 py-1 ${theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'} text-xs rounded`}>
                <Calendar size={12} className="mr-1" />
                Time Filter
              </span>
            )}
            {collection.filterCriteria && collection.filterCriteria.outcomeBased && (
              <span className={`inline-flex items-center px-2 py-1 ${theme === 'dark' ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800'} text-xs rounded`}>
                <CheckCircle size={12} className="mr-1" />
                Outcome Filter
              </span>
            )}
            {collection.filterCriteria && collection.filterCriteria.multiFactorFilters && Array.isArray(collection.filterCriteria.multiFactorFilters) && (
              <span className={`inline-flex items-center px-2 py-1 ${theme === 'dark' ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'} text-xs rounded`}>
                <Database size={12} className="mr-1" />
                Multi-factor
                {collection.filterCriteria.multiFactorFilters.some(f => f && (f.agentIds || f.agentId)) && (
                  <span className="ml-1 text-xs">• Agent</span>
                )}
                {collection.filterCriteria.multiFactorFilters.some(f => f && f.timeRange) && (
                  <span className="ml-1 text-xs">• Time</span>
                )}
                {collection.filterCriteria.multiFactorFilters.some(f => f && f.outcome) && (
                  <span className="ml-1 text-xs">• Outcome</span>
                )}
                {collection.filterCriteria.multiFactorFilters.some(f => f && f.priority) && (
                  <span className="ml-1 text-xs">• Priority</span>
                )}
              </span>
            )}
            {(!collection.filterCriteria || 
              (!collection.filterCriteria.aiAgentBased && 
               !collection.filterCriteria.timeBased && 
               !collection.filterCriteria.outcomeBased && 
               !collection.filterCriteria.multiFactorFilters)) && (
              <span className={`inline-flex items-center px-2 py-1 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'} text-xs rounded`}>
                <Database size={12} className="mr-1" />
                No filters
              </span>
            )}
          </div>
          <div className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
            <Users size={12} className="mr-1" />
            <span>Created by {collection.creator || 'Unknown'}</span>
          </div>
        </div>
      )))}

      <NewCollectionModal
        isOpen={isNewCollectionModalOpen}
        onClose={() => setIsNewCollectionModalOpen(false)}
      />
    </div>
  );
};

export default CollectionsList;
