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
 * Dedicated API client implementation for the Conversations page.
 * This implementation communicates with a dedicated Conversations API server.
 */
export class ConversationsApiDataSource implements IDataSource {
  private apiClient: ApiClient;

  /**
   * Creates a new Conversations API data source client
   * @param baseUrl The base URL of the Conversations API server
   * @param authToken Optional JWT authentication token
   * @param clientSecret Optional client secret for API key authentication
   * @param clientId Optional client ID for API key authentication
   * @param noAuth Whether to disable authentication (no token or API key)
   */
  constructor(
    baseUrl: string = 'http://localhost:8001',
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
      console.log('ConversationsApiDataSource: Initializing with settings:', {
        baseUrl: this.apiClient['apiClient'].defaults.baseURL,
        noAuth: this.apiClient['noAuth'],
        hasToken: !!this.apiClient['authToken'],
        hasClientSecret: !!this.apiClient['clientSecret']
      });

      await this.apiClient.initialize();
      console.log('ConversationsApiDataSource: Successfully initialized API client');
    } catch (error) {
      console.error('ConversationsApiDataSource: Failed to initialize data source:', error);
      console.error('ConversationsApiDataSource: Error message:', error.message);
      throw error;
    }
  }

  // #region Message Methods

  /**
   * Get a specific message by ID
   * @param id Message ID
   */
  async getMessageById(id: string): Promise<Message | null> {
    console.warn('getMessageById not supported by Conversations API, messages are stored in conversations');
    return null;
  }

  /**
   * Get multiple messages by their IDs
   * @param ids Optional array of message IDs. If not provided, returns all messages
   */
  async getMessages(ids?: string[]): Promise<Record<string, Message>> {
    console.warn('getMessages not supported by Conversations API, messages are stored in conversations');
    return {};
  }

  /**
   * Get all messages for a specific conversation
   * @param conversationId Conversation ID
   */
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    try {
      // First try to get the conversation with messages included
      const conversation = await this.apiClient.getConversation(conversationId, true);
      
      // Handle different response formats
      let messages: any[] = [];
      
      // Log the conversation response for debugging
      console.log(`ConversationsApiDataSource: Conversation response structure:`, {
        hasDecodedMessages: !!conversation.decodedMessages,
        hasDecoded_messages: !!conversation.decoded_messages,
        hasMessages: !!conversation.messages,
        messagesType: Array.isArray(conversation.messages) ? 'array' : typeof conversation.messages,
        messageCount: conversation.messageCount || conversation.message_count || 0
      });
      
      if (conversation.decodedMessages && Array.isArray(conversation.decodedMessages)) {
        messages = conversation.decodedMessages;
        console.log(`ConversationsApiDataSource: Using decodedMessages field (${messages.length} messages)`);
      } else if (conversation.decoded_messages && Array.isArray(conversation.decoded_messages)) {
        messages = conversation.decoded_messages;
        console.log(`ConversationsApiDataSource: Using decoded_messages field (${messages.length} messages)`);
      } else if (conversation.messages && Array.isArray(conversation.messages) && 
                 conversation.messages.length > 0 && 
                 typeof conversation.messages[0] === 'object') {
        // If messages array contains objects, use them directly
        messages = conversation.messages;
        console.log(`ConversationsApiDataSource: Using messages field with objects (${messages.length} messages)`);
      } else {
        // If messages are not included or are just IDs, fetch them separately
        console.log(`ConversationsApiDataSource: Messages not included in conversation response, fetching separately for ${conversationId}`);
        try {
          const messagesResponse = await this.apiClient.getConversationMessages(conversationId);
          console.log(`ConversationsApiDataSource: Separate messages response:`, {
            hasItems: !!messagesResponse?.items,
            isArray: Array.isArray(messagesResponse),
            responseType: typeof messagesResponse
          });
          
          if (messagesResponse && messagesResponse.items && Array.isArray(messagesResponse.items)) {
            messages = messagesResponse.items;
            console.log(`ConversationsApiDataSource: Using items from separate messages response (${messages.length} messages)`);
          } else if (Array.isArray(messagesResponse)) {
            messages = messagesResponse;
            console.log(`ConversationsApiDataSource: Using array from separate messages response (${messages.length} messages)`);
          } else {
            console.warn(`ConversationsApiDataSource: Unexpected messages response format:`, messagesResponse);
          }
        } catch (msgError) {
          console.error(`ConversationsApiDataSource: Error fetching messages separately:`, msgError);
        }
      }
      
      // Validate messages before transformation
      if (!Array.isArray(messages)) {
        console.warn(`ConversationsApiDataSource: Messages is not an array, returning empty array`);
        return [];
      }
      
      if (messages.length === 0) {
        console.log(`ConversationsApiDataSource: No messages found for conversation ${conversationId}`);
        return [];
      }
      
      console.log(`ConversationsApiDataSource: Transforming ${messages.length} messages`);
      return messages.map((msg, index) => {
        try {
          return this.transformApiMessage(msg);
        } catch (error) {
          console.error(`ConversationsApiDataSource: Error transforming message ${index}:`, error, msg);
          // Return a placeholder message on error
          return {
            id: `error_msg_${index}`,
            content: '[Error loading message]',
            sender: 'user' as const,
            senderName: 'Unknown'
          };
        }
      });
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
    console.warn('createMessage not supported by Conversations API, messages are stored in conversations');
    return {
      ...data as any,
      id: `msg_${Date.now()}`,
    };
  }

  /**
   * Update an existing message
   * @param id Message ID
   * @param data Updated message data
   */
  async updateMessage(id: string, data: Partial<Message>): Promise<Message | null> {
    console.warn('updateMessage not supported by Conversations API, messages are stored in conversations');
    return null;
  }

  /**
   * Delete a message
   * @param id Message ID
   */
  async deleteMessage(id: string): Promise<boolean> {
    console.warn('deleteMessage not supported by Conversations API, messages are stored in conversations');
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
      console.log(`ConversationsApiDataSource: Getting conversation by ID: ${id}`);
      const conversation = await this.apiClient.getConversation(id);
      if (!conversation) {
        console.warn(`ConversationsApiDataSource: No conversation returned for ID: ${id}`);
        return null;
      }
      
      console.log(`ConversationsApiDataSource: Successfully retrieved conversation ${id}`);
      return this.transformApiConversation(conversation);
    } catch (error: any) {
      // Check if it's a 404 error
      if (error.status === 404) {
        console.warn(`ConversationsApiDataSource: Conversation ${id} not found (404)`);
      } else {
        console.error(`ConversationsApiDataSource: Failed to get conversation ${id}:`, error);
      }
      return null;
    }
  }

  /**
   * Get multiple conversations by their IDs
   * @param ids Optional array of conversation IDs. If not provided, returns all conversations
   */
  async getConversations(ids?: string[]): Promise<Record<string, Conversation>> {
    try {
      const result = await this.apiClient.getConversations({ 
        ids,
        include_pagination: true,
        include_messages: false
      });
      
      // Handle different response formats
      if (result && result.items && Array.isArray(result.items)) {
        // Paginated response format (as per API spec)
        console.log(`ConversationsApiDataSource: Processing ${result.items.length} conversations from paginated response`);
        const conversationsMap: Record<string, Conversation> = {};
        
        for (const conversation of result.items) {
          const transformed = this.transformApiConversation(conversation);
          conversationsMap[transformed.thread_id] = transformed;
          
          // Log the mapping for debugging
          console.log(`ConversationsApiDataSource: Mapped conversation:`, {
            original_id: conversation.id || conversation.threadId || conversation.thread_id,
            internal_thread_id: transformed.thread_id,
            userName: transformed.userName
          });
        }
        
        return conversationsMap;
      } else if (Array.isArray(result)) {
        // Direct array format
        console.log(`ConversationsApiDataSource: Processing ${result.length} conversations from array response`);
        return result.reduce((acc, conversation) => {
          const transformed = this.transformApiConversation(conversation);
          acc[transformed.thread_id] = transformed;
          return acc;
        }, {} as Record<string, Conversation>);
      } else if (typeof result === 'object' && !Array.isArray(result)) {
        // Object format with IDs as keys
        console.log(`ConversationsApiDataSource: Processing conversations from object response`);
        return Object.entries(result).reduce((acc, [id, conversation]) => {
          acc[id] = this.transformApiConversation(conversation);
          return acc;
        }, {} as Record<string, Conversation>);
      }
      
      return {};
    } catch (error) {
      console.error('Failed to get conversations:', error);
      return {};
    }
  }

  /**
   * Get all conversations for a specific collection
   * Note: This method is kept for backwards compatibility and to support collection-related conversation queries
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
  async createConversation(data: Omit<Conversation, 'thread_id'>): Promise<Conversation> {
    try {
      // Transform internal format to API format
      const apiData = {
        userId: data.userId,
        userName: data.userName,
        aiAgentId: data.aiAgentId,
        aiAgentName: data.aiAgentName,
        aiAgentType: data.aiAgentType,
        tags: data.tags || [],
        confidence: data.confidence ? parseFloat(data.confidence.replace('%', '')) / 100 : 0.75,
        initialMessage: data.messages && data.messages.length > 0 ? data.messages[0] : ''
      };

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
   * @param data Updated conversation data
   */
  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation | null> {
    try {
      // Transform internal format to API format
      const apiData: any = {};
      
      if (data.status !== undefined) apiData.status = data.status;
      if (data.conclusion !== undefined) apiData.conclusion = data.conclusion;
      if (data.tags !== undefined) apiData.tags = data.tags;
      if (data.resolutionNotes !== undefined) apiData.resolutionNotes = data.resolutionNotes;
      
      const result = await this.apiClient.updateConversation(id, apiData);
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

  // #endregion

  // #region Collection Methods - Not Supported

  /**
   * Get a specific collection by ID
   * @param id Collection ID
   */
  async getCollectionById(id: string): Promise<Collection | null> {
    console.warn('getCollectionById not supported by Conversations API, use Collections API instead');
    return null;
  }

  /**
   * Get multiple collections by their IDs
   * @param ids Optional array of collection IDs. If not provided, returns all collections
   */
  async getCollections(ids?: string[]): Promise<Record<string, Collection>> {
    console.warn('getCollections not supported by Conversations API, use Collections API instead');
    return {};
  }

  /**
   * Get all collections for a specific group
   * @param groupId Group ID
   */
  async getCollectionsByGroupId(groupId: string): Promise<Collection[]> {
    console.warn('getCollectionsByGroupId not supported by Conversations API, use Collections API instead');
    return [];
  }

  /**
   * Get all collections created by a specific user
   * @param creatorId Creator user ID
   */
  async getCollectionsByCreatorId(creatorId: string): Promise<Collection[]> {
    console.warn('getCollectionsByCreatorId not supported by Conversations API, use Collections API instead');
    return [];
  }

  /**
   * Create a new collection
   * @param data Collection data without the ID
   */
  async createCollection(data: Omit<Collection, 'id'>): Promise<Collection> {
    console.warn('createCollection not supported by Conversations API, use Collections API instead');
    return {
      ...data as any,
      id: `collection_${Date.now()}`,
    };
  }

  /**
   * Update an existing collection
   * @param id Collection ID
   * @param data Updated collection data
   */
  async updateCollection(id: string, data: Partial<Collection>): Promise<Collection | null> {
    console.warn('updateCollection not supported by Conversations API, use Collections API instead');
    return null;
  }

  /**
   * Delete a collection
   * @param id Collection ID
   */
  async deleteCollection(id: string): Promise<boolean> {
    console.warn('deleteCollection not supported by Conversations API, use Collections API instead');
    return false;
  }

  // #endregion

  // #region Group Methods - Not Supported

  /**
   * Get a specific group by ID
   * @param id Group ID
   */
  async getGroupById(id: string): Promise<Group | null> {
    console.warn('getGroupById not supported by Conversations API');
    return null;
  }

  /**
   * Get multiple groups by their IDs
   * @param ids Optional array of group IDs. If not provided, returns all groups
   */
  async getGroups(ids?: string[]): Promise<Record<string, Group>> {
    console.warn('getGroups not supported by Conversations API');
    return {};
  }

  /**
   * Get all groups administered by a specific user
   * @param userId User ID
   */
  async getGroupsByAdminUserId(userId: string): Promise<Group[]> {
    console.warn('getGroupsByAdminUserId not supported by Conversations API');
    return [];
  }

  /**
   * Create a new group
   * @param data Group data without the ID
   */
  async createGroup(data: Omit<Group, 'id'>): Promise<Group> {
    console.warn('createGroup not supported by Conversations API');
    return {
      ...data as any,
      id: `group_${Date.now()}`,
    };
  }

  /**
   * Update an existing group
   * @param id Group ID
   * @param data Updated group data
   */
  async updateGroup(id: string, data: Partial<Group>): Promise<Group | null> {
    console.warn('updateGroup not supported by Conversations API');
    return null;
  }

  /**
   * Delete a group
   * @param id Group ID
   */
  async deleteGroup(id: string): Promise<boolean> {
    console.warn('deleteGroup not supported by Conversations API');
    return false;
  }

  // #endregion

  // #region AI Agent Methods

  /**
   * Get a specific AI agent by ID
   * @param id AI agent ID
   */
  async getAIAgentById(id: string): Promise<AIAgent | null> {
    console.warn('getAIAgentById not implemented for Conversations API');
    return null;
  }

  /**
   * Get multiple AI agents by their IDs
   * @param ids Optional array of AI agent IDs. If not provided, returns all AI agents
   */
  async getAIAgents(ids?: string[]): Promise<Record<string, AIAgent>> {
    console.warn('getAIAgents not implemented for Conversations API');
    return {};
  }

  /**
   * Get all AI agents with a specific status
   * @param status AI agent status
   */
  async getAIAgentsByStatus(status: 'active' | 'inactive' | 'training'): Promise<AIAgent[]> {
    console.warn('getAIAgentsByStatus not implemented for Conversations API');
    return [];
  }

  /**
   * Create a new AI agent
   * @param data AI agent data without the ID
   */
  async createAIAgent(data: Omit<AIAgent, 'id'>): Promise<AIAgent> {
    console.warn('createAIAgent not implemented for Conversations API');
    return {
      ...data as any,
      id: `agent_${Date.now()}`,
    };
  }

  /**
   * Update an existing AI agent
   * @param id AI agent ID
   * @param data Updated AI agent data
   */
  async updateAIAgent(id: string, data: Partial<AIAgent>): Promise<AIAgent | null> {
    console.warn('updateAIAgent not implemented for Conversations API');
    return null;
  }

  /**
   * Delete an AI agent
   * @param id AI agent ID
   */
  async deleteAIAgent(id: string): Promise<boolean> {
    console.warn('deleteAIAgent not implemented for Conversations API');
    return false;
  }

  // #endregion

  // #region User Methods

  /**
   * Get a specific user by ID
   * @param id User ID
   */
  async getUserById(id: string): Promise<User | null> {
    console.warn('getUserById not implemented for Conversations API');
    return null;
  }

  /**
   * Get multiple users by their IDs
   * @param ids Optional array of user IDs. If not provided, returns all users
   */
  async getUsers(ids?: string[]): Promise<Record<string, User>> {
    console.warn('getUsers not implemented for Conversations API');
    return {};
  }

  /**
   * Get all users with a specific role
   * @param role User role
   */
  async getUsersByRole(role: string): Promise<User[]> {
    console.warn('getUsersByRole not implemented for Conversations API');
    return [];
  }

  /**
   * Create a new user
   * @param data User data without the ID
   */
  async createUser(data: Omit<User, 'id'>): Promise<User> {
    console.warn('createUser not implemented for Conversations API');
    return {
      ...data as any,
      id: `user_${Date.now()}`,
    };
  }

  /**
   * Update an existing user
   * @param id User ID
   * @param data Updated user data
   */
  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    console.warn('updateUser not implemented for Conversations API');
    return null;
  }

  /**
   * Delete a user
   * @param id User ID
   */
  async deleteUser(id: string): Promise<boolean> {
    console.warn('deleteUser not implemented for Conversations API');
    return false;
  }

  /**
   * Get the current user
   */
  async getCurrentUser(): Promise<User | null> {
    console.warn('getCurrentUser not implemented for Conversations API');
    return null;
  }

  // #endregion

  // #region Query Methods

  /**
   * Filter conversations by complex criteria
   * @param filterCriteria Filter criteria
   */
  async filterConversations(filterCriteria: any): Promise<string[]> {
    try {
      // Transform filter criteria to API format
      const apiFilter: any = {};
      
      if (filterCriteria.aiAgentIds) {
        apiFilter.aiAgentIds = filterCriteria.aiAgentIds;
      }
      
      if (filterCriteria.timeRange) {
        apiFilter.timeRange = {
          startDate: filterCriteria.timeRange.startDate,
          endDate: filterCriteria.timeRange.endDate
        };
      }
      
      if (filterCriteria.status) {
        apiFilter.status = filterCriteria.status;
      }
      
      if (filterCriteria.conclusion) {
        apiFilter.conclusion = filterCriteria.conclusion;
      }
      
      if (filterCriteria.search) {
        apiFilter.search = filterCriteria.search;
      }
      
      const result = await this.apiClient.filterConversations(apiFilter);
      
      // Extract thread IDs from the result
      if (result && result.items && Array.isArray(result.items)) {
        return result.items.map(conv => conv.threadId || conv.thread_id);
      } else if (Array.isArray(result)) {
        return result.map(conv => conv.threadId || conv.thread_id);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to filter conversations:', error);
      return [];
    }
  }

  // #endregion

  // #region Data Maintenance Methods

  /**
   * Save all data to persistent storage
   */
  async saveData(): Promise<void> {
    console.warn('saveData not implemented for Conversations API');
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    console.warn('clearCache not implemented for Conversations API');
  }

  // #endregion

  // #region Helper Methods

  /**
   * Transform API message to internal Message format
   */
  private transformApiMessage(apiMessage: any): Message {
    // Log the raw message for debugging
    console.log('ConversationsApiDataSource: Transforming API message:', apiMessage);
    
    // Determine sender type
    let sender: 'user' | 'ai' = 'user';
    if (apiMessage.sender === 'ai' || apiMessage.sender === 'assistant' || apiMessage.role === 'assistant') {
      sender = 'ai';
    } else if (apiMessage.sender === 'user' || apiMessage.role === 'user') {
      sender = 'user';
    }
    
    // Determine sender name
    let senderName = apiMessage.senderName || apiMessage.sender_name || '';
    if (!senderName) {
      senderName = sender === 'ai' ? 'AI Assistant' : 'User';
    }
    
    const transformed = {
      id: apiMessage.id || apiMessage.message_id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: apiMessage.content || apiMessage.text || apiMessage.message || '',
      sender: sender,
      senderName: senderName
    };
    
    console.log('ConversationsApiDataSource: Transformed message:', transformed);
    return transformed;
  }

  /**
   * Transform API conversation to internal Conversation format
   */
  private transformApiConversation(apiConversation: any): Conversation {
    // Log the raw conversation for debugging
    console.log('ConversationsApiDataSource: Raw API conversation:', {
      threadId: apiConversation.threadId,
      thread_id: apiConversation.thread_id,
      id: apiConversation.id,
      hasMessages: !!apiConversation.messages,
      hasDecodedMessages: !!apiConversation.decodedMessages
    });
    
    // Handle confidence value - ensure it's a string with %
    let confidence = apiConversation.confidence || '0';
    if (typeof confidence === 'number') {
      confidence = `${Math.round(confidence * 100)}`;
    }
    if (!confidence.includes('%')) {
      confidence = `${confidence}%`;
    }

    // Determine the thread ID - API might use 'id' instead of 'threadId'
    const thread_id = apiConversation.threadId || 
                     apiConversation.thread_id || 
                     apiConversation.id || 
                     `thread_${Date.now()}`;

    const transformed = {
      thread_id: thread_id,
      userId: apiConversation.userId || apiConversation.user_id || '',
      userName: apiConversation.userName || apiConversation.user_name || 'Unknown User',
      aiAgentId: apiConversation.aiAgentId || apiConversation.ai_agent_id || '',
      aiAgentName: apiConversation.aiAgentName || apiConversation.ai_agent_name || 'Unknown AI',
      aiAgentType: apiConversation.aiAgentType || apiConversation.ai_agent_type || 'general',
      status: apiConversation.status || 'active',
      conclusion: apiConversation.conclusion || 'uncertain',
      created_at: apiConversation.createdAt || apiConversation.created_at || new Date().toISOString(),
      updated_at: apiConversation.updatedAt || apiConversation.updated_at,
      messages: apiConversation.messages || [],
      tags: apiConversation.tags || [],
      resolutionNotes: apiConversation.resolutionNotes || apiConversation.resolution_notes || '',
      duration: apiConversation.duration || '0m',
      messageCount: apiConversation.messageCount || apiConversation.message_count || 0,
      confidence: confidence
    };
    
    console.log('ConversationsApiDataSource: Transformed conversation:', {
      thread_id: transformed.thread_id,
      messageCount: transformed.messageCount
    });
    
    return transformed;
  }



  // #endregion
}
