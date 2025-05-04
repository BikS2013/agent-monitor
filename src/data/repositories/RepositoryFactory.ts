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
      this.dataSource = new JsonDataSource('/path/to/data.json');
    } else {
      this.dataSource = dataSource;
    }
    
    // Initialize the data source
    await this.dataSource.initialize();
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