import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

import {
  IMessageRepository,
  IConversationRepository,
  ICollectionRepository,
  IGroupRepository,
} from '../data/repositories/interfaces';

import { ConversationsRepositoryFactory } from '../data/repositories/ConversationsRepositoryFactory';
import { DataSize } from '../data/jsonDataSource';
import config from '../config';

interface ConversationsRepositoryContextType {
  initialized: boolean;
  messageRepository: IMessageRepository | null;
  conversationRepository: IConversationRepository | null;
  collectionRepository: ICollectionRepository | null;
  groupRepository: IGroupRepository | null;
  initialize: (fallbackToLocal?: boolean, dataSize?: DataSize) => Promise<void>;
  isUsingApi: boolean;
}

export const ConversationsRepositoryContext = createContext<ConversationsRepositoryContextType | undefined>(undefined);

export const ConversationsRepositoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [messageRepository, setMessageRepository] = useState<IMessageRepository | null>(null);
  const [conversationRepository, setConversationRepository] = useState<IConversationRepository | null>(null);
  const [collectionRepository, setCollectionRepository] = useState<ICollectionRepository | null>(null);
  const [groupRepository, setGroupRepository] = useState<IGroupRepository | null>(null);
  const [isUsingApi, setIsUsingApi] = useState<boolean>(false);

  /**
   * Initialize all repositories
   */
  const initialize = async (fallbackToLocal: boolean = true, dataSize?: DataSize): Promise<void> => {
    try {
      // Get settings from localStorage if available and preferLocalStorage is true
      const savedConversationsApiEnabled = localStorage.getItem('conversationsApiEnabled');
      const useConversationsApi = config.preferLocalStorage && savedConversationsApiEnabled !== null
        ? savedConversationsApiEnabled === 'true'
        : config.conversationsApi.enabled;

      // Get authentication method from localStorage if available and preferLocalStorage is true
      const savedAuthMethod = localStorage.getItem('conversationsApiAuthMethod');
      const authMethod = config.preferLocalStorage && savedAuthMethod
        ? savedAuthMethod as 'none' | 'token' | 'api-key'
        : config.conversationsApi.authMethod;

      // Debug: Log out all relevant settings
      console.log('ConversationsRepositoryContext Settings:', {
        savedConversationsApiEnabled,
        configConversationsApiEnabled: config.conversationsApi.enabled,
        preferLocalStorage: config.preferLocalStorage,
        useConversationsApi,
        savedAuthMethod,
        configAuthMethod: config.conversationsApi.authMethod,
        usingAuthMethod: authMethod
      });

      if (useConversationsApi) {
        console.log('ConversationsRepositoryContext: Using Conversations API data source');

        // Get token from localStorage if available and preferLocalStorage is true
        const savedToken = localStorage.getItem('conversationsApiToken');
        
        // Get client secret from localStorage if available and preferLocalStorage is true
        const savedClientSecret = localStorage.getItem('conversationsApiClientSecret');
        
        // Get client ID from localStorage if available and preferLocalStorage is true
        const savedClientId = localStorage.getItem('conversationsApiClientId');
        
        // Determine if we should use no authentication
        const useNoAuth = authMethod === 'none';

        // Initialize the repository factory with the Conversations API data source
        await ConversationsRepositoryFactory.initialize(
          localStorage.getItem('conversationsApiBaseUrl') || config.conversationsApi.baseUrl,
          authMethod,
          authMethod === 'token' ? (savedToken || config.conversationsApi.token) : undefined,
          authMethod === 'api-key' ? (savedClientSecret || config.conversationsApi.clientSecret) : undefined,
          authMethod === 'api-key' ? (savedClientId || config.conversationsApi.clientId) : undefined,
          fallbackToLocal,
          dataSize
        );
        
        setIsUsingApi(true);
      } else {
        console.log('ConversationsRepositoryContext: Conversations API is not enabled, using local data source');
        
        // Initialize with local data source
        await ConversationsRepositoryFactory.initialize(
          '',
          'none',
          undefined,
          undefined,
          undefined,
          true,
          dataSize
        );
        
        setIsUsingApi(false);
      }

      // Create repositories
      setMessageRepository(ConversationsRepositoryFactory.getMessageRepository());
      setConversationRepository(ConversationsRepositoryFactory.getConversationRepository());
      setCollectionRepository(ConversationsRepositoryFactory.getCollectionRepository());
      setGroupRepository(ConversationsRepositoryFactory.getGroupRepository());

      setInitialized(true);
    } catch (error) {
      console.error('Failed to initialize Conversations repositories:', error);
      throw error;
    }
  };

  // Initialize repositories on component mount
  useEffect(() => {
    if (!initialized) {
      // Check if Conversations API is enabled in configuration or localStorage
      const savedConversationsApiEnabled = localStorage.getItem('conversationsApiEnabled');
      const useConversationsApi = config.preferLocalStorage && savedConversationsApiEnabled !== null
        ? savedConversationsApiEnabled === 'true'
        : config.conversationsApi.enabled;

      // Debug: Log API initialization details
      console.log('ConversationsRepositoryContext: API initialization details', {
        savedConversationsApiEnabled,
        configConversationsApiEnabled: config.conversationsApi.enabled,
        preferLocalStorage: config.preferLocalStorage,
        useConversationsApi,
        savedAuthMethod: localStorage.getItem('conversationsApiAuthMethod')
      });

      // Function to initialize with local data
      const initializeWithLocalData = () => {
        // Get dataset size from localStorage if available and preferLocalStorage is true
        const savedDataSize = localStorage.getItem('dataSize');
        let datasetToUse: DataSize | undefined;
        
        if (config.preferLocalStorage && savedDataSize && ['small', 'medium', 'large'].includes(savedDataSize)) {
          // Use localStorage setting if preferLocalStorage is true and a valid setting exists
          console.log(`ConversationsRepositoryContext: Using saved dataset size from localStorage: ${savedDataSize}`);
          datasetToUse = savedDataSize as DataSize;
        } else if (config.dataSource.datasetSize !== 'internal') {
          // Use config setting if it's not set to 'internal'
          console.log(`ConversationsRepositoryContext: Using dataset size from config: ${config.dataSource.datasetSize}`);
          datasetToUse = config.dataSource.datasetSize as DataSize;
        } else {
          // Default to in-memory dataset
          console.log('ConversationsRepositoryContext: Using in-memory dataset');
          datasetToUse = undefined;
        }
        
        // Initialize repositories with selected dataset
        initialize(true, datasetToUse).catch(console.error);
      };

      if (useConversationsApi) {
        // Use Conversations API data source
        console.log('ConversationsRepositoryContext: Initializing with Conversations API data source');
        initialize().catch(err => {
          console.error('ConversationsRepositoryContext: Failed to initialize with Conversations API:', err);
          
          // Display an alert to help the user understand what's happening
          if (err.message.includes('Network Error') ||
              err.message.includes('Failed to fetch') ||
              err.message.includes('ECONNREFUSED') ||
              err.message.includes('timeout')) {
            alert("Failed to connect to Conversations API server. Please ensure your Conversations API server is running at " +
                  (localStorage.getItem('conversationsApiBaseUrl') || config.conversationsApi.baseUrl) + 
                  " or change settings to use local data.");
          }

          // If API initialization fails, fall back to local data source
          console.log('ConversationsRepositoryContext: Falling back to local data source after API initialization failure');
          initializeWithLocalData();
        });
      } else {
        // Use local JSON data source
        initializeWithLocalData();
      }
    }
  }, [initialized]);

  const value = {
    initialized,
    messageRepository,
    conversationRepository,
    collectionRepository,
    groupRepository,
    initialize,
    isUsingApi
  };

  return <ConversationsRepositoryContext.Provider value={value}>{children}</ConversationsRepositoryContext.Provider>;
};

export const useConversationsRepositories = (): ConversationsRepositoryContextType => {
  const context = useContext(ConversationsRepositoryContext);
  if (context === undefined) {
    throw new Error('useConversationsRepositories must be used within a ConversationsRepositoryProvider');
  }
  return context;
};
