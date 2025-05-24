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
 * AI Agents API client implementation of the IDataSource interface.
 * This implementation is dedicated to AI Agents operations and can be configured
 * independently from other API data sources.
 */
export class AIAgentsApiDataSource implements IDataSource {
  private apiClient: ApiClient;

  /**
   * Creates a new AI Agents API data source client
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
      console.log('AIAgentsApiDataSource: Initializing with settings:', {
        baseUrl: this.apiClient['apiClient'].defaults.baseURL,
        noAuth: this.apiClient['noAuth'],
        hasToken: !!this.apiClient['authToken'],
        hasClientSecret: !!this.apiClient['clientSecret']
      });

      await this.apiClient.initialize();
      console.log('AIAgentsApiDataSource: Successfully initialized API client');
    } catch (error) {
      console.error('AIAgentsApiDataSource: Failed to initialize API data source:', error);
      console.error('AIAgentsApiDataSource: Error message:', (error as Error).message);

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

  // #region AI Agent Methods

  /**
   * Get a specific AI agent by ID
   * @param id AI agent ID
   */
  async getAIAgentById(id: string): Promise<AIAgent | null> {
    try {
      const agent = await this.apiClient.getAIAgent(id);
      if (!agent) return null;

      return this.transformApiAIAgent(agent);
    } catch (error) {
      console.error(`Failed to get AI agent ${id}:`, error);
      return null;
    }
  }

  /**
   * Get multiple AI agents by their IDs
   * @param ids Optional array of AI agent IDs. If not provided, returns all AI agents
   */
  async getAIAgents(ids?: string[]): Promise<Record<string, AIAgent>> {
    try {
      const result = await this.apiClient.getAIAgents(ids);

      // Handle null/undefined result
      if (!result) {
        console.log('AIAgentsApiDataSource: API returned null/undefined for AI agents');
        return {};
      }

      console.log('AIAgentsApiDataSource: Raw API response for AI agents:', result);

      // Handle API response with "items" wrapper (common API pattern)
      let agentsData = result;
      if (result && typeof result === 'object' && result.items && Array.isArray(result.items)) {
        console.log('AIAgentsApiDataSource: Using items array from wrapped response');
        agentsData = result.items;
      }

      // Handle different response formats
      if (Array.isArray(agentsData)) {
        // Array format (including from items wrapper)
        return agentsData.reduce((acc, agent) => {
          if (agent && typeof agent === 'object') {
            const transformed = this.transformApiAIAgent(agent);
            acc[transformed.id] = transformed;
          }
          return acc;
        }, {} as Record<string, AIAgent>);
      } else if (typeof agentsData === 'object' && !Array.isArray(agentsData)) {
        // Object format with IDs as keys
        return Object.entries(agentsData).reduce((acc, [id, agent]) => {
          if (agent && typeof agent === 'object') {
            acc[id] = this.transformApiAIAgent(agent);
          }
          return acc;
        }, {} as Record<string, AIAgent>);
      }

      // Fallback for unknown format
      console.warn('AIAgentsApiDataSource: Unknown response format for AI agents:', typeof agentsData);
      return {};
    } catch (error) {
      console.error('Failed to get AI agents:', error);
      return {};
    }
  }

  /**
   * Get all AI agents with a specific status
   * @param status Status of the AI agent (active, inactive, or training)
   */
  async getAIAgentsByStatus(status: 'active' | 'inactive' | 'training'): Promise<AIAgent[]> {
    try {
      const agents = await this.apiClient.getAIAgentsByStatus(status);
      return Array.isArray(agents)
        ? agents.map(agent => this.transformApiAIAgent(agent))
        : [];
    } catch (error) {
      console.error(`Failed to get AI agents with status ${status}:`, error);
      return [];
    }
  }

  /**
   * Create a new AI agent
   * @param data AI agent data without the ID
   */
  async createAIAgent(data: Omit<AIAgent, 'id'>): Promise<AIAgent> {
    try {
      const apiData = this.prepareAIAgentForApi(data as AIAgent);
      const result = await this.apiClient.createAIAgent(apiData);
      return this.transformApiAIAgent(result);
    } catch (error) {
      console.error('Failed to create AI agent:', error);
      throw error;
    }
  }

  /**
   * Update an existing AI agent
   * @param id AI agent ID
   * @param data Partial AI agent data to update
   */
  async updateAIAgent(id: string, data: Partial<AIAgent>): Promise<AIAgent | null> {
    try {
      const apiData = this.prepareAIAgentForApi(data as AIAgent);
      const result = await this.apiClient.updateAIAgent(id, apiData);
      if (!result) return null;
      return this.transformApiAIAgent(result);
    } catch (error) {
      console.error(`Failed to update AI agent ${id}:`, error);
      return null;
    }
  }

