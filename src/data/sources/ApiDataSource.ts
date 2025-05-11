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
   * Get a specific message by ID
   * @param id Message ID
   */
  async getMessageById(id: string): Promise<Message | null> {
    // The Python client doesn't have direct message access methods as
    // messages are now stored directly in the conversation values field
    // So we'll extract the message from its parent conversation

    // We'll implement this with a dummy implementation that returns null
    // In a real implementation, this would be handled by transforming the API data
    console.warn('getMessageById not supported by API, messages are stored in conversations');
    return null;
  }

  /**
   * Get multiple messages by their IDs
   * @param ids Optional array of message IDs. If not provided, returns all messages
   */
  async getMessages(ids?: string[]): Promise<Record<string, Message>> {
    // The Python client doesn't have direct message access methods
    // Same approach as getMessageById
    console.warn('getMessages not supported by API, messages are stored in conversations');
    return {};
  }

  /**
   * Get all messages for a specific conversation
   * @param conversationId Conversation ID
   */
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    try {
      console.log(`ApiDataSource: Getting messages for conversation ${conversationId}`);

      // Get the conversation with messages included
      const conversation = await this.apiClient.getConversation(conversationId, true);

      // Access decoded messages from the conversation
      if (conversation) {
        const messagesField = conversation.decodedMessages || conversation.decoded_messages || conversation.messages;

        console.log(`ApiDataSource: Found ${messagesField?.length || 0} messages in conversation ${conversationId}`, {
          hasDecodedMessages: !!conversation.decodedMessages,
          hasDecoded_messages: !!conversation.decoded_messages,
          hasMessages: !!conversation.messages,
          messageTypes: messagesField ? typeof messagesField : 'undefined'
        });

        if (messagesField && Array.isArray(messagesField)) {
          const messages = messagesField.map(msg => this.transformApiMessage(msg, conversationId));
          console.log(`ApiDataSource: Returning ${messages.length} transformed messages for conversation ${conversationId}`);
          return messages;
        } else {
          console.warn(`ApiDataSource: Messages field is not an array for conversation ${conversationId}`);
        }
      } else {
        console.warn(`ApiDataSource: Conversation ${conversationId} not found or has no data`);
      }

      return [];
    } catch (error) {
      console.error(`Failed to get messages for conversation ${conversationId}:`, error);
      return [];
    }
  }

  /**
   * Create a new message
   * @param data Message data without the ID
   */
  async createMessage(data: Omit<Message, 'id'>): Promise<Message> {
    // The Python client doesn't have direct message creation methods
    // We would need to update the conversation's values field
    console.warn('createMessage not supported by API, messages are stored in conversations');

    // Return dummy message with ID
    return {
      ...data as any,
      id: `msg_${Date.now()}`,
    };
  }

  /**
   * Update an existing message
   * @param id Message ID
   * @param data Partial message data to update
   */
  async updateMessage(id: string, data: Partial<Message>): Promise<Message | null> {
    // The Python client doesn't have direct message update methods
    console.warn('updateMessage not supported by API, messages are stored in conversations');
    return null;
  }

  /**
   * Delete a message
   * @param id Message ID
   */
  async deleteMessage(id: string): Promise<boolean> {
    // The Python client doesn't have direct message deletion methods
    console.warn('deleteMessage not supported by API, messages are stored in conversations');
    return false;
  }

  // #endregion

  // #region Conversation Methods

  /**
   * Get a specific conversation by ID
   * @param id Conversation ID
   */
  async getConversationById(id: string): Promise<Conversation | null> {
    try {
      const conversation = await this.apiClient.getConversation(id);
      if (!conversation) return null;

      return this.transformApiConversation(conversation);
    } catch (error) {
      console.error(`Failed to get conversation ${id}:`, error);
      return null;
    }
  }

  /**
   * Get multiple conversations by their IDs
   * @param ids Optional array of conversation IDs. If not provided, returns all conversations
   */
  async getConversations(ids?: string[]): Promise<Record<string, Conversation>> {
    try {
      const result = await this.apiClient.getConversations({ ids });

      // Handle different response formats
      let conversations: any[] = [];

      if (Array.isArray(result)) {
        // Direct array format
        conversations = result;
      } else if (result.items && Array.isArray(result.items)) {
        // Paginated response format
        conversations = result.items;
      } else if (typeof result === 'object' && !Array.isArray(result)) {
        // Object format with IDs as keys
        return Object.entries(result).reduce((acc, [id, conv]) => {
          acc[id] = this.transformApiConversation(conv);
          return acc;
        }, {} as Record<string, Conversation>);
      }

      // Transform to record with IDs as keys
      return conversations.reduce((acc, conv) => {
        const transformed = this.transformApiConversation(conv);
        acc[transformed.id] = transformed;
        return acc;
      }, {} as Record<string, Conversation>);
    } catch (error) {
      console.error('Failed to get conversations:', error);
      return {};
    }
  }

  /**
   * Get all conversations for a specific collection
   * @param collectionId Collection ID
   */
  async getConversationsByCollectionId(collectionId: string): Promise<Conversation[]> {
    try {
      const result = await this.apiClient.getConversationsByCollection(collectionId);

      // Handle different response formats
      let conversations: any[] = [];

      if (Array.isArray(result)) {
        // Direct array format
        conversations = result;
      } else if (result.items && Array.isArray(result.items)) {
        // Paginated response format
        conversations = result.items;
      }

      return conversations.map(conv => this.transformApiConversation(conv));
    } catch (error) {
      console.error(`Failed to get conversations for collection ${collectionId}:`, error);
      return [];
    }
  }

  /**
   * Get all conversations for a specific AI agent
   * @param aiAgentId AI agent ID
   */
  async getConversationsByAIAgentId(aiAgentId: string): Promise<Conversation[]> {
    try {
      const result = await this.apiClient.getConversationsByAIAgent(aiAgentId);

      // Handle different response formats
      let conversations: any[] = [];

      if (Array.isArray(result)) {
        // Direct array format
        conversations = result;
      } else if (result.items && Array.isArray(result.items)) {
        // Paginated response format
        conversations = result.items;
      }

      return conversations.map(conv => this.transformApiConversation(conv));
    } catch (error) {
      console.error(`Failed to get conversations for AI agent ${aiAgentId}:`, error);
      return [];
    }
  }

  /**
   * Get all conversations for a specific user
   * @param userId User ID
   */
  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    try {
      const result = await this.apiClient.getConversationsByUser(userId);

      // Handle different response formats
      let conversations: any[] = [];

      if (Array.isArray(result)) {
        // Direct array format
        conversations = result;
      } else if (result.items && Array.isArray(result.items)) {
        // Paginated response format
        conversations = result.items;
      }

      return conversations.map(conv => this.transformApiConversation(conv));
    } catch (error) {
      console.error(`Failed to get conversations for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Create a new conversation
   * @param data Conversation data without the ID
   */
  async createConversation(data: Omit<Conversation, 'id'>): Promise<Conversation> {
    try {
      const apiData = this.prepareConversationForApi(data as Conversation);
      const result = await this.apiClient.createConversation(apiData);
      return this.transformApiConversation(result);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }

  /**
   * Update an existing conversation
   * @param id Conversation ID
   * @param data Partial conversation data to update
   */
  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation | null> {
    try {
      const apiData = this.prepareConversationForApi(data as Conversation);
      const result = await this.apiClient.updateConversation(id, apiData);
      if (!result) return null;
      return this.transformApiConversation(result);
    } catch (error) {
      console.error(`Failed to update conversation ${id}:`, error);
      return null;
    }
  }

  /**
   * Delete a conversation
   * @param id Conversation ID
   */
  async deleteConversation(id: string): Promise<boolean> {
    try {
      return await this.apiClient.deleteConversation(id);
    } catch (error) {
      console.error(`Failed to delete conversation ${id}:`, error);
      return false;
    }
  }

  /**
   * Filter conversations by complex criteria
   * @param filterCriteria Object containing filter criteria
   */
  async filterConversations(filterCriteria: any): Promise<string[]> {
    try {
      return await this.apiClient.filterConversations(filterCriteria);
    } catch (error) {
      console.error('Failed to filter conversations:', error);
      return [];
    }
  }

  // #endregion

  // #region Collection Methods

  /**
   * Get a specific collection by ID
   * @param id Collection ID
   */
  async getCollectionById(id: string): Promise<Collection | null> {
    try {
      const collection = await this.apiClient.getCollection(id);
      if (!collection) return null;

      return this.transformApiCollection(collection);
    } catch (error) {
      console.error(`Failed to get collection ${id}:`, error);
      return null;
    }
  }

  /**
   * Get multiple collections by their IDs
   * @param ids Optional array of collection IDs. If not provided, returns all collections
   */
  async getCollections(ids?: string[]): Promise<Record<string, Collection>> {
    try {
      const result = await this.apiClient.getCollections(ids);

      // Handle different response formats
      if (typeof result === 'object' && !Array.isArray(result)) {
        // Object format with IDs as keys
        return Object.entries(result).reduce((acc, [id, coll]) => {
          acc[id] = this.transformApiCollection(coll);
          return acc;
        }, {} as Record<string, Collection>);
      } else if (Array.isArray(result)) {
        // Array format
        return result.reduce((acc, coll) => {
          const transformed = this.transformApiCollection(coll);
          acc[transformed.id] = transformed;
          return acc;
        }, {} as Record<string, Collection>);
      }

      // Fallback for unknown format
      return {};
    } catch (error) {
      console.error('Failed to get collections:', error);
      return {};
    }
  }

  /**
   * Get all collections for a specific group
   * @param groupId Group ID
   */
  async getCollectionsByGroupId(groupId: string): Promise<Collection[]> {
    try {
      const collections = await this.apiClient.getCollectionsByGroup(groupId);
      return Array.isArray(collections)
        ? collections.map(coll => this.transformApiCollection(coll))
        : [];
    } catch (error) {
      console.error(`Failed to get collections for group ${groupId}:`, error);
      return [];
    }
  }

  /**
   * Get all collections created by a specific user
   * @param creatorId Creator user ID
   */
  async getCollectionsByCreatorId(creatorId: string): Promise<Collection[]> {
    try {
      const collections = await this.apiClient.getCollectionsByCreator(creatorId);
      return Array.isArray(collections)
        ? collections.map(coll => this.transformApiCollection(coll))
        : [];
    } catch (error) {
      console.error(`Failed to get collections for creator ${creatorId}:`, error);
      return [];
    }
  }

  /**
   * Create a new collection
   * @param data Collection data without the ID
   */
  async createCollection(data: Omit<Collection, 'id'>): Promise<Collection> {
    try {
      const apiData = this.prepareCollectionForApi(data as Collection);
      const result = await this.apiClient.createCollection(apiData);
      return this.transformApiCollection(result);
    } catch (error) {
      console.error('Failed to create collection:', error);
      throw error;
    }
  }

  /**
   * Update an existing collection
   * @param id Collection ID
   * @param data Partial collection data to update
   */
  async updateCollection(id: string, data: Partial<Collection>): Promise<Collection | null> {
    try {
      const apiData = this.prepareCollectionForApi(data as Collection);
      const result = await this.apiClient.updateCollection(id, apiData);
      if (!result) return null;
      return this.transformApiCollection(result);
    } catch (error) {
      console.error(`Failed to update collection ${id}:`, error);
      return null;
    }
  }

  /**
   * Delete a collection
   * @param id Collection ID
   */
  async deleteCollection(id: string): Promise<boolean> {
    try {
      return await this.apiClient.deleteCollection(id);
    } catch (error) {
      console.error(`Failed to delete collection ${id}:`, error);
      return false;
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

      // Handle different response formats
      if (typeof result === 'object' && !Array.isArray(result)) {
        // Object format with IDs as keys
        return Object.entries(result).reduce((acc, [id, group]) => {
          acc[id] = this.transformApiGroup(group);
          return acc;
        }, {} as Record<string, Group>);
      } else if (Array.isArray(result)) {
        // Array format
        return result.reduce((acc, group) => {
          const transformed = this.transformApiGroup(group);
          acc[transformed.id] = transformed;
          return acc;
        }, {} as Record<string, Group>);
      }

      // Fallback for unknown format
      return {};
    } catch (error) {
      console.error('Failed to get groups:', error);
      return {};
    }
  }

  /**
   * Get all groups where a specific user is an admin
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
   * @param data Partial group data to update
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

      // Handle different response formats
      if (typeof result === 'object' && !Array.isArray(result)) {
        // Object format with IDs as keys
        return Object.entries(result).reduce((acc, [id, agent]) => {
          acc[id] = this.transformApiAIAgent(agent);
          return acc;
        }, {} as Record<string, AIAgent>);
      } else if (Array.isArray(result)) {
        // Array format
        return result.reduce((acc, agent) => {
          const transformed = this.transformApiAIAgent(agent);
          acc[transformed.id] = transformed;
          return acc;
        }, {} as Record<string, AIAgent>);
      }

      // Fallback for unknown format
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
   * Transform API message format to app format
   */
  private transformApiMessage(apiMessage: any, conversationId: string): Message {
    // Extract standard fields
    const id = apiMessage.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = apiMessage.timestamp || apiMessage.createdAt || new Date().toISOString();
    const content = apiMessage.content || '';
    const type = apiMessage.type || apiMessage.role || 'unknown';

    // Create the message object in our app format
    return {
      id,
      conversationId,
      timestamp: timestamp,
      content,
      sender: type === 'user' ? 'human' : 'assistant',
      metadata: apiMessage.metadata || {}
    };
  }

  /**
   * Transform API conversation format to app format
   */
  private transformApiConversation(apiConversation: any): Conversation {
    // Extract the conversation ID
    const id = apiConversation.id || apiConversation.threadId;

    // Extract message IDs or create empty array
    const messageIds: string[] = [];

    // If the conversation has decoded messages, extract IDs and store messages
    if (apiConversation.decodedMessages || apiConversation.decoded_messages) {
      const messages = apiConversation.decodedMessages || apiConversation.decoded_messages;
      console.log(`ApiDataSource: Found ${messages?.length || 0} messages in conversation ${id}`);

      if (Array.isArray(messages)) {
        // Transform and cache each message for later retrieval
        messages.forEach(msg => {
          // Generate an ID if none exists
          const msgId = msg.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          messageIds.push(msgId);

          // Store the transformed message in a temporary cache for later retrieval
          const transformedMsg = this.transformApiMessage({...msg, id: msgId}, id);

          // Log message details for debugging
          console.log(`ApiDataSource: Found message ${msgId} in conversation ${id}`, {
            sender: transformedMsg.sender,
            contentLength: transformedMsg.content.length
          });
        });
      }
    }

    // Create the conversation object in our app format
    return {
      id,
      title: apiConversation.title || '',
      startTimestamp: apiConversation.startTimestamp || apiConversation.createdAt || new Date().toISOString(),
      endTimestamp: apiConversation.endTimestamp || apiConversation.updatedAt || undefined,
      status: apiConversation.status || 'active',
      userId: apiConversation.userId || apiConversation.user_id || '',
      userName: apiConversation.userName || apiConversation.user_name || '',
      aiAgentId: apiConversation.aiAgentId || apiConversation.ai_agent_id || '',
      collectionIds: Array.isArray(apiConversation.collectionIds)
                      ? apiConversation.collectionIds
                      : (apiConversation.collection_ids || []),
      messages: messageIds,
      metadata: apiConversation.metadata || {},
      rating: apiConversation.rating || undefined,
      feedbackText: apiConversation.feedbackText || apiConversation.feedback_text || undefined,
      isArchived: apiConversation.isArchived || apiConversation.is_archived || false,
      isShared: apiConversation.isShared || apiConversation.is_shared || false,
      tags: Array.isArray(apiConversation.tags) ? apiConversation.tags : [],
      values: apiConversation.values || undefined
    };
  }

  /**
   * Transform API collection format to app format
   */
  private transformApiCollection(apiCollection: any): Collection {
    // Create the collection object in our app format
    return {
      id: apiCollection.id,
      name: apiCollection.name || '',
      description: apiCollection.description || '',
      createdAt: apiCollection.createdAt || apiCollection.created_at || new Date().toISOString(),
      updatedAt: apiCollection.updatedAt || apiCollection.updated_at || new Date().toISOString(),
      ownerId: apiCollection.ownerId || apiCollection.owner_id || '',
      conversationIds: Array.isArray(apiCollection.conversationIds)
                        ? apiCollection.conversationIds
                        : (apiCollection.conversation_ids || []),
      metadata: apiCollection.metadata || {},
      isPublic: apiCollection.isPublic || apiCollection.is_public || false,
      tags: Array.isArray(apiCollection.tags) ? apiCollection.tags : []
    };
  }

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
      isPrivate: apiGroup.isPrivate || apiGroup.is_private || false
    };
  }

  /**
   * Transform API AI agent format to app format
   */
  private transformApiAIAgent(apiAgent: any): AIAgent {
    // Create the AI agent object in our app format
    return {
      id: apiAgent.id,
      name: apiAgent.name || '',
      description: apiAgent.description || '',
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
      settings: apiUser.settings || {},
      metadata: apiUser.metadata || {},
      isActive: apiUser.isActive || apiUser.is_active || true
    };
  }

  // #endregion

  // #region Preparation Methods

  /**
   * Prepare conversation data for API
   */
  private prepareConversationForApi(conversation: Partial<Conversation>): any {
    // Create a copy to avoid modifying the original
    const apiData: any = { ...conversation };

    // Convert snake_case to camelCase if needed
    if (apiData.user_id === undefined && apiData.userId !== undefined) {
      apiData.user_id = apiData.userId;
      delete apiData.userId;
    }

    if (apiData.ai_agent_id === undefined && apiData.aiAgentId !== undefined) {
      apiData.ai_agent_id = apiData.aiAgentId;
      delete apiData.aiAgentId;
    }

    if (apiData.collection_ids === undefined && apiData.collectionIds !== undefined) {
      apiData.collection_ids = apiData.collectionIds;
      delete apiData.collectionIds;
    }

    if (apiData.start_timestamp === undefined && apiData.startTimestamp !== undefined) {
      apiData.start_timestamp = apiData.startTimestamp;
      delete apiData.startTimestamp;
    }

    if (apiData.end_timestamp === undefined && apiData.endTimestamp !== undefined) {
      apiData.end_timestamp = apiData.endTimestamp;
      delete apiData.endTimestamp;
    }

    if (apiData.feedback_text === undefined && apiData.feedbackText !== undefined) {
      apiData.feedback_text = apiData.feedbackText;
      delete apiData.feedbackText;
    }

    if (apiData.is_archived === undefined && apiData.isArchived !== undefined) {
      apiData.is_archived = apiData.isArchived;
      delete apiData.isArchived;
    }

    if (apiData.is_shared === undefined && apiData.isShared !== undefined) {
      apiData.is_shared = apiData.isShared;
      delete apiData.isShared;
    }

    return apiData;
  }

  /**
   * Prepare collection data for API
   */
  private prepareCollectionForApi(collection: Partial<Collection>): any {
    // Create a copy to avoid modifying the original
    const apiData: any = { ...collection };

    // Convert snake_case to camelCase if needed
    if (apiData.owner_id === undefined && apiData.ownerId !== undefined) {
      apiData.owner_id = apiData.ownerId;
      delete apiData.ownerId;
    }

    if (apiData.conversation_ids === undefined && apiData.conversationIds !== undefined) {
      apiData.conversation_ids = apiData.conversationIds;
      delete apiData.conversationIds;
    }

    if (apiData.is_public === undefined && apiData.isPublic !== undefined) {
      apiData.is_public = apiData.isPublic;
      delete apiData.isPublic;
    }

    return apiData;
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

    return apiData;
  }

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