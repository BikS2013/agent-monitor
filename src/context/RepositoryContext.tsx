import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

import {
  IMessageRepository,
  IConversationRepository,
  ICollectionRepository,
  IGroupRepository,
  IAIAgentRepository,
  IUserRepository
} from '../data/repositories/interfaces';

import { RepositoryFactory } from '../data/repositories/RepositoryFactory';
import { IDataSource } from '../data/sources/IDataSource';
import { ApiDataSource } from '../data/sources/ApiDataSource';
import { DataSize } from '../data/jsonDataSource';
import config from '../config';
import { ApiClient } from '../data/api/ApiClient';

interface RepositoryContextType {
  initialized: boolean;
  messageRepository: IMessageRepository | null;
  conversationRepository: IConversationRepository | null;
  collectionRepository: ICollectionRepository | null;
  groupRepository: IGroupRepository | null;
  aiAgentRepository: IAIAgentRepository | null;
  userRepository: IUserRepository | null;
  initialize: (dataSource?: IDataSource, dataSize?: DataSize | 'dynamic') => Promise<void>;
  isUsingApi: boolean;
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(undefined);

export const RepositoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [messageRepository, setMessageRepository] = useState<IMessageRepository | null>(null);
  const [conversationRepository, setConversationRepository] = useState<IConversationRepository | null>(null);
  const [collectionRepository, setCollectionRepository] = useState<ICollectionRepository | null>(null);
  const [groupRepository, setGroupRepository] = useState<IGroupRepository | null>(null);
  const [aiAgentRepository, setAIAgentRepository] = useState<IAIAgentRepository | null>(null);
  const [userRepository, setUserRepository] = useState<IUserRepository | null>(null);
  const [isUsingApi, setIsUsingApi] = useState<boolean>(false);

  /**
   * Initialize all repositories
   */
  const initialize = async (dataSource?: IDataSource, dataSize?: DataSize): Promise<void> => {
    try {
      // Use the provided data source, or create one based on configuration
      let effectiveDataSource = dataSource;

      if (!effectiveDataSource) {
        // Check if API should be enabled (from localStorage or config)
        const savedApiEnabled = localStorage.getItem('apiEnabled');
        const useApi = config.preferLocalStorage && savedApiEnabled !== null
          ? savedApiEnabled === 'true'
          : config.api.enabled;

        console.log('RepositoryContext.initialize: Determining data source type.', {
          savedApiEnabled,
          configApiEnabled: config.api.enabled,
          preferLocalStorage: config.preferLocalStorage,
          useApi
        });

        if (useApi) {
          console.log('RepositoryContext: Using API data source for collections and other data');

          // Get authentication method from localStorage if available and preferLocalStorage is true
          const savedAuthMethod = localStorage.getItem('apiAuthMethod');
          const authMethod = config.preferLocalStorage && savedAuthMethod
            ? savedAuthMethod as 'none' | 'token' | 'api-key'
            : config.api.authMethod;

          // Debug: Log out all relevant settings
          console.log('RepositoryContext API Settings:', {
            savedApiEnabled,
            configApiEnabled: config.api.enabled,
            savedAuthMethod,
            configAuthMethod: config.api.authMethod,
            preferLocalStorage: config.preferLocalStorage,
            usingAuthMethod: authMethod,
            baseUrl: config.api.baseUrl
          });

          // Determine if we're using no authentication
          const useNoAuth = authMethod === 'none';

          // Get token from localStorage if using token auth
          const savedToken = authMethod === 'token'
            ? localStorage.getItem('agent_monitor_api_token')
            : undefined;

          // Get client secret and ID from localStorage if using API key auth
          const savedClientSecret = authMethod === 'api-key'
            ? localStorage.getItem('apiClientSecret')
            : undefined;
          const savedClientId = authMethod === 'api-key'
            ? localStorage.getItem('apiClientId')
            : undefined;

          // Create API data source with the appropriate configuration
          console.log('RepositoryContext: Creating ApiDataSource with settings:', {
            baseUrl: config.api.baseUrl,
            usingToken: authMethod === 'token',
            usingApiKey: authMethod === 'api-key',
            useNoAuth
          });

          try {
            effectiveDataSource = new ApiDataSource(
              config.api.baseUrl,
              authMethod === 'token' ? (savedToken || config.api.token) : undefined,
              authMethod === 'api-key' ? (savedClientSecret || config.api.clientSecret) : undefined,
              authMethod === 'api-key' ? (savedClientId || config.api.clientId) : undefined,
              useNoAuth
            );
            setIsUsingApi(true);
          } catch (error) {
            console.error('RepositoryContext: Failed to create ApiDataSource:', error);
            throw error; // Rethrow to be caught by the outer try-catch
          }
        } else {
          console.log('RepositoryContext: API is not enabled, using local data source');
        }
      }

      // Initialize the repository factory with the data source and dataset size
      await RepositoryFactory.initialize(effectiveDataSource, dataSize);

      // Create repositories
      setMessageRepository(RepositoryFactory.getMessageRepository());
      setConversationRepository(RepositoryFactory.getConversationRepository());
      setCollectionRepository(RepositoryFactory.getCollectionRepository());
      setGroupRepository(RepositoryFactory.getGroupRepository());
      setAIAgentRepository(RepositoryFactory.getAIAgentRepository());
      setUserRepository(RepositoryFactory.getUserRepository());

      setInitialized(true);
    } catch (error) {
      console.error('Failed to initialize repositories:', error);
      throw error;
    }
  };

