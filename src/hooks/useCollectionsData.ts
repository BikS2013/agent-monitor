import { useContext, useEffect, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { Collection, Conversation } from '../data/types';
import { CollectionsApiDataSource } from '../data/sources/CollectionsApiDataSource';

interface UseCollectionsDataReturn {
  collections: Record<string, Collection>;
  conversations: Record<string, Conversation>;
  loading: {
    collections: boolean;
    conversations: boolean;
  };
  addCollection: (collectionData: Omit<Collection, 'id'> & { id?: string }) => Promise<Collection>;
  updateCollection: (collectionId: string, collectionData: Partial<Collection>) => Promise<Collection>;
  deleteCollection: (collectionId: string) => Promise<boolean>;
  isUsingCollectionsApi: boolean;
}

/**
 * Hook that provides unified data access for Collections page.
 * When Collections API is enabled, it uses Collections API for both collections and conversations.
 * Otherwise, it falls back to the main DataContext.
 */
export const useCollectionsData = (): UseCollectionsDataReturn => {
  const mainDataContext = useContext(DataContext);
  
  // Check if Collections API is enabled
  const isCollectionsApiEnabled = localStorage.getItem('collectionsApiEnabled') === 'true';
  
  // State for Collections API data
  const [collectionsApiData, setCollectionsApiData] = useState<{
    collections: Record<string, Collection>;
    conversations: Record<string, Conversation>;
    loading: { collections: boolean; conversations: boolean };
  }>({
    collections: {},
    conversations: {},
    loading: { collections: false, conversations: false }
  });
  
  const [collectionsApiDataSource, setCollectionsApiDataSource] = useState<CollectionsApiDataSource | null>(null);

  // Initialize Collections API data source when enabled
  useEffect(() => {
    if (isCollectionsApiEnabled) {
      const baseUrl = localStorage.getItem('collectionsApiBaseUrl') || 'http://localhost:8002';
      const authToken = localStorage.getItem('collectionsApiToken');
      const clientSecret = localStorage.getItem('collectionsApiClientSecret');
      const clientId = localStorage.getItem('collectionsApiClientId');
      const noAuth = localStorage.getItem('collectionsApiAuthMethod') === 'none';
      
      const dataSource = new CollectionsApiDataSource(
        baseUrl,
        authToken,
        clientSecret,
        clientId,
        noAuth
      );
      
      setCollectionsApiDataSource(dataSource);
      
      // Initialize and load data
      const initializeAndLoad = async () => {
        try {
          console.log('useCollectionsData: Initializing Collections API data source');
          await dataSource.initialize();
          
          // Load collections
          setCollectionsApiData(prev => ({ ...prev, loading: { ...prev.loading, collections: true } }));
          const collectionsResult = await dataSource.getCollections();
          console.log(`useCollectionsData: Loaded ${Object.keys(collectionsResult).length} collections from Collections API`);
          
          // Load conversations
          setCollectionsApiData(prev => ({ ...prev, loading: { ...prev.loading, conversations: true } }));
          const conversationsResult = await dataSource.getConversations();
          console.log(`useCollectionsData: Loaded ${Object.keys(conversationsResult).length} conversations from Collections API`);
          
          setCollectionsApiData({
            collections: collectionsResult,
            conversations: conversationsResult,
            loading: { collections: false, conversations: false }
          });
          
        } catch (error) {
          console.error('useCollectionsData: Failed to load Collections API data:', error);
          setCollectionsApiData(prev => ({ 
            ...prev, 
            loading: { collections: false, conversations: false } 
          }));
        }
      };
      
      initializeAndLoad();
    } else {
      setCollectionsApiDataSource(null);
      setCollectionsApiData({
        collections: {},
        conversations: {},
        loading: { collections: false, conversations: false }
      });
    }
  }, [isCollectionsApiEnabled]);

  // Collections API operations
  const collectionsApiAddCollection = async (collectionData: Omit<Collection, 'id'> & { id?: string }): Promise<Collection> => {
    if (!collectionsApiDataSource) {
      throw new Error('Collections API not available');
    }
    
    const newCollection = await collectionsApiDataSource.createCollection(collectionData);
    
    // Update local state
    setCollectionsApiData(prev => ({
      ...prev,
      collections: {
        ...prev.collections,
        [newCollection.id]: newCollection
      }
    }));
    
    return newCollection;
  };

  const collectionsApiUpdateCollection = async (collectionId: string, collectionData: Partial<Collection>): Promise<Collection> => {
    if (!collectionsApiDataSource) {
      throw new Error('Collections API not available');
    }
    
    const updatedCollection = await collectionsApiDataSource.updateCollection(collectionId, collectionData);
    
    if (!updatedCollection) {
      throw new Error('Failed to update collection');
    }
    
    // Update local state
    setCollectionsApiData(prev => ({
      ...prev,
      collections: {
        ...prev.collections,
        [collectionId]: updatedCollection
      }
    }));
    
    return updatedCollection;
  };

  const collectionsApiDeleteCollection = async (collectionId: string): Promise<boolean> => {
    if (!collectionsApiDataSource) {
      throw new Error('Collections API not available');
    }
    
    const success = await collectionsApiDataSource.deleteCollection(collectionId);
    
    if (success) {
      // Update local state
      setCollectionsApiData(prev => {
        const newCollections = { ...prev.collections };
        delete newCollections[collectionId];
        return {
          ...prev,
          collections: newCollections
        };
      });
    }
    
    return success;
  };

  // Return appropriate data based on whether Collections API is enabled
  if (isCollectionsApiEnabled && collectionsApiDataSource) {
    return {
      collections: collectionsApiData.collections,
      conversations: collectionsApiData.conversations,
      loading: collectionsApiData.loading,
      addCollection: collectionsApiAddCollection,
      updateCollection: collectionsApiUpdateCollection,
      deleteCollection: collectionsApiDeleteCollection,
      isUsingCollectionsApi: true
    };
  }

  // Fallback to main DataContext
  if (!mainDataContext) {
    throw new Error('useCollectionsData must be used within a DataProvider');
  }

  return {
    collections: mainDataContext?.collections || {},
    conversations: mainDataContext?.conversations || {},
    loading: {
      collections: mainDataContext?.loading?.collections || false,
      conversations: mainDataContext?.loading?.conversations || false
    },
    addCollection: mainDataContext?.addCollection || (async () => { throw new Error('DataContext not available'); }),
    updateCollection: mainDataContext?.updateCollection || (async () => { throw new Error('DataContext not available'); }),
    deleteCollection: mainDataContext?.deleteCollection || (async () => { throw new Error('DataContext not available'); }),
    isUsingCollectionsApi: false
  };
};