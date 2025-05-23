import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  AIAgent,
  Collection,
  Conversation,
  Group,
  Message,
  User
} from '../types';
import { IDataSource } from './IDataSource';
import { ApiClient } from '../api/ApiClient';

/**
 * API client implementation of the IDataSource interface.
 * This implementation communicates with a remote API server that follows
 * the Agent Monitor API Specification.
 */
export class ApiDataSource implements IDataSource {
  private apiClient: ApiClient;

  /**
   * Creates a new API data source client
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
   * Sets the authentication token for API requests
   * @param token JWT token for authentication
   */
  public setAuthToken(token: string): void {
    this.apiClient.setAuthToken(token);
  }

  /**
   * Clears the authentication token
   */
  public clearAuthToken(): void {
    this.apiClient.clearAuthToken();
  }

  /**
   * Initialize the data source
   */
  async initialize(): Promise<void> {
    try {
      console.log('ApiDataSource: Initializing with settings:', {
        baseUrl: this.apiClient['apiClient'].defaults.baseURL,
        noAuth: this.apiClient['noAuth'],
        hasToken: !!this.apiClient['authToken'],
        hasClientSecret: !!this.apiClient['clientSecret']
      });

      await this.apiClient.initialize();
      console.log('ApiDataSource: Successfully initialized API client');
    } catch (error) {
      console.error('ApiDataSource: Failed to initialize API data source:', error);
      console.error('ApiDataSource: Error message:', error.message);

      // This is important: we need to throw the error so it's propagated
      // to the RepositoryContext which can then fall back to local data
      throw error;
    }
  }

  /**
   * Save all data to persistent storage
   */
  async saveData(): Promise<void> {
    await this.apiClient.saveData();
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    await this.apiClient.clearCache();
  }

  // #region Message Methods

  /**
   * Message operations are not supported by the Main API
   * Use the Conversations API for message operations
   */
  async getMessageById(id: string): Promise<Message | null> {
    throw new Error('Message operations are not supported by the Main API. Please use the Conversations API.');
  }

