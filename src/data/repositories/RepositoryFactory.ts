import { IDataSource } from '../sources/IDataSource';
import { JsonDataSource } from '../sources/JsonDataSource';

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
  static async initialize(dataSource?: IDataSource): Promise<void> {
    if (!dataSource) {
      // Default to JsonDataSource if none provided
      // We don't need a real file path since we're directly importing from sampleData.ts
      this.dataSource = new JsonDataSource('mock-data');
    } else {
      this.dataSource = dataSource;
    }

    try {
      // Initialize the data source
      console.log('RepositoryFactory: Initializing data source...');
      await this.dataSource.initialize();
      console.log('RepositoryFactory: Data source initialized successfully');

      // Test data access
      console.log('RepositoryFactory: Testing data access...');

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