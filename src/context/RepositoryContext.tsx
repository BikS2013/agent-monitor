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
import { DataSize } from '../data/jsonDataSource';

interface RepositoryContextType {
  initialized: boolean;
  messageRepository: IMessageRepository | null;
  conversationRepository: IConversationRepository | null;
  collectionRepository: ICollectionRepository | null;
  groupRepository: IGroupRepository | null;
  aiAgentRepository: IAIAgentRepository | null;
  userRepository: IUserRepository | null;
  initialize: (dataSource?: IDataSource, dataSize?: DataSize) => Promise<void>;
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

  /**
   * Initialize all repositories
   */
  const initialize = async (dataSource?: IDataSource, dataSize?: DataSize): Promise<void> => {
    try {
      // Initialize the repository factory with optional dataset size
      await RepositoryFactory.initialize(dataSource, dataSize);

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

  // Initialize repositories on component mount (with saved data size from localStorage)
  useEffect(() => {
    if (!initialized) {
      // Check if there's a saved dataset size in localStorage
      const savedDataSize = localStorage.getItem('dataSize') as DataSize | null;
      if (savedDataSize && ['small', 'medium', 'large'].includes(savedDataSize)) {
        console.log(`RepositoryContext: Using saved dataset size from localStorage: ${savedDataSize}`);
        initialize(undefined, savedDataSize).catch(console.error);
      } else {
        console.log('RepositoryContext: No saved dataset size, using default');
        initialize().catch(console.error);
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
    initialize
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