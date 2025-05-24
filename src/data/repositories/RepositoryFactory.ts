import { IDataSource } from '../sources/IDataSource';
import { IGroupDataSource } from '../sources/interfaces/IGroupDataSource';
import { ICollectionDataSource } from '../sources/interfaces/ICollectionDataSource';
import { JsonDataSource } from '../sources/JsonDataSource';
import { DynamicDataSource } from '../sources/DynamicDataSource';
import { GroupApiDataSource } from '../sources/GroupApiDataSource';
import { CollectionsApiDataSource } from '../sources/CollectionsApiDataSource';
import { AIAgentsApiDataSource } from '../sources/AIAgentsApiDataSource';
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
  private static groupDataSource: IDataSource | IGroupDataSource | null = null;
  private static collectionsDataSource: IDataSource | ICollectionDataSource | null = null;

  /**
   * Initialize the factory with a data source
   * @param dataSource Data source to use for repositories (defaults to JsonDataSource)
   * @param groupDataSource Optional separate data source for groups
   * @param collectionsDataSource Optional separate data source for collections
   */
  static async initialize(dataSource?: IDataSource, dataSize?: DataSize | 'dynamic', groupDataSource?: IDataSource | IGroupDataSource, collectionsDataSource?: IDataSource | ICollectionDataSource): Promise<void> {
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

    // Set up group data source
    if (groupDataSource) {
      this.groupDataSource = groupDataSource;
      console.log('RepositoryFactory: Using separate group data source:', groupDataSource.constructor.name);
    } else {
      this.groupDataSource = this.dataSource;
      console.log('RepositoryFactory: Using main data source for groups');
    }

    // Set up collections data source
    if (collectionsDataSource) {
      this.collectionsDataSource = collectionsDataSource;
      console.log('RepositoryFactory: Using separate collections data source:', collectionsDataSource.constructor.name);
    } else {
      // Check if Collections API is enabled
      const collectionsApiEnabled = localStorage.getItem('collectionsApiEnabled') === 'true';
      if (collectionsApiEnabled) {
        console.log('RepositoryFactory: Collections API is enabled, creating Collections API data source');
        const baseUrl = localStorage.getItem('collectionsApiBaseUrl') || 'http://localhost:8002';
        const authToken = localStorage.getItem('collectionsApiToken');
        const clientSecret = localStorage.getItem('collectionsApiClientSecret');
        const clientId = localStorage.getItem('collectionsApiClientId');
        const noAuth = localStorage.getItem('collectionsApiAuthMethod') === 'none';
        
        this.collectionsDataSource = new CollectionsApiDataSource(
          baseUrl,
          authToken,
          clientSecret,
          clientId,
          noAuth
        );
        console.log('RepositoryFactory: Created Collections API data source with settings:', {
          baseUrl,
          hasToken: !!authToken,
          hasClientSecret: !!clientSecret,
          noAuth
        });
      } else {
        this.collectionsDataSource = this.dataSource;
        console.log('RepositoryFactory: Using main data source for collections');
      }
    }

    try {
      // Determine if we're using an API data source
      const isApiDataSource = this.dataSource.constructor.name === 'ApiDataSource';
      console.log(`RepositoryFactory: Using ${isApiDataSource ? 'API' : 'Local'} data source (${this.dataSource.constructor.name})`);

      // Initialize the main data source
      console.log('RepositoryFactory: Initializing main data source...');
      try {
        await this.dataSource.initialize();
        console.log('RepositoryFactory: Main data source initialized successfully');
      } catch (initError) {
        console.error('RepositoryFactory: Main data source initialization failed:', initError);
        // We need to re-throw this to properly propagate API errors
        throw initError;
      }

      // Initialize the group data source if it's different from the main data source
      if (this.groupDataSource !== this.dataSource) {
        console.log('RepositoryFactory: Initializing separate group data source...');
        try {
          await this.groupDataSource.initialize();
          console.log('RepositoryFactory: Group data source initialized successfully');
        } catch (groupInitError) {
          console.error('RepositoryFactory: Group data source initialization failed:', groupInitError);
          console.log('RepositoryFactory: Falling back to main data source for groups');
          this.groupDataSource = this.dataSource;
        }
      }

      // Initialize the collections data source if it's different from the main data source
      if (this.collectionsDataSource !== this.dataSource) {
        console.log('RepositoryFactory: Initializing separate collections data source...');
        try {
          await this.collectionsDataSource.initialize();
          console.log('RepositoryFactory: Collections data source initialized successfully');
        } catch (collectionsInitError) {
          console.error('RepositoryFactory: Collections data source initialization failed:', collectionsInitError);
          console.log('RepositoryFactory: Falling back to main data source for collections');
          this.collectionsDataSource = this.dataSource;
        }
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
          success: groups.data.length > 0,
          usingDedicatedSource: this.groupDataSource !== this.dataSource
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
    if (!this.collectionsDataSource) {
      throw new Error('RepositoryFactory not initialized');
    }

    return new CollectionRepository(this.collectionsDataSource);
  }

  /**
   * Get the group repository
   */
  static getGroupRepository(): IGroupRepository {
    if (!this.groupDataSource) {
      throw new Error('RepositoryFactory not initialized');
    }

    return new GroupRepository(this.groupDataSource);
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

  /**
   * Set the group data source independently
   * @param groupDataSource Data source specifically for groups
   */
  static async setGroupDataSource(groupDataSource: IDataSource | IGroupDataSource): Promise<void> {
    try {
      console.log('RepositoryFactory: Setting independent group data source:', groupDataSource.constructor.name);
      await groupDataSource.initialize();
      this.groupDataSource = groupDataSource;
      console.log('RepositoryFactory: Group data source set successfully');
    } catch (error) {
      console.error('RepositoryFactory: Failed to set group data source:', error);
      throw error;
    }
  }

  /**
   * Set the collections data source independently
   * @param collectionsDataSource Data source specifically for collections
   */
  static async setCollectionsDataSource(collectionsDataSource: IDataSource | ICollectionDataSource): Promise<void> {
    try {
      console.log('RepositoryFactory: Setting independent collections data source:', collectionsDataSource.constructor.name);
      await collectionsDataSource.initialize();
      this.collectionsDataSource = collectionsDataSource;
      console.log('RepositoryFactory: Collections data source set successfully');
    } catch (error) {
      console.error('RepositoryFactory: Failed to set collections data source:', error);
      throw error;
    }
  }
}