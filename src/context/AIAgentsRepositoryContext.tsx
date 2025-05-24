import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RepositoryFactory } from '../data/repositories/RepositoryFactory';
import { JsonDataSource, DynamicDataSource, AIAgentsApiDataSource } from '../data/sources';
import { DataSize } from '../data/jsonDataSource';
import config from '../config';
import {
  IAIAgentRepository,
  IUserRepository
} from '../data/repositories/interfaces';

interface AIAgentsRepositoryContextProps {
  repositories: {
    aiAgents: IAIAgentRepository;
    users: IUserRepository;
  } | null;
  dataSourceType: 'sample' | 'json' | 'dynamic' | 'api';
  initialize: (sourceType?: 'sample' | 'json' | 'dynamic' | 'api', dataSize?: DataSize | 'dynamic') => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

const AIAgentsRepositoryContext = createContext<AIAgentsRepositoryContextProps | undefined>(undefined);

export const useAIAgentsRepositories = () => {
  const context = useContext(AIAgentsRepositoryContext);
  if (!context) {
    throw new Error('useAIAgentsRepositories must be used within AIAgentsRepositoryProvider');
  }
  return context;
};

interface AIAgentsRepositoryProviderProps {
  children: ReactNode;
}

export const AIAgentsRepositoryProvider: React.FC<AIAgentsRepositoryProviderProps> = ({ children }) => {
  const [repositories, setRepositories] = useState<AIAgentsRepositoryContextProps['repositories']>(null);
  const [dataSourceType, setDataSourceType] = useState<'sample' | 'json' | 'dynamic' | 'api'>('sample');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const initialize = async (sourceType?: 'sample' | 'json' | 'dynamic' | 'api', dataSize?: DataSize | 'dynamic') => {
    try {
      setIsLoading(true);
      setError(null);

      // Get AI Agents API settings from localStorage
      const aiAgentsApiSettings = localStorage.getItem('aiAgentsApiSettings');
      const parsedAiAgentsSettings = aiAgentsApiSettings ? JSON.parse(aiAgentsApiSettings) : null;

      // Check if AI Agents API is enabled
      if (parsedAiAgentsSettings?.enabled) {
        console.log('AIAgentsRepositoryContext: AI Agents API is enabled, attempting to connect...');
        
        try {
          const aiAgentsApiDataSource = new AIAgentsApiDataSource(
            parsedAiAgentsSettings.baseUrl || 'http://localhost:8000',
            parsedAiAgentsSettings.authToken,
            parsedAiAgentsSettings.clientSecret,
            parsedAiAgentsSettings.clientId,
            parsedAiAgentsSettings.noAuth || false
          );

          await aiAgentsApiDataSource.initialize();
          
          await RepositoryFactory.initialize(aiAgentsApiDataSource);
          setRepositories({
            aiAgents: RepositoryFactory.getAIAgentRepository(),
            users: RepositoryFactory.getUserRepository()
          });
          setDataSourceType('api');
          console.log('AIAgentsRepositoryContext: Successfully connected to AI Agents API');
          return;
        } catch (apiError) {
          console.error('AIAgentsRepositoryContext: Failed to initialize AI Agents API, falling back to local data:', apiError);
          setError(apiError as Error);
        }
      }

      // Fall back to local data sources
      const selectedSourceType = sourceType || 'sample';
      const selectedDataSize = dataSize || 'medium';

      console.log(`AIAgentsRepositoryContext: Using local data source: ${selectedSourceType}, size: ${selectedDataSize}`);

      let dataSource;
      switch (selectedSourceType) {
        case 'json':
          dataSource = new JsonDataSource(selectedDataSize as DataSize);
          break;
        case 'dynamic':
          dataSource = new DynamicDataSource();
          break;
        case 'sample':
        default:
          // Use sample data from the main data source
          const sampleDataModule = await import('../data/sampleData');
          const sampleData = sampleDataModule;
          dataSource = {
            initialize: async () => {},
            getAIAgents: async () => sampleData.aiAgents,
            getAIAgentById: async (id: string) => sampleData.aiAgents[id] || null,
            getAIAgentsByStatus: async (status: string) => 
              Object.values(sampleData.aiAgents).filter(agent => agent.status === status),
            createAIAgent: async (data: any) => ({ ...data, id: `ai-agent-${Date.now()}` }),
            updateAIAgent: async (id: string, data: any) => ({ ...sampleData.aiAgents[id], ...data }),
            deleteAIAgent: async () => true,
            getUsers: async () => sampleData.users,
            getUserById: async (id: string) => sampleData.users[id] || null,
            getUsersByRole: async (role: string) => 
              Object.values(sampleData.users).filter(user => user.role === role),
            getCurrentUser: async () => sampleData.users['user1'] || null,
            createUser: async (data: any) => ({ ...data, id: `user-${Date.now()}` }),
            updateUser: async (id: string, data: any) => ({ ...sampleData.users[id], ...data }),
            deleteUser: async () => true,
            saveData: async () => {},
            clearCache: async () => {},
            // Stub other required methods
            getMessageById: async () => null,
            getMessages: async () => ({}),
            getMessagesByConversationId: async () => [],
            createMessage: async () => { throw new Error('Not supported'); },
            updateMessage: async () => null,
            deleteMessage: async () => false,
            getConversationById: async () => null,
            getConversations: async () => ({}),
            getConversationsByCollectionId: async () => [],
            getConversationsByAIAgentId: async () => [],
            getConversationsByUserId: async () => [],
            createConversation: async () => { throw new Error('Not supported'); },
            updateConversation: async () => null,
            deleteConversation: async () => false,
            filterConversations: async () => [],
            getCollectionById: async () => null,
            getCollections: async () => ({}),
            getCollectionsByGroupId: async () => [],
            getCollectionsByCreatorId: async () => [],
            createCollection: async () => { throw new Error('Not supported'); },
            updateCollection: async () => null,
            deleteCollection: async () => false,
            getGroupById: async () => null,
            getGroups: async () => ({}),
            getGroupsByAdminUserId: async () => [],
            createGroup: async () => { throw new Error('Not supported'); },
            updateGroup: async () => null,
            deleteGroup: async () => false
          };
          break;
      }

      await dataSource.initialize();
      
      await RepositoryFactory.initialize(dataSource);
      setRepositories({
        aiAgents: RepositoryFactory.getAIAgentRepository(),
        users: RepositoryFactory.getUserRepository()
      });
      setDataSourceType(selectedSourceType);
    } catch (err) {
      console.error('AIAgentsRepositoryContext: Failed to initialize:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <AIAgentsRepositoryContext.Provider
      value={{
        repositories,
        dataSourceType,
        initialize,
        isLoading,
        error
      }}
    >
      {children}
    </AIAgentsRepositoryContext.Provider>
  );
};