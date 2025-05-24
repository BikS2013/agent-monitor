import { IDataSource } from '../sources/IDataSource';
import { JsonDataSource } from '../sources/JsonDataSource';
import { DynamicDataSource } from '../sources/DynamicDataSource';
import { JsonDataSource as ExternalJsonDataSource, DataSize } from '../jsonDataSource';

import {
  IMessageRepository,
  IConversationRepository,
  ICollectionRepository,
  IGroupRepository,
  IAIAgentRepository,
  IUserRepository
} from './interfaces';

import {
  MessageRepository,
  ConversationRepository,
  CollectionRepository,
  GroupRepository,
  AIAgentRepository,
  UserRepository
} from './implementations';

/**
 * Factory for creating repositories
 * Provides a single point for repository creation and dependency injection
 */
export class RepositoryFactory {
  private static dataSource: IDataSource | null = null;

  /**
   * Initialize the factory with a data source
   * @param dataSource Data source to use for repositories (defaults to JsonDataSource)
   */
  static async initialize(dataSource?: IDataSource, dataSize?: DataSize | 'dynamic'): Promise<void> {
    if (!dataSource) {
      if (dataSize === 'dynamic') {
        // Use dynamically generated data
        console.log('RepositoryFactory: Using dynamically generated data');
        this.dataSource = new DynamicDataSource();
      } else if (dataSize) {
        // Use dataset with specified size loaded from JSON file
        console.log(`RepositoryFactory: Using ${dataSize} JSON dataset from file`);
        this.dataSource = new ExternalJsonDataSource(dataSize);
      } else {
        // Default to in-memory JsonDataSource
        console.log('RepositoryFactory: Using in-memory sample dataset');
        this.dataSource = new JsonDataSource('mock-data');
      }
    } else {
      this.dataSource = dataSource;
      console.log('RepositoryFactory: Using provided data source:', dataSource.constructor.name);
    }

    try {
      // Determine if we're using an API data source
      const isApiDataSource = this.dataSource.constructor.name === 'ApiDataSource';
      console.log(`RepositoryFactory: Using ${isApiDataSource ? 'API' : 'Local'} data source (${this.dataSource.constructor.name})`);

      // Initialize the data source
      console.log('RepositoryFactory: Initializing data source...');
      try {
        await this.dataSource.initialize();
        console.log('RepositoryFactory: Data source initialized successfully');
      } catch (initError) {
        console.error('RepositoryFactory: Data source initialization failed:', initError);
        // We need to re-throw this to properly propagate API errors
        throw initError;
      }

      // Test data access
      console.log('RepositoryFactory: Testing data access...');

      // Check if we're using an AI Agents API data source that doesn't support all operations
      const isAIAgentsApiDataSource = this.dataSource.constructor.name === 'AIAgentsApiDataSource';
      
      if (isAIAgentsApiDataSource) {
        console.log('RepositoryFactory: Using AI Agents API - testing AI agents access only');
        
        // Test AI agents access (supported by AI Agents API)
        const aiAgentRepo = this.getAIAgentRepository();
        const aiAgents = await aiAgentRepo.getAll();
        console.log('RepositoryFactory: AI Agents test -', {
          count: aiAgents.data.length,
          success: aiAgents.data.length >= 0 // 0 is valid for empty responses
        });

        // Test user access (limited support by AI Agents API)
        try {
          const userRepo = this.getUserRepository();
          const users = await userRepo.getAll();
          console.log('RepositoryFactory: Users test -', {
            count: users.data.length,
            success: users.data.length >= 0
          });
        } catch (userError) {
          console.log('RepositoryFactory: Users test - limited support, skipping');
        }
      } else {
        console.log('RepositoryFactory: Using full data source - testing all entities');
        
        // Test conversation access
        const conversationRepo = this.getConversationRepository();
        const conversations = await conversationRepo.getAll();
        console.log('RepositoryFactory: Conversation test -', {
          count: conversations.data.length,
          success: conversations.data.length > 0
        });

        // Test collection access
        const collectionRepo = this.getCollectionRepository();
        const collections = await collectionRepo.getAll();
        console.log('RepositoryFactory: Collection test -', {
          count: collections.data.length,
          success: collections.data.length > 0
        });

        // Test group access
        const groupRepo = this.getGroupRepository();
        const groups = await groupRepo.getAll();
        console.log('RepositoryFactory: Group test -', {
          count: groups.data.length,
          success: groups.data.length > 0
        });
      }
    } catch (error) {
      console.error('RepositoryFactory: Failed to initialize data source:', error);
      throw error;
    }
  }

  /**
   * Get the message repository
   */
  static getMessageRepository(): IMessageRepository {
    if (!this.dataSource) {
      throw new Error('RepositoryFactory not initialized');
    }

    return new MessageRepository(this.dataSource);
  }

  /**
   * Get the conversation repository
   */
  static getConversationRepository(): IConversationRepository {
    if (!this.dataSource) {
      throw new Error('RepositoryFactory not initialized');
    }

    return new ConversationRepository(this.dataSource);
  }

  /**
   * Get the collection repository
   */
  static getCollectionRepository(): ICollectionRepository {
    if (!this.dataSource) {
      throw new Error('RepositoryFactory not initialized');
    }

    return new CollectionRepository(this.dataSource);
  }

  /**
   * Get the group repository
   */
  static getGroupRepository(): IGroupRepository {
    if (!this.dataSource) {
      throw new Error('RepositoryFactory not initialized');
    }

    return new GroupRepository(this.dataSource);
  }

  /**
   * Get the AI agent repository
   */
  static getAIAgentRepository(): IAIAgentRepository {
    if (!this.dataSource) {
      throw new Error('RepositoryFactory not initialized');
    }

    return new AIAgentRepository(this.dataSource);
  }

  /**
   * Get the user repository
   */
  static getUserRepository(): IUserRepository {
    if (!this.dataSource) {
      throw new Error('RepositoryFactory not initialized');
    }

    return new UserRepository(this.dataSource);
  }
}