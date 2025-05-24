import {
  AIAgent,
  Collection,
  Conversation,
  FilterElement,
  Group,
  Message,
  User
} from '../types';
import { IDataSource } from './IDataSource';
import { ApiClient } from '../api/ApiClient';

/**
 * API client implementation specifically for Group operations.
 * This implementation communicates with the main API server for group management.
 */
export class GroupApiDataSource implements IDataSource {
  private apiClient: ApiClient;

  /**
   * Creates a new Group API data source client
   * @param baseUrl The base URL of the API server
   * @param authToken Optional JWT authentication token
   * @param clientSecret Optional client secret for API key authentication
   * @param clientId Optional client ID for API key authentication
   * @param noAuth Whether to disable authentication (no token or API key)
   */
  constructor(
    baseUrl: string = 'http://localhost:8000',
    authToken?: string,
    clientSecret?: string,
    clientId?: string,
    noAuth: boolean = false
  ) {
    this.apiClient = new ApiClient(baseUrl, authToken, clientSecret, clientId, noAuth);
  }

  /**
   * Initialize the data source
   */
  async initialize(): Promise<void> {
    try {
      console.log('GroupApiDataSource: Initializing with settings:', {
        baseUrl: this.apiClient['apiClient'].defaults.baseURL,
        noAuth: this.apiClient['noAuth'],
        hasToken: !!this.apiClient['authToken'],
        hasClientSecret: !!this.apiClient['clientSecret']
      });

      await this.apiClient.initialize();
      console.log('GroupApiDataSource: Successfully initialized API client');
    } catch (error) {
      console.error('GroupApiDataSource: Failed to initialize data source:', error);
      console.error('GroupApiDataSource: Error message:', (error as Error).message);
      throw error;
    }
  }

  // #region Message Methods - Not Supported

  async getMessageById(id: string): Promise<Message | null> {
    console.warn('getMessageById not supported by Group API');
    return null;
  }

