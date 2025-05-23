import React, { useState, useMemo } from 'react';
import { Database, Calendar, CheckCircle, Users, Bot } from 'lucide-react';
import { Collection } from '../data/types';
import NewCollectionModal from './modals/NewCollectionModal';
import { useTheme } from '../context/ThemeContext';

interface CollectionsListProps {
  collections: Record<string, Collection>;
  selectedCollection: Collection | null;
  setSelectedCollection: (collection: Collection) => void;
  onOpenNewCollectionModal?: () => void;
  searchText?: string;
}

// Helper function to render filter badges for a collection
const renderFilterBadges = (collection: Collection, theme: string) => {
  const badges = [];

  // Handle new filter format (array of FilterElement)
  if (collection.filter && Array.isArray(collection.filter) && collection.filter.length > 0) {
    const hasAiAgentFilter = collection.filter.some(f => f.aiAgentIds && f.aiAgentIds.length > 0);
    const hasTimeFilter = collection.filter.some(f => f.timeRange);
    const hasOutcomeFilter = collection.filter.some(f => f.outcome && f.outcome !== 'all');

    if (hasAiAgentFilter) {
      badges.push(
        <span key="ai-agent" className={`inline-flex items-center px-2 py-1 ${theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'} text-xs rounded`}>
          <Bot size={12} className="mr-1" />
          AI Agent Filter
        </span>
      );
    }

    if (hasTimeFilter) {
      badges.push(
        <span key="time" className={`inline-flex items-center px-2 py-1 ${theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'} text-xs rounded`}>
          <Calendar size={12} className="mr-1" />
          Time Filter
        </span>
      );
    }

    if (hasOutcomeFilter) {
      badges.push(
        <span key="outcome" className={`inline-flex items-center px-2 py-1 ${theme === 'dark' ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800'} text-xs rounded`}>
          <CheckCircle size={12} className="mr-1" />
          Outcome Filter
        </span>
      );
    }

    if (badges.length === 0) {
      badges.push(
        <span key="no-filter" className={`inline-flex items-center px-2 py-1 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'} text-xs rounded`}>
          <Database size={12} className="mr-1" />
          No filters
        </span>
      );
    }

    return badges;
  }

  // Handle legacy filterCriteria format
  if (collection.filterCriteria) {
    if (collection.filterCriteria.aiAgentBased) {
      badges.push(
        <span key="ai-agent" className={`inline-flex items-center px-2 py-1 ${theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'} text-xs rounded`}>
          <Bot size={12} className="mr-1" />
          AI Agent Filter
        </span>
      );
    }

    if (collection.filterCriteria.timeBased) {
      badges.push(
        <span key="time" className={`inline-flex items-center px-2 py-1 ${theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'} text-xs rounded`}>
          <Calendar size={12} className="mr-1" />
          Time Filter
        </span>
      );
    }

    if (collection.filterCriteria.outcomeBased) {
      badges.push(
        <span key="outcome" className={`inline-flex items-center px-2 py-1 ${theme === 'dark' ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800'} text-xs rounded`}>
          <CheckCircle size={12} className="mr-1" />
          Outcome Filter
        </span>
      );
    }

    if (collection.filterCriteria.multiFactorFilters && Array.isArray(collection.filterCriteria.multiFactorFilters)) {
      badges.push(
        <span key="multi-factor" className={`inline-flex items-center px-2 py-1 ${theme === 'dark' ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'} text-xs rounded`}>
          <Database size={12} className="mr-1" />
          Multi-factor
        </span>
      );
    }
  }

  // If no filters found, show "No filters"
  if (badges.length === 0) {
    badges.push(
      <span key="no-filter" className={`inline-flex items-center px-2 py-1 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'} text-xs rounded`}>
        <Database size={12} className="mr-1" />
        No filters
      </span>
    );
  }

  return badges;
};

const CollectionsList: React.FC<CollectionsListProps> = ({
  collections,
  selectedCollection,
  setSelectedCollection,
  onOpenNewCollectionModal,
  searchText = ''
}) => {
  const { theme } = useTheme();
  const [isNewCollectionModalOpen, setIsNewCollectionModalOpen] = useState(false);

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
    <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex flex-col h-full`}>
      {/* Collection list */}
      <div className="flex-1">
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
              {collection.createdAt
                ? new Date(collection.createdAt).toLocaleDateString()
                : 'No date'}
            </span>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
            {collection.description || 'No description available'}
          </p>
          <div className="flex flex-wrap gap-2">
            {renderFilterBadges(collection, theme)}
          </div>
          <div className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
            <Users size={12} className="mr-1" />
            <span>Created by {collection.creator || 'Unknown'}</span>
          </div>
        </div>
      )))}

      </div>

      <NewCollectionModal
        isOpen={isNewCollectionModalOpen}
        onClose={() => setIsNewCollectionModalOpen(false)}
      />
    </div>
  );
};

export default CollectionsList;