  // Helper function to initialize with local data source
  const initializeWithLocalData = () => {
    let datasetToUse: DataSize | undefined;

    // Determine which dataset to use based on config and localStorage
    const savedDataSize = localStorage.getItem('dataSize') as DataSize | null;

    if (config.preferLocalStorage && savedDataSize && ['small', 'medium', 'large'].includes(savedDataSize)) {
      // Use localStorage setting if preferLocalStorage is true and a valid setting exists
      console.log(`RepositoryContext: Using saved dataset size from localStorage: ${savedDataSize}`);
      datasetToUse = savedDataSize as DataSize;
    } else if (config.dataSource.datasetSize !== 'internal') {
      // Use config setting if it's not set to 'internal'
      console.log(`RepositoryContext: Using dataset size from config: ${config.dataSource.datasetSize}`);
      datasetToUse = config.dataSource.datasetSize as DataSize;
    } else {
      // Default to in-memory dataset
      console.log('RepositoryContext: Using in-memory dataset');
      datasetToUse = undefined;
    }

    // Initialize repositories with selected dataset
    initialize(undefined, datasetToUse).catch(console.error);
  };

  // Initialize repositories on component mount
  useEffect(() => {
    if (!initialized) {
      // Check if API is enabled in configuration or localStorage
      const savedApiEnabled = localStorage.getItem('apiEnabled');
      const useApi = config.preferLocalStorage && savedApiEnabled !== null
        ? savedApiEnabled === 'true'
        : config.api.enabled;

      // Debug: Log API initialization details
      console.log('RepositoryContext: API initialization details', {
        savedApiEnabled,
        configApiEnabled: config.api.enabled,
        preferLocalStorage: config.preferLocalStorage,
        useApi,
        savedAuthMethod: localStorage.getItem('apiAuthMethod')
      });

      if (useApi) {
        // Use API data source - the initialize() method will create the appropriate API data source
        console.log('RepositoryContext: Using API data source based on configuration');
        initialize().catch(err => {
          console.error('RepositoryContext: Failed to initialize with API data source:', err);
          console.error('RepositoryContext: Error details:', {
            message: err.message,
            stack: err.stack,
            cause: err.cause
          });

          // Display an alert to help the user understand what's happening
          if (err.message.includes('Network Error') ||
              err.message.includes('Failed to fetch') ||
              err.message.includes('ECONNREFUSED') ||
              err.message.includes('timeout')) {
            alert("Failed to connect to API server. Please ensure your API server is running at " +
                  config.api.baseUrl + " or change settings to use local data.");
          }

          // If API initialization fails, fall back to local data source
          console.log('RepositoryContext: Falling back to local data source after API initialization failure');
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
    aiAgentRepository,
    userRepository,
    initialize,
    isUsingApi
  };

  return <RepositoryContext.Provider value={value}>{children}</RepositoryContext.Provider>;
};

export const useRepositories = (): RepositoryContextType => {
  const context = useContext(RepositoryContext);
  if (context === undefined) {
    throw new Error('useRepositories must be used within a RepositoryProvider');
  }
  return context;
};