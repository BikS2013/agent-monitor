import {
  Collection,
  Conversation,
  Message,
  FilterElement
} from '../types';
import { ICollectionDataSource } from './interfaces/ICollectionDataSource';
import { ApiClient } from '../api/ApiClient';

/**
 * API client implementation of the ICollectionDataSource interface.
 * This implementation is dedicated to Collection operations and can be configured
 * independently from other API data sources.
 */
export class CollectionsApiDataSource implements ICollectionDataSource {
  private apiClient: ApiClient;

  /**
   * Creates a new Collections API data source client
   * @param baseUrl The base URL of the Collections API server
   * @param authToken Optional JWT authentication token
   * @param clientSecret Optional client secret for API key authentication
   * @param clientId Optional client ID for API key authentication
   * @param noAuth Whether to disable authentication (no token or API key)
   */
  constructor(
    baseUrl: string = 'http://localhost:8002',
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
      console.log('CollectionsApiDataSource: Initializing with settings:', {
        baseUrl: this.apiClient['apiClient'].defaults.baseURL,
        noAuth: this.apiClient['noAuth'],
        hasToken: !!this.apiClient['authToken'],
        hasClientSecret: !!this.apiClient['clientSecret']
      });

      await this.apiClient.initialize();
      console.log('CollectionsApiDataSource: Successfully initialized API client');
    } catch (error: any) {
      console.error('CollectionsApiDataSource: Failed to initialize data source:', error);
      console.error('CollectionsApiDataSource: Error message:', error?.message);
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
      console.log(`CollectionsApiDataSource: Conversation response structure:`, {
        hasDecodedMessages: !!conversation.decodedMessages,
        hasDecoded_messages: !!conversation.decoded_messages,
        hasMessages: !!conversation.messages,
        messagesType: Array.isArray(conversation.messages) ? 'array' : typeof conversation.messages,
        messageCount: conversation.messageCount || conversation.message_count || 0
      });
      
      if (conversation.decodedMessages && Array.isArray(conversation.decodedMessages)) {
        messages = conversation.decodedMessages;
        console.log(`CollectionsApiDataSource: Using decodedMessages field (${messages.length} messages)`);
      } else if (conversation.decoded_messages && Array.isArray(conversation.decoded_messages)) {
        messages = conversation.decoded_messages;
        console.log(`CollectionsApiDataSource: Using decoded_messages field (${messages.length} messages)`);
      } else if (conversation.messages && Array.isArray(conversation.messages) && 
                 conversation.messages.length > 0 && 
                 typeof conversation.messages[0] === 'object') {
        // If messages array contains objects, use them directly
        messages = conversation.messages;
        console.log(`CollectionsApiDataSource: Using messages field with objects (${messages.length} messages)`);
      } else {
        // If messages are not included or are just IDs, fetch them separately
        console.log(`CollectionsApiDataSource: Messages not included in conversation response, fetching separately for ${conversationId}`);
        try {
          const messagesResponse = await this.apiClient.getConversationMessages(conversationId);
          console.log(`CollectionsApiDataSource: Separate messages response:`, {
            hasItems: !!messagesResponse?.items,
            isArray: Array.isArray(messagesResponse),
            responseType: typeof messagesResponse
          });
          
          if (messagesResponse && messagesResponse.items && Array.isArray(messagesResponse.items)) {
            messages = messagesResponse.items;
            console.log(`CollectionsApiDataSource: Using items from separate messages response (${messages.length} messages)`);
          } else if (Array.isArray(messagesResponse)) {
            messages = messagesResponse;
            console.log(`CollectionsApiDataSource: Using array from separate messages response (${messages.length} messages)`);
          } else {
            console.warn(`CollectionsApiDataSource: Unexpected messages response format:`, messagesResponse);
          }
        } catch (msgError) {
          console.error(`CollectionsApiDataSource: Error fetching messages separately:`, msgError);
        }
      }
      
      // Validate messages before transformation
      if (!Array.isArray(messages)) {
        console.warn(`CollectionsApiDataSource: Messages is not an array, returning empty array`);
        return [];
      }
      
      if (messages.length === 0) {
        console.log(`CollectionsApiDataSource: No messages found for conversation ${conversationId}`);
        return [];
      }
      
      console.log(`CollectionsApiDataSource: Transforming ${messages.length} messages`);
      return messages.map((msg, index) => {
        try {
          return this.transformApiMessage(msg);
        } catch (error) {
          console.error(`CollectionsApiDataSource: Error transforming message ${index}:`, error, msg);
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

  // #endregion

  // #region Conversation Methods

  /**
   * Get a specific conversation by ID
   * @param id Conversation ID
   */
  async getConversationById(id: string): Promise<Conversation | null> {
    try {
      console.log(`CollectionsApiDataSource: Getting conversation by ID: ${id}`);
      const conversation = await this.apiClient.getConversation(id);
      if (!conversation) {
        console.warn(`CollectionsApiDataSource: No conversation returned for ID: ${id}`);
        return null;
      }
      
      console.log(`CollectionsApiDataSource: Successfully retrieved conversation ${id}`);
      return this.transformApiConversation(conversation);
    } catch (error: any) {
      // Check if it's a 404 error
      if (error.status === 404) {
        console.warn(`CollectionsApiDataSource: Conversation ${id} not found (404)`);
      } else {
        console.error(`CollectionsApiDataSource: Failed to get conversation ${id}:`, error);
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
        console.log(`CollectionsApiDataSource: Processing ${result.items.length} conversations from paginated response`);
        const conversationsMap: Record<string, Conversation> = {};
        
        for (const conversation of result.items) {
          const transformed = this.transformApiConversation(conversation);
          conversationsMap[transformed.thread_id] = transformed;
          
          // Log the mapping for debugging
          console.log(`CollectionsApiDataSource: Mapped conversation:`, {
            original_id: conversation.id || conversation.threadId || conversation.thread_id,
            internal_thread_id: transformed.thread_id,
            userName: transformed.userName
          });
        }
        
        return conversationsMap;
      } else if (Array.isArray(result)) {
        // Direct array format
        console.log(`CollectionsApiDataSource: Processing ${result.length} conversations from array response`);
        return result.reduce((acc, conversation) => {
          const transformed = this.transformApiConversation(conversation);
          acc[transformed.thread_id] = transformed;
          return acc;
        }, {} as Record<string, Conversation>);
      } else if (typeof result === 'object' && !Array.isArray(result)) {
        // Object format with IDs as keys
        console.log(`CollectionsApiDataSource: Processing conversations from object response`);
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
      const result = await this.apiClient.getCollections({ ids });

      // Handle different response formats
      let collections: any[] = [];
      
      if (result.items && Array.isArray(result.items)) {
        // Standard API response format with items wrapper
        collections = result.items;
      } else if (Array.isArray(result)) {
        // Direct array format (legacy)
        collections = result;
      } else if (typeof result === 'object' && !Array.isArray(result) && !result.items) {
        // Object format with IDs as keys (legacy)
        return Object.entries(result).reduce((acc, [id, coll]) => {
          acc[id] = this.transformApiCollection(coll);
          return acc;
        }, {} as Record<string, Collection>);
      }

      // Transform array to record with IDs as keys
      return collections.reduce((acc, coll) => {
        const transformed = this.transformApiCollection(coll);
        acc[transformed.id] = transformed;
        return acc;
      }, {} as Record<string, Collection>);
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
      const result = await this.apiClient.getCollectionsByGroup(groupId);
      
      // Handle different response formats
      let collections: any[] = [];
      
      if (result.items && Array.isArray(result.items)) {
        // Standard API response format with items wrapper
        collections = result.items;
      } else if (Array.isArray(result)) {
        // Direct array format (legacy)
        collections = result;
      }
      
      return collections.map(coll => this.transformApiCollection(coll));
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
      const result = await this.apiClient.getCollectionsByCreator(creatorId);
      
      // Handle different response formats
      let collections: any[] = [];
      
      if (result.items && Array.isArray(result.items)) {
        // Standard API response format with items wrapper
        collections = result.items;
      } else if (Array.isArray(result)) {
        // Direct array format (legacy)
        collections = result;
      }
      
      return collections.map(coll => this.transformApiCollection(coll));
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
   * @param data Updated collection data
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
        return result.items.map((conv: any) => conv.threadId || conv.thread_id);
      } else if (Array.isArray(result)) {
        return result.map((conv: any) => conv.threadId || conv.thread_id);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to filter conversations:', error);
      return [];
    }
  }

  // #endregion

  // #region Helper Methods

  /**
   * Transform API message to internal Message format
   */
  private transformApiMessage(apiMessage: any): Message {
    // Log the raw message for debugging
    console.log('CollectionsApiDataSource: Transforming API message:', apiMessage);
    
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
    
    console.log('CollectionsApiDataSource: Transformed message:', transformed);
    return transformed;
  }

  /**
   * Transform API conversation to internal Conversation format
   */
  private transformApiConversation(apiConversation: any): Conversation {
    // Log the raw conversation for debugging
    console.log('CollectionsApiDataSource: Raw API conversation:', {
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
    
    console.log('CollectionsApiDataSource: Transformed conversation:', {
      thread_id: transformed.thread_id,
      messageCount: transformed.messageCount
    });
    
    return transformed;
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
      conversationIds: Array.isArray(apiCollection.conversations)
                        ? apiCollection.conversations
                        : (Array.isArray(apiCollection.conversationIds)
                          ? apiCollection.conversationIds
                          : (apiCollection.conversation_ids || [])),
      metadata: apiCollection.metadata || {},
      isPublic: apiCollection.isPublic || apiCollection.is_public || false,
      tags: Array.isArray(apiCollection.tags) ? apiCollection.tags : [],
      // Additional fields from the API specification
      filter: apiCollection.filter || [],
      creator: apiCollection.creator || '',
      accessPermissions: Array.isArray(apiCollection.accessPermissions) 
                          ? apiCollection.accessPermissions 
                          : (apiCollection.access_permissions || [])
    };
  }

  /**
   * Prepare collection data for API
   */
  private prepareCollectionForApi(collection: Partial<Collection>): any {
    // Create a copy to avoid modifying the original
    const apiData: any = { ...collection };

    // Handle filter field - keep as is since API expects 'filter'
    if (apiData.filter) {
      // Ensure filter is an array
      if (!Array.isArray(apiData.filter)) {
        apiData.filter = [apiData.filter];
      }
    } else if (apiData.filterCriteria) {
      // Convert legacy filterCriteria to new filter format
      const filter: FilterElement = {};
      
      if (apiData.filterCriteria.aiAgentBased) {
        filter.aiAgentIds = apiData.filterCriteria.aiAgentBased;
      }
      
      if (apiData.filterCriteria.timeBased) {
        filter.timeRange = apiData.filterCriteria.timeBased;
      }
      
      if (apiData.filterCriteria.outcomeBased) {
        filter.outcome = apiData.filterCriteria.outcomeBased;
      }
      
      apiData.filter = [filter];
      delete apiData.filterCriteria;
    }

    // Remove conversations field if present (not sent to API)
    delete apiData.conversations;
    delete apiData.conversationIds;

    // Keep most fields as-is since the API spec uses camelCase
    // Only convert fields that are truly snake_case in the API
    
    return apiData;
  }

  // #endregion
}