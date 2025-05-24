import { IDataSource } from '../sources/IDataSource';
import { ConversationsApiDataSource } from '../sources/ConversationsApiDataSource';
import { JsonDataSource } from '../sources/JsonDataSource';
import { DataSize } from '../jsonDataSource';

import {
  IMessageRepository,
  IConversationRepository,
  ICollectionRepository,
  IGroupRepository,
} from './interfaces';

import {
  MessageRepository,
  ConversationRepository,
  CollectionRepository,
  GroupRepository,
} from './implementations';

/**
 * Factory for creating repositories specifically for the Conversations page
 * This factory creates repositories that use the dedicated Conversations API
 */
export class ConversationsRepositoryFactory {
  private static dataSource: IDataSource | null = null;

  /**
   * Initialize the factory with a data source
   * @param dataSource Data source to use for repositories (defaults to ConversationsApiDataSource)
   */
  static async initialize(
    baseUrl: string,
    authMethod: 'none' | 'token' | 'api-key',
    authToken?: string,
    clientSecret?: string,
    clientId?: string,
    fallbackToLocal: boolean = true,
    dataSize?: DataSize
  ): Promise<void> {
    try {
      // Create the Conversations API data source
      const useNoAuth = authMethod === 'none';
      
      console.log('ConversationsRepositoryFactory: Creating ConversationsApiDataSource with settings:', {
        baseUrl,
        usingToken: authMethod === 'token',
        usingApiKey: authMethod === 'api-key',
        useNoAuth
      });
      
      this.dataSource = new ConversationsApiDataSource(
        baseUrl,
        authMethod === 'token' ? authToken : undefined,
        authMethod === 'api-key' ? clientSecret : undefined,
        authMethod === 'api-key' ? clientId : undefined,
        useNoAuth
      );
      
      // Initialize the data source
      console.log('ConversationsRepositoryFactory: Initializing data source...');
      try {
        await this.dataSource.initialize();
        console.log('ConversationsRepositoryFactory: Data source initialized successfully');
      } catch (initError) {
        console.error('ConversationsRepositoryFactory: Data source initialization failed:', initError);
        
        if (fallbackToLocal) {
          console.log('ConversationsRepositoryFactory: Falling back to local data source');
          this.dataSource = new JsonDataSource(dataSize || 'medium');
          await this.dataSource.initialize();
        } else {
          // We need to re-throw this to properly propagate API errors
          throw initError;
        }
      }

      // Test data access
      console.log('ConversationsRepositoryFactory: Testing data access...');

      // Test conversation access
      const conversationRepo = this.getConversationRepository();
      const conversations = await conversationRepo.getAll();
      console.log('ConversationsRepositoryFactory: Conversation test -', {
        count: conversations.data.length,
        success: conversations.data.length > 0
      });
    } catch (error) {
      console.error('ConversationsRepositoryFactory: Failed to initialize data source:', error);
      
      if (fallbackToLocal) {
        console.log('ConversationsRepositoryFactory: Falling back to local data source after error');
        this.dataSource = new JsonDataSource(dataSize || 'medium');
        await this.dataSource.initialize();
      } else {
        throw error;
      }
    }
  }

  /**
   * Get the message repository
   */
  static getMessageRepository(): IMessageRepository {
    if (!this.dataSource) {
      throw new Error('ConversationsRepositoryFactory not initialized');
    }

    return new MessageRepository(this.dataSource);
  }

  /**
   * Get the conversation repository
   */
  static getConversationRepository(): IConversationRepository {
    if (!this.dataSource) {
      throw new Error('ConversationsRepositoryFactory not initialized');
    }

    return new ConversationRepository(this.dataSource);
  }

  /**
   * Get the collection repository
   */
  static getCollectionRepository(): ICollectionRepository {
    if (!this.dataSource) {
      throw new Error('ConversationsRepositoryFactory not initialized');
    }

    return new CollectionRepository(this.dataSource);
  }

  /**
   * Get the group repository
   */
  static getGroupRepository(): IGroupRepository {
    if (!this.dataSource) {
      throw new Error('ConversationsRepositoryFactory not initialized');
    }

    return new GroupRepository(this.dataSource);
  }
}