  /**
   * Delete an AI agent
   * @param id AI agent ID
   */
  async deleteAIAgent(id: string): Promise<boolean> {
    try {
      return await this.apiClient.deleteAIAgent(id);
    } catch (error) {
      console.error(`Failed to delete AI agent ${id}:`, error);
      return false;
    }
  }

  // #endregion

  // #region User Methods (AI Agents API focuses on agents, users are read-only)

  /**
   * Get a specific user by ID (limited support in AI Agents API)
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const user = await this.apiClient.getUser(id);
      if (!user) return null;

      return this.transformApiUser(user);
    } catch (error) {
      console.error(`AI Agents API: Limited user support - failed to get user ${id}:`, error);
      return null;
    }
  }

  /**
   * Get multiple users by their IDs
   */
  async getUsers(ids?: string[]): Promise<Record<string, User>> {
    try {
      const result = await this.apiClient.getUsers(ids);

      // Handle null/undefined result
      if (!result) {
        console.log('AIAgentsApiDataSource: API returned null/undefined for users');
        return {};
      }

      console.log('AIAgentsApiDataSource: Raw API response for users:', result);

      // Handle API response with "items" wrapper (common API pattern)
      let usersData = result;
      if (result && typeof result === 'object' && result.items && Array.isArray(result.items)) {
        console.log('AIAgentsApiDataSource: Using items array from wrapped response');
        usersData = result.items;
      }

      // Handle different response formats
      if (Array.isArray(usersData)) {
        // Array format (including from items wrapper)
        return usersData.reduce((acc, user) => {
          if (user && typeof user === 'object') {
            const transformed = this.transformApiUser(user);
            acc[transformed.id] = transformed;
          }
          return acc;
        }, {} as Record<string, User>);
      } else if (typeof usersData === 'object' && !Array.isArray(usersData)) {
        // Object format with IDs as keys
        return Object.entries(usersData).reduce((acc, [id, user]) => {
          if (user && typeof user === 'object') {
            acc[id] = this.transformApiUser(user);
          }
          return acc;
        }, {} as Record<string, User>);
      }

      // Fallback for unknown format
      console.warn('AIAgentsApiDataSource: Unknown response format for users:', typeof usersData);
      return {};
    } catch (error) {
      console.error('AI Agents API: Limited user support - failed to get users:', error);
      return {};
    }
  }