  async getMessages(ids?: string[]): Promise<Record<string, Message>> {
    console.warn('getMessages not supported by Group API');
    return {};
  }

  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    console.warn('getMessagesByConversationId not supported by Group API');
    return [];
  }

  async createMessage(data: Omit<Message, 'id'>): Promise<Message> {
    console.warn('createMessage not supported by Group API');
    return {
      ...data as any,
      id: `msg_${Date.now()}`,
    };
  }

  async updateMessage(id: string, data: Partial<Message>): Promise<Message | null> {
    console.warn('updateMessage not supported by Group API');
    return null;
  }

  async deleteMessage(id: string): Promise<boolean> {
    console.warn('deleteMessage not supported by Group API');
    return false;
  }

  // #endregion

  // #region Conversation Methods - Not Supported

  async getConversationById(id: string): Promise<Conversation | null> {
    console.warn('getConversationById not supported by Group API');
    return null;
  }

  async getConversations(ids?: string[]): Promise<Record<string, Conversation>> {
    console.warn('getConversations not supported by Group API');
    return {};
  }

  async getConversationsByCollectionId(collectionId: string): Promise<Conversation[]> {
    console.warn('getConversationsByCollectionId not supported by Group API');
    return [];
  }

  async getConversationsByAIAgentId(aiAgentId: string): Promise<Conversation[]> {
    console.warn('getConversationsByAIAgentId not supported by Group API');
    return [];
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    console.warn('getConversationsByUserId not supported by Group API');
    return [];
  }

  async createConversation(data: Omit<Conversation, 'thread_id'>): Promise<Conversation> {
    console.warn('createConversation not supported by Group API');
    return {
      ...data as any,
      thread_id: `thread_${Date.now()}`,
    };
  }

  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation | null> {
    console.warn('updateConversation not supported by Group API');
    return null;
  }

  async deleteConversation(id: string): Promise<boolean> {
    console.warn('deleteConversation not supported by Group API');
    return false;
  }

  // #endregion

  // #region Collection Methods - Not Supported

  async getCollectionById(id: string): Promise<Collection | null> {
    console.warn('getCollectionById not supported by Group API');
    return null;
  }

  async getCollections(ids?: string[]): Promise<Record<string, Collection>> {
    console.warn('getCollections not supported by Group API');
    return {};
  }

  async getCollectionsByGroupId(groupId: string): Promise<Collection[]> {
    console.warn('getCollectionsByGroupId not supported by Group API');
    return [];
  }

  async getCollectionsByCreatorId(creatorId: string): Promise<Collection[]> {
    console.warn('getCollectionsByCreatorId not supported by Group API');
    return [];
  }

  async createCollection(data: Omit<Collection, 'id'>): Promise<Collection> {
    console.warn('createCollection not supported by Group API');
    return {
      ...data as any,
      id: `coll_${Date.now()}`,
    };
  }

  async updateCollection(id: string, data: Partial<Collection>): Promise<Collection | null> {
    console.warn('updateCollection not supported by Group API');
    return null;
  }

  async deleteCollection(id: string): Promise<boolean> {
    console.warn('deleteCollection not supported by Group API');
    return false;
  }

  // #endregion

  // #region Group Methods

  /**
   * Get a specific group by ID
   * @param id Group ID
   */
  async getGroupById(id: string): Promise<Group | null> {
    try {
      const group = await this.apiClient.getGroup(id);
      if (!group) return null;

      return this.transformApiGroup(group);
    } catch (error) {
      console.error(`Failed to get group ${id}:`, error);
      return null;
    }
  }

  /**
   * Get multiple groups by their IDs
   * @param ids Optional array of group IDs. If not provided, returns all groups
   */
  async getGroups(ids?: string[]): Promise<Record<string, Group>> {
    try {
      const result = await this.apiClient.getGroups(ids);
      console.log('GroupApiDataSource.getGroups: Raw API response:', result);

      let groups: any[] = [];

      // Handle different response formats
      if (result && typeof result === 'object' && !Array.isArray(result)) {
        // Check if response has items wrapper
        if (result.items && Array.isArray(result.items)) {
          console.log('GroupApiDataSource.getGroups: Found items wrapper with', result.items.length, 'groups');
          groups = result.items;
        } else {
          // Object format with IDs as keys (legacy)
          console.log('GroupApiDataSource.getGroups: Processing object format with keys:', Object.keys(result));
          return Object.entries(result).reduce((acc, [key, group]) => {
            // Skip if this is the 'items' key
            if (key === 'items') return acc;
            
            console.log(`GroupApiDataSource.getGroups: Processing group with key ${key}:`, group);
            const transformed = this.transformApiGroup(group as any);
            // Use the group's actual ID if available, otherwise use the key
            const groupId = transformed.id || group.id || key;
            console.log(`GroupApiDataSource.getGroups: Transformed group ${groupId}:`, transformed);
            acc[groupId] = { ...transformed, id: groupId };
            return acc;
          }, {} as Record<string, Group>);
        }
      } else if (Array.isArray(result)) {
        // Direct array format
        console.log('GroupApiDataSource.getGroups: Direct array format with', result.length, 'groups');
        groups = result;
      }

      // Transform array to record with IDs as keys
      const groupsRecord = groups.reduce((acc, group) => {
        const transformed = this.transformApiGroup(group);
        const groupId = transformed.id || group.id;
        if (groupId) {
          acc[groupId] = transformed;
        }
        return acc;
      }, {} as Record<string, Group>);

      console.log('GroupApiDataSource.getGroups: Returning', Object.keys(groupsRecord).length, 'groups');
      return groupsRecord;
    } catch (error) {
      console.error('Failed to get groups:', error);
      return {};
    }
  }

  /**
   * Get all groups administered by a specific user
   * @param userId User ID
   */
  async getGroupsByAdminUserId(userId: string): Promise<Group[]> {
    try {
      const groups = await this.apiClient.getGroupsByAdminUser(userId);
      return Array.isArray(groups)
        ? groups.map(group => this.transformApiGroup(group))
        : [];
    } catch (error) {
      console.error(`Failed to get admin groups for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Create a new group
   * @param data Group data without the ID
   */
  async createGroup(data: Omit<Group, 'id'>): Promise<Group> {
    try {
      const apiData = this.prepareGroupForApi(data as Group);
      const result = await this.apiClient.createGroup(apiData);
      return this.transformApiGroup(result);
    } catch (error) {
      console.error('Failed to create group:', error);
      throw error;
    }
  }

  /**
   * Update an existing group
   * @param id Group ID
   * @param data Updated group data
   */
  async updateGroup(id: string, data: Partial<Group>): Promise<Group | null> {
    try {
      const apiData = this.prepareGroupForApi(data as Group);
      const result = await this.apiClient.updateGroup(id, apiData);
      if (!result) return null;
      return this.transformApiGroup(result);
    } catch (error) {
      console.error(`Failed to update group ${id}:`, error);
      return null;
    }
  }

  /**
   * Delete a group
   * @param id Group ID
   */
  async deleteGroup(id: string): Promise<boolean> {
    try {
      return await this.apiClient.deleteGroup(id);
    } catch (error) {
      console.error(`Failed to delete group ${id}:`, error);
      return false;
    }
  }

  // #endregion

  // #region AI Agent Methods - Not Supported

  async getAIAgentById(id: string): Promise<AIAgent | null> {
    console.warn('getAIAgentById not supported by Group API');
    return null;
  }

  async getAIAgents(ids?: string[]): Promise<Record<string, AIAgent>> {
    console.warn('getAIAgents not supported by Group API');
    return {};
  }

  async getAIAgentsByStatus(status: 'active' | 'inactive' | 'training'): Promise<AIAgent[]> {
    console.warn('getAIAgentsByStatus not supported by Group API');
    return [];
  }

  async createAIAgent(data: Omit<AIAgent, 'id'>): Promise<AIAgent> {
    console.warn('createAIAgent not supported by Group API');
    return {
      ...data as any,
      id: `agent_${Date.now()}`,
    };
  }

  async updateAIAgent(id: string, data: Partial<AIAgent>): Promise<AIAgent | null> {
    console.warn('updateAIAgent not supported by Group API');
    return null;
  }

  async deleteAIAgent(id: string): Promise<boolean> {
    console.warn('deleteAIAgent not supported by Group API');
    return false;
  }

  // #endregion

  // #region User Methods - Not Supported

  async getUserById(id: string): Promise<User | null> {
    console.warn('getUserById not supported by Group API');
    return null;
  }

  async getUsers(ids?: string[]): Promise<Record<string, User>> {
    console.warn('getUsers not supported by Group API');
    return {};
  }

  async getUsersByRole(role: string): Promise<User[]> {
    console.warn('getUsersByRole not supported by Group API');
    return [];
  }

  async createUser(data: Omit<User, 'id'>): Promise<User> {
    console.warn('createUser not supported by Group API');
    return {
      ...data as any,
      id: `user_${Date.now()}`,
    };
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    console.warn('updateUser not supported by Group API');
    return null;
  }

  async deleteUser(id: string): Promise<boolean> {
    console.warn('deleteUser not supported by Group API');
    return false;
  }

  async getCurrentUser(): Promise<User | null> {
    console.warn('getCurrentUser not supported by Group API');
    return null;
  }

  // #endregion

  // #region Query Methods - Not Supported

  async filterConversations(filterCriteria: any): Promise<string[]> {
    console.warn('filterConversations not supported by Group API');
    return [];
  }

  // #endregion

  // #region Data Maintenance Methods

  async saveData(): Promise<void> {
    console.warn('saveData not implemented for Group API');
  }

  async clearCache(): Promise<void> {
    console.warn('clearCache not implemented for Group API');
  }

  // #endregion

  // #region Helper Methods

  /**
   * Transform API group format to app format
   */
  private transformApiGroup(apiGroup: any): Group {
    // Create the group object in our app format
    return {
      id: apiGroup.id,
      name: apiGroup.name || '',
      description: apiGroup.description || '',
      createdAt: apiGroup.createdAt || apiGroup.created_at || new Date().toISOString(),
      updatedAt: apiGroup.updatedAt || apiGroup.updated_at || new Date().toISOString(),
      adminIds: Array.isArray(apiGroup.adminIds)
                ? apiGroup.adminIds
                : (apiGroup.admin_ids || []),
      collectionIds: Array.isArray(apiGroup.collectionIds)
                     ? apiGroup.collectionIds
                     : (apiGroup.collection_ids || []),
      userIds: Array.isArray(apiGroup.userIds)
               ? apiGroup.userIds
               : (apiGroup.user_ids || []),
      purpose: apiGroup.purpose || '',
      metadata: apiGroup.metadata || {},
      isPrivate: apiGroup.isPrivate || apiGroup.is_private || false,
      permissionLevels: apiGroup.permissionLevels || apiGroup.permission_levels || {}
    };
  }

  /**
   * Prepare group data for API
   */
  private prepareGroupForApi(group: Partial<Group>): any {
    // Create a copy to avoid modifying the original
    const apiData: any = { ...group };

    // Convert snake_case to camelCase if needed
    if (apiData.admin_ids === undefined && apiData.adminIds !== undefined) {
      apiData.admin_ids = apiData.adminIds;
      delete apiData.adminIds;
    }

    if (apiData.collection_ids === undefined && apiData.collectionIds !== undefined) {
      apiData.collection_ids = apiData.collectionIds;
      delete apiData.collectionIds;
    }

    if (apiData.user_ids === undefined && apiData.userIds !== undefined) {
      apiData.user_ids = apiData.userIds;
      delete apiData.userIds;
    }

    if (apiData.is_private === undefined && apiData.isPrivate !== undefined) {
      apiData.is_private = apiData.isPrivate;
      delete apiData.isPrivate;
    }

    if (apiData.permission_levels === undefined && apiData.permissionLevels !== undefined) {
      apiData.permission_levels = apiData.permissionLevels;
      delete apiData.permissionLevels;
    }

    return apiData;
  }

  // #endregion
}