  async getMessages(ids?: string[]): Promise<Record<string, Message>> {
    throw new Error('Message operations are not supported by the Main API. Please use the Conversations API.');
  }

  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    throw new Error('Message operations are not supported by the Main API. Please use the Conversations API.');
  }

  async createMessage(data: Omit<Message, 'id'>): Promise<Message> {
    throw new Error('Message operations are not supported by the Main API. Please use the Conversations API.');
  }

  async updateMessage(id: string, data: Partial<Message>): Promise<Message | null> {
    throw new Error('Message operations are not supported by the Main API. Please use the Conversations API.');
  }

  async deleteMessage(id: string): Promise<boolean> {
    throw new Error('Message operations are not supported by the Main API. Please use the Conversations API.');
  }

  // #endregion

  // #region Conversation Methods

  /**
   * Conversation operations are not supported by the Main API
   * Use the Conversations API for conversation operations
   */
  async getConversationById(id: string): Promise<Conversation | null> {
    throw new Error('Conversation operations are not supported by the Main API. Please use the Conversations API.');
  }

  async getConversations(ids?: string[]): Promise<Record<string, Conversation>> {
    throw new Error('Conversation operations are not supported by the Main API. Please use the Conversations API.');
  }

  async getConversationsByCollectionId(collectionId: string): Promise<Conversation[]> {
    throw new Error('Conversation operations are not supported by the Main API. Please use the Conversations API.');
  }

  async getConversationsByAIAgentId(aiAgentId: string): Promise<Conversation[]> {
    throw new Error('Conversation operations are not supported by the Main API. Please use the Conversations API.');
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    throw new Error('Conversation operations are not supported by the Main API. Please use the Conversations API.');
  }

  async createConversation(data: Omit<Conversation, 'id'>): Promise<Conversation> {
    throw new Error('Conversation operations are not supported by the Main API. Please use the Conversations API.');
  }

  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation | null> {
    throw new Error('Conversation operations are not supported by the Main API. Please use the Conversations API.');
  }

  async deleteConversation(id: string): Promise<boolean> {
    throw new Error('Conversation operations are not supported by the Main API. Please use the Conversations API.');
  }

  async filterConversations(filterCriteria: any): Promise<string[]> {
    throw new Error('Conversation operations are not supported by the Main API. Please use the Conversations API.');
  }

  // #endregion

  // #region Collection Methods

  /**
   * Collection operations are not supported by the Main API
   * Use the Conversations API for collection operations
   */
  async getCollectionById(id: string): Promise<Collection | null> {
    throw new Error('Collection operations are not supported by the Main API. Please use the Conversations API.');
  }

  async getCollections(ids?: string[]): Promise<Record<string, Collection>> {
    throw new Error('Collection operations are not supported by the Main API. Please use the Conversations API.');
  }

  async getCollectionsByGroupId(groupId: string): Promise<Collection[]> {
    throw new Error('Collection operations are not supported by the Main API. Please use the Conversations API.');
  }

  async getCollectionsByCreatorId(creatorId: string): Promise<Collection[]> {
    throw new Error('Collection operations are not supported by the Main API. Please use the Conversations API.');
  }

  async createCollection(data: Omit<Collection, 'id'>): Promise<Collection> {
    throw new Error('Collection operations are not supported by the Main API. Please use the Conversations API.');
  }

  async updateCollection(id: string, data: Partial<Collection>): Promise<Collection | null> {
    throw new Error('Collection operations are not supported by the Main API. Please use the Conversations API.');
  }

  async deleteCollection(id: string): Promise<boolean> {
    throw new Error('Collection operations are not supported by the Main API. Please use the Conversations API.');
  }

  // #endregion

  // #region Group Methods

  /**
   * Group operations are not supported by the Main API
   * Use the Conversations API for group operations
   */
  async getGroupById(id: string): Promise<Group | null> {
    throw new Error('Group operations are not supported by the Main API. Please use the Conversations API.');
  }

  async getGroups(ids?: string[]): Promise<Record<string, Group>> {
    throw new Error('Group operations are not supported by the Main API. Please use the Conversations API.');
  }

  async getGroupsByAdminUserId(userId: string): Promise<Group[]> {
    throw new Error('Group operations are not supported by the Main API. Please use the Conversations API.');
  }

  async createGroup(data: Omit<Group, 'id'>): Promise<Group> {
    throw new Error('Group operations are not supported by the Main API. Please use the Conversations API.');
  }

  async updateGroup(id: string, data: Partial<Group>): Promise<Group | null> {
    throw new Error('Group operations are not supported by the Main API. Please use the Conversations API.');
  }

  async deleteGroup(id: string): Promise<boolean> {
    throw new Error('Group operations are not supported by the Main API. Please use the Conversations API.');
  }

  // #endregion

  // #region AI Agent Methods

  /**
   * AI Agent operations are not supported by the Main API
   * Use the AI Agents API for AI agent operations
   */
  async getAIAgentById(id: string): Promise<AIAgent | null> {
    throw new Error('AI Agent operations are not supported by the Main API. Please use the AI Agents API.');
  }

  async getAIAgents(ids?: string[]): Promise<Record<string, AIAgent>> {
    throw new Error('AI Agent operations are not supported by the Main API. Please use the AI Agents API.');
  }

  async getAIAgentsByStatus(status: 'active' | 'inactive' | 'training'): Promise<AIAgent[]> {
    throw new Error('AI Agent operations are not supported by the Main API. Please use the AI Agents API.');
  }

  async createAIAgent(data: Omit<AIAgent, 'id'>): Promise<AIAgent> {
    throw new Error('AI Agent operations are not supported by the Main API. Please use the AI Agents API.');
  }

  async updateAIAgent(id: string, data: Partial<AIAgent>): Promise<AIAgent | null> {
    throw new Error('AI Agent operations are not supported by the Main API. Please use the AI Agents API.');
  }

  async deleteAIAgent(id: string): Promise<boolean> {
    throw new Error('AI Agent operations are not supported by the Main API. Please use the AI Agents API.');
  }

  // #endregion

  // #region User Methods

  /**
   * Get a specific user by ID
   * @param id User ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const user = await this.apiClient.getUser(id);
      if (!user) return null;

      return this.transformApiUser(user);
    } catch (error) {
      console.error(`Failed to get user ${id}:`, error);
      return null;
    }
  }

  /**
   * Get multiple users by their IDs
   * @param ids Optional array of user IDs. If not provided, returns all users
   */
  async getUsers(ids?: string[]): Promise<Record<string, User>> {
    try {
      const result = await this.apiClient.getUsers(ids);

      // Handle different response formats
      if (typeof result === 'object' && !Array.isArray(result)) {
        // Object format with IDs as keys
        return Object.entries(result).reduce((acc, [id, user]) => {
          acc[id] = this.transformApiUser(user);
          return acc;
        }, {} as Record<string, User>);
      } else if (Array.isArray(result)) {
        // Array format
        return result.reduce((acc, user) => {
          const transformed = this.transformApiUser(user);
          acc[transformed.id] = transformed;
          return acc;
        }, {} as Record<string, User>);
      }

      // Fallback for unknown format
      return {};
    } catch (error) {
      console.error('Failed to get users:', error);
      return {};
    }
  }

  /**
   * Get all users with a specific role
   * @param role User role (admin, supervisor, or executive)
   */
  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const users = await this.apiClient.getUsersByRole(role);
      return Array.isArray(users)
        ? users.map(user => this.transformApiUser(user))
        : [];
    } catch (error) {
      console.error(`Failed to get users with role ${role}:`, error);
      return [];
    }
  }

  /**
   * Create a new user
   * @param data User data without the ID
   */
  async createUser(data: Omit<User, 'id'>): Promise<User> {
    try {
      const apiData = this.prepareUserForApi(data as User);
      const result = await this.apiClient.createUser(apiData);
      return this.transformApiUser(result);
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  /**
   * Update an existing user
   * @param id User ID
   * @param data Partial user data to update
   */
  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    try {
      const apiData = this.prepareUserForApi(data as User);
      const result = await this.apiClient.updateUser(id, apiData);
      if (!result) return null;
      return this.transformApiUser(result);
    } catch (error) {
      console.error(`Failed to update user ${id}:`, error);
      return null;
    }
  }

  /**
   * Delete a user
   * @param id User ID
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      return await this.apiClient.deleteUser(id);
    } catch (error) {
      console.error(`Failed to delete user ${id}:`, error);
      return false;
    }
  }

  /**
   * Get the currently authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await this.apiClient.getCurrentUser();
      if (!user) return null;

      return this.transformApiUser(user);
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  // #endregion

  // #region Transformation Methods






  /**
   * Transform API user format to app format
   */
  private transformApiUser(apiUser: any): User {
    // Create the user object in our app format
    return {
      id: apiUser.id,
      username: apiUser.username || '',
      email: apiUser.email || '',
      fullName: apiUser.fullName || apiUser.full_name || '',
      role: apiUser.role || 'user',
      createdAt: apiUser.createdAt || apiUser.created_at || new Date().toISOString(),
      lastActive: apiUser.lastActive || apiUser.last_active || new Date().toISOString(),
      settings: apiUser.settings || {},
      metadata: apiUser.metadata || {},
      isActive: apiUser.isActive || apiUser.is_active || true
    };
  }

  // #endregion

  // #region Preparation Methods





  /**
   * Prepare user data for API
   */
  private prepareUserForApi(user: Partial<User>): any {
    // Create a copy to avoid modifying the original
    const apiData: any = { ...user };

    // Convert snake_case to camelCase if needed
    if (apiData.full_name === undefined && apiData.fullName !== undefined) {
      apiData.full_name = apiData.fullName;
      delete apiData.fullName;
    }

    if (apiData.last_active === undefined && apiData.lastActive !== undefined) {
      apiData.last_active = apiData.lastActive;
      delete apiData.lastActive;
    }

    if (apiData.is_active === undefined && apiData.isActive !== undefined) {
      apiData.is_active = apiData.isActive;
      delete apiData.isActive;
    }

    return apiData;
  }

  // #endregion
}