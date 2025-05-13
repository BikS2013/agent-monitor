import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiError } from './ApiError';

/**
 * ApiClient for the Agent Monitor API
 * This client interfaces with the Python API client described in specs/client.py
 */
export class ApiClient {
  private apiClient: AxiosInstance;
  private authToken?: string;

  /**
   * Creates a new API client
   * @param baseUrl Base URL of the Agent Monitor API (defaults to localhost:8000)
   * @param authToken Optional JWT authentication token
   * @param clientSecret Optional client secret for API key authentication
   * @param clientId Optional client ID for API key authentication
   * @param noAuth Whether to disable authentication (no token or API key)
   */
  constructor(
    baseUrl: string = 'http://localhost:8000',
    authToken?: string,
    private clientSecret?: string,
    private clientId?: string,
    private noAuth: boolean = false
  ) {
    this.authToken = authToken;
    
    // Debug info
    console.log('ApiClient: Initializing with settings:', {
      baseUrl,
      hasAuthToken: !!authToken,
      hasClientSecret: !!this.clientSecret,
      hasClientId: !!this.clientId,
      noAuth: this.noAuth
    });

    this.apiClient = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // Add timeout to prevent hanging requests
      timeout: 30000
    });

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      response => response,
      (error: AxiosError) => this.handleApiError(error)
    );

    // Add request interceptor for authentication
    this.apiClient.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        config.headers = config.headers || {};

        // Skip authentication if noAuth is true
        if (!this.noAuth) {
          // Add authorization header if token exists
          if (this.authToken) {
            config.headers.Authorization = `Bearer ${this.authToken}`;
            console.log('ApiClient: Adding Bearer token to request');
          }
          // Otherwise use API key if available
          else if (this.clientSecret) {
            config.headers['X-API-KEY'] = this.clientSecret;
            console.log('ApiClient: Adding API key to request');
          }

          // Add client ID if available
          if (this.clientId) {
            config.headers['X-CLIENT-ID'] = this.clientId;
            console.log('ApiClient: Adding Client ID to request');
          }
        } else {
          console.log('ApiClient: No auth mode - skipping authentication headers');
        }

        // Debug logging
        console.log('ApiClient: Request to', config.url, {
          method: config.method,
          hasAuthHeader: !!config.headers.Authorization,
          hasApiKey: !!config.headers['X-API-KEY'],
          noAuth: this.noAuth
        });

        return config;
      },
      error => Promise.reject(this.handleApiError(error))
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
   * Handle API errors and provide a consistent error format
   */
  private handleApiError(error: AxiosError): Promise<never> {
    // Create a standardized API error
    const apiError = ApiError.fromAxiosError(error);

    // Log the error for debugging
    console.error(`API Error (${apiError.status}): ${apiError.message}`, error);

    // Return rejected promise with the API error
    return Promise.reject(apiError);
  }
  
  /**
   * Login to get an access token
   */
  async login(username: string, password: string): Promise<any> {
    const url = `${this.apiClient.defaults.baseURL}/system/token`;
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await this.apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const tokenInfo = response.data;
    
    // Set the token for future requests
    if (tokenInfo.access_token) {
      this.setAuthToken(tokenInfo.access_token);
    }
    
    return tokenInfo;
  }
  
  /**
   * Get current authentication status
   */
  async getAuthStatus(): Promise<any> {
    return this.apiClient.get('/system/auth/status');
  }
  
  /**
   * Make a GET request to the API
   */
  async get(endpoint: string, params?: any): Promise<any> {
    console.log(`ApiClient: Making GET request to ${endpoint}`, {
      params,
      noAuth: this.noAuth,
      useAuthToken: !!this.authToken
    });

    try {
      const response = await this.apiClient.get(endpoint, { params });
      console.log(`ApiClient: GET ${endpoint} response:`, response.status);
      return response.data;
    } catch (error) {
      console.error(`ApiClient: GET ${endpoint} failed:`, error);
      throw error;
    }
  }
  
  /**
   * Make a POST request to the API
   */
  async post(endpoint: string, data?: any): Promise<any> {
    const response = await this.apiClient.post(endpoint, data);
    return response.data;
  }
  
  /**
   * Make a PUT request to the API
   */
  async put(endpoint: string, data?: any): Promise<any> {
    const response = await this.apiClient.put(endpoint, data);
    return response.data;
  }
  
  /**
   * Make a DELETE request to the API
   */
  async delete(endpoint: string): Promise<any> {
    const response = await this.apiClient.delete(endpoint);
    return response.data;
  }
  
  // #region System Operations
  
  /**
   * Initialize the data source
   */
  async initialize(): Promise<void> {
    try {
      console.log('ApiClient: Testing API connection with initialization request');
      console.log('ApiClient: Base URL is', this.apiClient.defaults.baseURL);
      console.log('ApiClient: Auth settings:', {
        noAuth: this.noAuth,
        hasToken: !!this.authToken,
        hasClientSecret: !!this.clientSecret
      });

      try {
        // Make a simple GET request to check that the API is reachable
        console.log('ApiClient: Attempting health check...');
        await this.apiClient.get('/system/health', {
          timeout: 5000,
          validateStatus: status => true // Accept any status code to see what's happening
        });
        console.log('ApiClient: API health check successful');
      } catch (healthError) {
        console.error('ApiClient: API health check failed:', healthError);
        console.error('ApiClient: Health check error details:', {
          message: healthError.message,
          code: healthError.code,
          isAxiosError: healthError.isAxiosError,
          stack: healthError.stack
        });
        throw new Error(`Health check failed: ${healthError.message}`);
      }

      try {
        // Now try to initialize the API
        console.log('ApiClient: Attempting to initialize API...');
        await this.apiClient.post('/system/initialize');
        console.log('ApiClient: API initialized successfully');
      } catch (initError) {
        console.error('ApiClient: API initialization failed:', initError);
        throw new Error(`Initialization failed: ${initError.message}`);
      }
    } catch (error) {
      console.error('ApiClient: Initialization failed - API may not be available:', error);
      // Log error details for network errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        console.error('ApiClient: Network error - the API server is not reachable');
      }
      throw new Error('Failed to initialize API client: API server may not be available');
    }
  }
  
  /**
   * Save all data to persistent storage
   */
  async saveData(): Promise<void> {
    await this.post('/system/save');
  }
  
  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    await this.post('/system/cache/clear');
  }
  
  /**
   * Generate sample data
   */
  async generateSampleData(size?: 'small' | 'medium' | 'large'): Promise<any> {
    const data = size ? { size } : undefined;
    return this.post('/system/sample-data/generate', data);
  }
  
  /**
   * Get the status of sample data
   */
  async getSampleDataStatus(): Promise<any> {
    return this.get('/system/sample-data/status');
  }
  
  /**
   * Generate static sample data sets
   */
  async generateStaticSampleData(): Promise<any> {
    return this.post('/system/sample-data/generate-static');
  }
  
  /**
   * Load static sample data
   */
  async loadStaticSampleData(size?: 'small' | 'medium' | 'large'): Promise<any> {
    const data = size ? { size } : undefined;
    return this.post('/system/sample-data/load-static', data);
  }
  
  // #endregion
  
  // #region Conversation Methods
  
  /**
   * Get all conversations or specific conversations by thread_id
   */
  async getConversations(options: {
    ids?: string[],
    skip?: number,
    limit?: number,
    sort_by?: string,
    sort_order?: 'asc' | 'desc',
    include_pagination?: boolean,
    include_messages?: boolean
  } = {}): Promise<any> {
    const params: any = {
      skip: options.skip || 0,
      sort_by: options.sort_by || 'created_at',
      sort_order: options.sort_order || 'desc',
      include_pagination: options.include_pagination || false,
      include_messages: options.include_messages || false
    };
    
    if (options.ids && options.ids.length > 0) {
      params.ids = options.ids.join(',');
    }
    
    if (options.limit) {
      params.limit = options.limit;
    }
    
    return this.get('/conversations/', params);
  }
  
  /**
   * Get a specific conversation by thread_id
   */
  async getConversation(thread_id: string, includeMessages: boolean = false): Promise<any> {
    console.log(`ApiClient: Getting conversation with thread_id ${thread_id} with includeMessages=${includeMessages}`);
    const result = await this.get(`/conversations/${thread_id}`, {
      include_messages: includeMessages,
      expand: 'messages'  // Some API formats use expand instead
    });

    // Log if messages were included in the response
    const hasMessages = !!(result?.decodedMessages || result?.decoded_messages || result?.messages);
    console.log(`ApiClient: Received conversation with thread_id ${thread_id}`, {
      hasMessages,
      messageCount: (result?.decodedMessages || result?.decoded_messages || result?.messages || []).length
    });

    return result;
  }
  
  /**
   * Create a new conversation
   */
  async createConversation(conversationData: any): Promise<any> {
    return this.post('/conversations/', conversationData);
  }
  
  /**
   * Update an existing conversation
   */
  async updateConversation(thread_id: string, conversationData: any): Promise<any> {
    return this.put(`/conversations/${thread_id}`, conversationData);
  }
  
  /**
   * Delete a conversation
   */
  async deleteConversation(thread_id: string): Promise<boolean> {
    return this.delete(`/conversations/${thread_id}`);
  }
  
  /**
   * Filter conversations based on complex criteria
   */
  async filterConversations(filterCriteria: any): Promise<string[]> {
    return this.post('/conversations/filter', filterCriteria);
  }
  
  /**
   * Get conversations by collection ID
   */
  async getConversationsByCollection(
    collectionId: string,
    options: {
      skip?: number,
      limit?: number,
      sort_by?: string,
      sort_order?: 'asc' | 'desc',
      include_pagination?: boolean
    } = {}
  ): Promise<any> {
    const params: any = {
      skip: options.skip || 0,
      sort_by: options.sort_by || 'created_at',
      sort_order: options.sort_order || 'desc',
      include_pagination: options.include_pagination || false
    };
    
    if (options.limit) {
      params.limit = options.limit;
    }
    
    return this.get(`/collection/${collectionId}/conversations`, params);
  }
  
  /**
   * Get conversations by AI agent ID
   */
  async getConversationsByAIAgent(
    aiAgentId: string,
    options: {
      skip?: number,
      limit?: number,
      sort_by?: string,
      sort_order?: 'asc' | 'desc',
      include_pagination?: boolean
    } = {}
  ): Promise<any> {
    const params: any = {
      ai_agent_id: aiAgentId,
      skip: options.skip || 0,
      sort_by: options.sort_by || 'created_at',
      sort_order: options.sort_order || 'desc',
      include_pagination: options.include_pagination || false
    };
    
    if (options.limit) {
      params.limit = options.limit;
    }
    
    return this.get(`/conversations/`, params);
  }
  
  /**
   * Get conversations by user ID
   */
  async getConversationsByUser(
    userId: string,
    options: {
      skip?: number,
      limit?: number,
      sort_by?: string,
      sort_order?: 'asc' | 'desc',
      include_pagination?: boolean
    } = {}
  ): Promise<any> {
    const params: any = {
      user_id: userId,
      skip: options.skip || 0,
      sort_by: options.sort_by || 'created_at',
      sort_order: options.sort_order || 'desc',
      include_pagination: options.include_pagination || false
    };
    
    if (options.limit) {
      params.limit = options.limit;
    }
    
    return this.get(`/conversations/`, params);
  }
  
  // #endregion
  
  // #region Collection Methods
  
  /**
   * Get all collections or specific collections by ID
   */
  async getCollections(ids?: string[]): Promise<any> {
    const params: any = {};
    if (ids && ids.length > 0) {
      params.ids = ids.join(',');
    }
    return this.get('/collection', params);
  }
  
  /**
   * Get a specific collection by ID
   */
  async getCollection(collectionId: string): Promise<any> {
    return this.get(`/collection/${collectionId}`);
  }
  
  /**
   * Create a new collection
   */
  async createCollection(collectionData: any): Promise<any> {
    return this.post('/collection', collectionData);
  }
  
  /**
   * Update an existing collection
   */
  async updateCollection(collectionId: string, collectionData: any): Promise<any> {
    return this.put(`/collection/${collectionId}`, collectionData);
  }
  
  /**
   * Delete a collection
   */
  async deleteCollection(collectionId: string): Promise<boolean> {
    return this.delete(`/collection/${collectionId}`);
  }
  
  /**
   * Get collections by group ID
   */
  async getCollectionsByGroup(groupId: string): Promise<any> {
    return this.get(`/group/${groupId}/collection`);
  }
  
  /**
   * Get collections by creator ID
   */
  async getCollectionsByCreator(creatorId: string): Promise<any> {
    return this.get(`/user/${creatorId}/collection`);
  }
  
  // #endregion
  
  // #region Group Methods
  
  /**
   * Get all groups or specific groups by ID
   */
  async getGroups(ids?: string[]): Promise<any> {
    const params: any = {};
    if (ids && ids.length > 0) {
      params.ids = ids.join(',');
    }
    return this.get('/group', params);
  }
  
  /**
   * Get a specific group by ID
   */
  async getGroup(groupId: string): Promise<any> {
    return this.get(`/group/${groupId}`);
  }
  
  /**
   * Create a new group
   */
  async createGroup(groupData: any): Promise<any> {
    return this.post('/group', groupData);
  }
  
  /**
   * Update an existing group
   */
  async updateGroup(groupId: string, groupData: any): Promise<any> {
    return this.put(`/group/${groupId}`, groupData);
  }
  
  /**
   * Delete a group
   */
  async deleteGroup(groupId: string): Promise<boolean> {
    return this.delete(`/group/${groupId}`);
  }
  
  /**
   * Get groups where a user is an admin
   */
  async getGroupsByAdminUser(userId: string): Promise<any> {
    return this.get(`/user/${userId}/admin-group`);
  }
  
  /**
   * Get groups that a user belongs to
   */
  async getGroupsByUser(userId: string): Promise<any> {
    return this.get(`/user/${userId}/group`);
  }
  
  /**
   * Get groups that include a specific collection
   */
  async getGroupsByCollection(collectionId: string): Promise<any> {
    return this.get(`/collection/${collectionId}/group`);
  }
  
  /**
   * Get groups with a specific purpose
   */
  async getGroupsByPurpose(purpose: string): Promise<any> {
    return this.get(`/group/purpose/${purpose}`);
  }
  
  /**
   * Add a user to a group
   */
  async addUserToGroup(groupId: string, userId: string, permissionLevel: string): Promise<any> {
    return this.post(`/group/${groupId}/users`, { user_id: userId, permission_level: permissionLevel });
  }
  
  /**
   * Remove a user from a group
   */
  async removeUserFromGroup(groupId: string, userId: string): Promise<any> {
    return this.delete(`/group/${groupId}/users/${userId}`);
  }
  
  /**
   * Add a user as an admin to a group
   */
  async addAdminToGroup(groupId: string, userId: string): Promise<any> {
    return this.post(`/group/${groupId}/admins`, { user_id: userId });
  }
  
  /**
   * Add a collection to a group
   */
  async addCollectionToGroup(groupId: string, collectionId: string): Promise<any> {
    return this.post(`/group/${groupId}/collections`, { collection_id: collectionId });
  }
  
  /**
   * Remove a collection from a group
   */
  async removeCollectionFromGroup(groupId: string, collectionId: string): Promise<any> {
    return this.delete(`/group/${groupId}/collections/${collectionId}`);
  }
  
  // #endregion
  
  // #region AI Agent Methods
  
  /**
   * Get all AI agents or specific AI agents by ID
   */
  async getAIAgents(ids?: string[]): Promise<any> {
    const params: any = {};
    if (ids && ids.length > 0) {
      params.ids = ids.join(',');
    }
    return this.get('/aiagent', params);
  }
  
  /**
   * Get a specific AI agent by ID
   */
  async getAIAgent(agentId: string): Promise<any> {
    return this.get(`/aiagent/${agentId}`);
  }
  
  /**
   * Create a new AI agent
   */
  async createAIAgent(agentData: any): Promise<any> {
    return this.post('/aiagent', agentData);
  }
  
  /**
   * Update an existing AI agent
   */
  async updateAIAgent(agentId: string, agentData: any): Promise<any> {
    return this.put(`/aiagent/${agentId}`, agentData);
  }
  
  /**
   * Delete an AI agent
   */
  async deleteAIAgent(agentId: string): Promise<boolean> {
    return this.delete(`/aiagent/${agentId}`);
  }
  
  /**
   * Get AI agents with a specific status
   */
  async getAIAgentsByStatus(status: 'active' | 'inactive' | 'training'): Promise<any> {
    return this.get(`/aiagent/status/${status}`);
  }
  
  // #endregion
  
  // #region User Methods
  
  /**
   * Get all users or specific users by ID
   */
  async getUsers(ids?: string[]): Promise<any> {
    const params: any = {};
    if (ids && ids.length > 0) {
      params.ids = ids.join(',');
    }
    return this.get('/user', params);
  }
  
  /**
   * Get a specific user by ID
   */
  async getUser(userId: string): Promise<any> {
    return this.get(`/user/${userId}`);
  }
  
  /**
   * Get the currently authenticated user
   */
  async getCurrentUser(): Promise<any> {
    return this.get('/user/current');
  }
  
  /**
   * Create a new user
   */
  async createUser(userData: any): Promise<any> {
    return this.post('/user', userData);
  }
  
  /**
   * Update an existing user
   */
  async updateUser(userId: string, userData: any): Promise<any> {
    return this.put(`/user/${userId}`, userData);
  }
  
  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<boolean> {
    return this.delete(`/user/${userId}`);
  }
  
  /**
   * Get users with a specific role
   */
  async getUsersByRole(role: string): Promise<any> {
    return this.get(`/user/role/${role}`);
  }
  
  // #endregion
}