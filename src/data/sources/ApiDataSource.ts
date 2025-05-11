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

/**
 * API client implementation of the IDataSource interface.
 * This implementation communicates with a remote API server that follows
 * the Agent Monitor API Specification.
 */
export class ApiDataSource implements IDataSource {
  private apiClient: AxiosInstance;
  private authToken?: string;
  
  /**
   * Creates a new API data source client
   * @param baseUrl The base URL of the API server
   * @param authToken Optional JWT authentication token
   */
  constructor(baseUrl: string, authToken?: string) {
    this.authToken = authToken;
    
    this.apiClient = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      response => response,
      (error: AxiosError) => this.handleApiError(error)
    );
    
    // Add request interceptor for authentication
    this.apiClient.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        if (this.authToken) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );
  }
  
  /**
   * Sets the authentication token for API requests
   * @param token JWT token for authentication
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
  }
  
  /**
   * Clears the authentication token
   */
  public clearAuthToken(): void {
    this.authToken = undefined;
  }
  
  /**
   * Handles API errors and provides a consistent error format
   * @param error The error from the API request
   * @returns A rejected promise with formatted error
   */
  private handleApiError(error: AxiosError): Promise<never> {
    const status = error.response?.status;
    const data = error.response?.data as any;
    
    let errorMessage = 'An unknown error occurred';
    if (data?.message) {
      errorMessage = data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error(`API Error (${status}): ${errorMessage}`, error);
    
    return Promise.reject({
      status,
      message: errorMessage,
      details: data?.details || error.response?.data || error.message
    });
  }
  
  /**
   * Initialize the data source
   */
  async initialize(): Promise<void> {
    await this.apiClient.post('/system/initialize');
  }
  
  /**
   * Save all data to persistent storage
   */
  async saveData(): Promise<void> {
    await this.apiClient.post('/system/save');
  }
  
  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    await this.apiClient.post('/system/cache/clear');
  }
  
  // #region Message Methods
  
  /**
   * Get a specific message by ID
   * @param id Message ID
   */
  async getMessageById(id: string): Promise<Message | null> {
    try {
      const response = await this.apiClient.get(`/messages/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  /**
   * Get multiple messages by their IDs
   * @param ids Optional array of message IDs. If not provided, returns all messages
   */
  async getMessages(ids?: string[]): Promise<Record<string, Message>> {
    const params = ids ? { ids: ids.join(',') } : undefined;
    const response = await this.apiClient.get('/messages', { params });
    return response.data;
  }
  
  /**
   * Get all messages for a specific conversation
   * @param conversationId Conversation ID
   */
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    const response = await this.apiClient.get(`/conversations/${conversationId}/messages`);
    return response.data;
  }
  
  /**
   * Create a new message
   * @param data Message data without the ID
   */
  async createMessage(data: Omit<Message, 'id'>): Promise<Message> {
    const response = await this.apiClient.post('/messages', data);
    return response.data;
  }
  
  /**
   * Update an existing message
   * @param id Message ID
   * @param data Partial message data to update
   */
  async updateMessage(id: string, data: Partial<Message>): Promise<Message | null> {
    try {
      const response = await this.apiClient.put(`/messages/${id}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  /**
   * Delete a message
   * @param id Message ID
   */
  async deleteMessage(id: string): Promise<boolean> {
    try {
      const response = await this.apiClient.delete(`/messages/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }
  
  // #endregion
  
  // #region Conversation Methods
  
  /**
   * Get a specific conversation by ID
   * @param id Conversation ID
   */
  async getConversationById(id: string): Promise<Conversation | null> {
    try {
      const response = await this.apiClient.get(`/conversations/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  /**
   * Get multiple conversations by their IDs
   * @param ids Optional array of conversation IDs. If not provided, returns all conversations
   */
  async getConversations(ids?: string[]): Promise<Record<string, Conversation>> {
    const params = ids ? { ids: ids.join(',') } : undefined;
    const response = await this.apiClient.get('/conversations', { params });
    return response.data;
  }
  
  /**
   * Get all conversations for a specific collection
   * @param collectionId Collection ID
   */
  async getConversationsByCollectionId(collectionId: string): Promise<Conversation[]> {
    const response = await this.apiClient.get(`/collections/${collectionId}/conversations`);
    return response.data;
  }
  
  /**
   * Get all conversations for a specific AI agent
   * @param aiAgentId AI agent ID
   */
  async getConversationsByAIAgentId(aiAgentId: string): Promise<Conversation[]> {
    const response = await this.apiClient.get(`/aiagents/${aiAgentId}/conversations`);
    return response.data;
  }
  
  /**
   * Get all conversations for a specific user
   * @param userId User ID
   */
  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    const response = await this.apiClient.get(`/users/${userId}/conversations`);
    return response.data;
  }
  
  /**
   * Create a new conversation
   * @param data Conversation data without the ID
   */
  async createConversation(data: Omit<Conversation, 'id'>): Promise<Conversation> {
    const response = await this.apiClient.post('/conversations', data);
    return response.data;
  }
  
  /**
   * Update an existing conversation
   * @param id Conversation ID
   * @param data Partial conversation data to update
   */
  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation | null> {
    try {
      const response = await this.apiClient.put(`/conversations/${id}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  /**
   * Delete a conversation
   * @param id Conversation ID
   */
  async deleteConversation(id: string): Promise<boolean> {
    try {
      const response = await this.apiClient.delete(`/conversations/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }
  
  /**
   * Filter conversations by complex criteria
   * @param filterCriteria Object containing filter criteria
   */
  async filterConversations(filterCriteria: any): Promise<string[]> {
    const response = await this.apiClient.post('/conversations/filter', filterCriteria);
    return response.data;
  }
  
  // #endregion
  
  // #region Collection Methods
  
  /**
   * Get a specific collection by ID
   * @param id Collection ID
   */
  async getCollectionById(id: string): Promise<Collection | null> {
    try {
      const response = await this.apiClient.get(`/collections/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  /**
   * Get multiple collections by their IDs
   * @param ids Optional array of collection IDs. If not provided, returns all collections
   */
  async getCollections(ids?: string[]): Promise<Record<string, Collection>> {
    const params = ids ? { ids: ids.join(',') } : undefined;
    const response = await this.apiClient.get('/collections', { params });
    return response.data;
  }
  
  /**
   * Get all collections for a specific group
   * @param groupId Group ID
   */
  async getCollectionsByGroupId(groupId: string): Promise<Collection[]> {
    const response = await this.apiClient.get(`/groups/${groupId}/collections`);
    return response.data;
  }
  
  /**
   * Get all collections created by a specific user
   * @param creatorId Creator user ID
   */
  async getCollectionsByCreatorId(creatorId: string): Promise<Collection[]> {
    const response = await this.apiClient.get(`/users/${creatorId}/collections`);
    return response.data;
  }
  
  /**
   * Create a new collection
   * @param data Collection data without the ID
   */
  async createCollection(data: Omit<Collection, 'id'>): Promise<Collection> {
    const response = await this.apiClient.post('/collections', data);
    return response.data;
  }
  
  /**
   * Update an existing collection
   * @param id Collection ID
   * @param data Partial collection data to update
   */
  async updateCollection(id: string, data: Partial<Collection>): Promise<Collection | null> {
    try {
      const response = await this.apiClient.put(`/collections/${id}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  /**
   * Delete a collection
   * @param id Collection ID
   */
  async deleteCollection(id: string): Promise<boolean> {
    try {
      const response = await this.apiClient.delete(`/collections/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }
  
  // #endregion
  
  // #region Group Methods
  
  /**
   * Get a specific group by ID
   * @param id Group ID
   */
  async getGroupById(id: string): Promise<Group | null> {
    try {
      const response = await this.apiClient.get(`/groups/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  /**
   * Get multiple groups by their IDs
   * @param ids Optional array of group IDs. If not provided, returns all groups
   */
  async getGroups(ids?: string[]): Promise<Record<string, Group>> {
    const params = ids ? { ids: ids.join(',') } : undefined;
    const response = await this.apiClient.get('/groups', { params });
    return response.data;
  }
  
  /**
   * Get all groups where a specific user is an admin
   * @param userId User ID
   */
  async getGroupsByAdminUserId(userId: string): Promise<Group[]> {
    const response = await this.apiClient.get(`/users/${userId}/admin-groups`);
    return response.data;
  }
  
  /**
   * Create a new group
   * @param data Group data without the ID
   */
  async createGroup(data: Omit<Group, 'id'>): Promise<Group> {
    const response = await this.apiClient.post('/groups', data);
    return response.data;
  }
  
  /**
   * Update an existing group
   * @param id Group ID
   * @param data Partial group data to update
   */
  async updateGroup(id: string, data: Partial<Group>): Promise<Group | null> {
    try {
      const response = await this.apiClient.put(`/groups/${id}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  /**
   * Delete a group
   * @param id Group ID
   */
  async deleteGroup(id: string): Promise<boolean> {
    try {
      const response = await this.apiClient.delete(`/groups/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }
  
  // #endregion
  
  // #region AI Agent Methods
  
  /**
   * Get a specific AI agent by ID
   * @param id AI agent ID
   */
  async getAIAgentById(id: string): Promise<AIAgent | null> {
    try {
      const response = await this.apiClient.get(`/aiagents/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  /**
   * Get multiple AI agents by their IDs
   * @param ids Optional array of AI agent IDs. If not provided, returns all AI agents
   */
  async getAIAgents(ids?: string[]): Promise<Record<string, AIAgent>> {
    const params = ids ? { ids: ids.join(',') } : undefined;
    const response = await this.apiClient.get('/aiagents', { params });
    return response.data;
  }
  
  /**
   * Get all AI agents with a specific status
   * @param status Status of the AI agent (active, inactive, or training)
   */
  async getAIAgentsByStatus(status: 'active' | 'inactive' | 'training'): Promise<AIAgent[]> {
    const response = await this.apiClient.get(`/aiagents/status/${status}`);
    return response.data;
  }
  
  /**
   * Create a new AI agent
   * @param data AI agent data without the ID
   */
  async createAIAgent(data: Omit<AIAgent, 'id'>): Promise<AIAgent> {
    const response = await this.apiClient.post('/aiagents', data);
    return response.data;
  }
  
  /**
   * Update an existing AI agent
   * @param id AI agent ID
   * @param data Partial AI agent data to update
   */
  async updateAIAgent(id: string, data: Partial<AIAgent>): Promise<AIAgent | null> {
    try {
      const response = await this.apiClient.put(`/aiagents/${id}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  /**
   * Delete an AI agent
   * @param id AI agent ID
   */
  async deleteAIAgent(id: string): Promise<boolean> {
    try {
      const response = await this.apiClient.delete(`/aiagents/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }
  
  // #endregion
  
  // #region User Methods
  
  /**
   * Get a specific user by ID
   * @param id User ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await this.apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  /**
   * Get multiple users by their IDs
   * @param ids Optional array of user IDs. If not provided, returns all users
   */
  async getUsers(ids?: string[]): Promise<Record<string, User>> {
    const params = ids ? { ids: ids.join(',') } : undefined;
    const response = await this.apiClient.get('/users', { params });
    return response.data;
  }
  
  /**
   * Get all users with a specific role
   * @param role User role (admin, supervisor, or executive)
   */
  async getUsersByRole(role: string): Promise<User[]> {
    const response = await this.apiClient.get(`/users/role/${role}`);
    return response.data;
  }
  
  /**
   * Create a new user
   * @param data User data without the ID
   */
  async createUser(data: Omit<User, 'id'>): Promise<User> {
    const response = await this.apiClient.post('/users', data);
    return response.data;
  }
  
  /**
   * Update an existing user
   * @param id User ID
   * @param data Partial user data to update
   */
  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    try {
      const response = await this.apiClient.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  /**
   * Delete a user
   * @param id User ID
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      const response = await this.apiClient.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }
  
  /**
   * Get the currently authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.apiClient.get('/users/current');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return null;
      }
      throw error;
    }
  }
  
  // #endregion
}