  /**
   * Get all users with a specific role (limited support)
   */
  async getUsersByRole(role: string): Promise<User[]> {
    console.warn('AI Agents API: getUsersByRole has limited support');
    return [];
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
      console.error('AI Agents API: Failed to get current user:', error);
      return null;
    }
  }

  // User modification operations are not supported by AI Agents API
  async createUser(data: Omit<User, 'id'>): Promise<User> {
    throw new Error('User creation is not supported by the AI Agents API');
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    throw new Error('User updates are not supported by the AI Agents API');
  }

  async deleteUser(id: string): Promise<boolean> {
    throw new Error('User deletion is not supported by the AI Agents API');
  }

  // #endregion

  // #region Non-AI Agent Methods (Not supported by AI Agents API)

  // Messages
  async getMessageById(id: string): Promise<Message | null> {
    throw new Error('Message operations are not supported by the AI Agents API');
  }

  async getMessages(ids?: string[]): Promise<Record<string, Message>> {
    throw new Error('Message operations are not supported by the AI Agents API');
  }

  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    throw new Error('Message operations are not supported by the AI Agents API');
  }

  async createMessage(data: Omit<Message, 'id'>): Promise<Message> {
    throw new Error('Message operations are not supported by the AI Agents API');
  }

  async updateMessage(id: string, data: Partial<Message>): Promise<Message | null> {
    throw new Error('Message operations are not supported by the AI Agents API');
  }

  async deleteMessage(id: string): Promise<boolean> {
    throw new Error('Message operations are not supported by the AI Agents API');
  }

  // Conversations
  async getConversationById(id: string): Promise<Conversation | null> {
    throw new Error('Conversation operations are not supported by the AI Agents API');
  }

  async getConversations(ids?: string[]): Promise<Record<string, Conversation>> {
    throw new Error('Conversation operations are not supported by the AI Agents API');
  }

  async getConversationsByCollectionId(collectionId: string): Promise<Conversation[]> {
    throw new Error('Conversation operations are not supported by the AI Agents API');
  }

  async getConversationsByAIAgentId(aiAgentId: string): Promise<Conversation[]> {
    throw new Error('Conversation operations are not supported by the AI Agents API');
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    throw new Error('Conversation operations are not supported by the AI Agents API');
  }

  async createConversation(data: Omit<Conversation, 'id'>): Promise<Conversation> {
    throw new Error('Conversation operations are not supported by the AI Agents API');
  }

  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation | null> {
    throw new Error('Conversation operations are not supported by the AI Agents API');
  }

  async deleteConversation(id: string): Promise<boolean> {
    throw new Error('Conversation operations are not supported by the AI Agents API');
  }

  async filterConversations(filterCriteria: any): Promise<string[]> {
    throw new Error('Conversation operations are not supported by the AI Agents API');
  }

  // Collections
  async getCollectionById(id: string): Promise<Collection | null> {
    throw new Error('Collection operations are not supported by the AI Agents API');
  }

  async getCollections(ids?: string[]): Promise<Record<string, Collection>> {
    throw new Error('Collection operations are not supported by the AI Agents API');
  }

  async getCollectionsByGroupId(groupId: string): Promise<Collection[]> {
    throw new Error('Collection operations are not supported by the AI Agents API');
  }

  async getCollectionsByCreatorId(creatorId: string): Promise<Collection[]> {
    throw new Error('Collection operations are not supported by the AI Agents API');
  }

  async createCollection(data: Omit<Collection, 'id'>): Promise<Collection> {
    throw new Error('Collection operations are not supported by the AI Agents API');
  }

  async updateCollection(id: string, data: Partial<Collection>): Promise<Collection | null> {
    throw new Error('Collection operations are not supported by the AI Agents API');
  }

  async deleteCollection(id: string): Promise<boolean> {
    throw new Error('Collection operations are not supported by the AI Agents API');
  }

  // Groups
  async getGroupById(id: string): Promise<Group | null> {
    throw new Error('Group operations are not supported by the AI Agents API');
  }

  async getGroups(ids?: string[]): Promise<Record<string, Group>> {
    throw new Error('Group operations are not supported by the AI Agents API');
  }

  async getGroupsByAdminUserId(userId: string): Promise<Group[]> {
    throw new Error('Group operations are not supported by the AI Agents API');
  }

  async createGroup(data: Omit<Group, 'id'>): Promise<Group> {
    throw new Error('Group operations are not supported by the AI Agents API');
  }

  async updateGroup(id: string, data: Partial<Group>): Promise<Group | null> {
    throw new Error('Group operations are not supported by the AI Agents API');
  }

  async deleteGroup(id: string): Promise<boolean> {
    throw new Error('Group operations are not supported by the AI Agents API');
  }

  // #endregion

  // #region Transformation Methods

  /**
   * Transform API AI agent format to app format
   */
  private transformApiAIAgent(apiAgent: any): AIAgent {
    // Create the AI agent object in our app format
    return {
      id: apiAgent.id,
      name: apiAgent.name || '',
      modelName: apiAgent.modelName || apiAgent.model_name || '',
      version: apiAgent.version || '',
      createdAt: apiAgent.createdAt || apiAgent.created_at || new Date().toISOString(),
      updatedAt: apiAgent.updatedAt || apiAgent.updated_at || new Date().toISOString(),
      status: apiAgent.status || 'active',
      capabilities: Array.isArray(apiAgent.capabilities) ? apiAgent.capabilities : [],
      statistics: apiAgent.statistics || {
        activeUsers: 0,
        totalConversations: 0,
        averageRating: 0,
        messagesPerConversation: 0,
        averageResponseTime: 0
      },
      metadata: apiAgent.metadata || {},
      isPublic: apiAgent.isPublic || apiAgent.is_public || false,
      managedBy: apiAgent.managedBy || apiAgent.managed_by || []
    };
  }

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
      metadata: apiUser.metadata || {},
      isActive: apiUser.isActive || apiUser.is_active || true
    };
  }

  // #endregion

  // #region Preparation Methods

  /**
   * Prepare AI agent data for API
   */
  private prepareAIAgentForApi(agent: Partial<AIAgent>): any {
    // Create a copy to avoid modifying the original
    const apiData: any = { ...agent };

    // Convert snake_case to camelCase if needed
    if (apiData.model_name === undefined && apiData.modelName !== undefined) {
      apiData.model_name = apiData.modelName;
      delete apiData.modelName;
    }

    if (apiData.is_public === undefined && apiData.isPublic !== undefined) {
      apiData.is_public = apiData.isPublic;
      delete apiData.isPublic;
    }

    if (apiData.managed_by === undefined && apiData.managedBy !== undefined) {
      apiData.managed_by = apiData.managedBy;
      delete apiData.managedBy;
    }

    return apiData;
  }

  // #endregion
}