import { IConversationRepository } from '../interfaces/IConversationRepository';
import { QueryOptions, FilterOptions, QueryResult } from '../interfaces/IRepository';
import { Conversation, Message } from '../../types';
import { BaseRepository } from './BaseRepository';
import { IDataSource } from '../../sources/IDataSource';

/**
 * Repository implementation for Conversation entities
 */
export class ConversationRepository extends BaseRepository<Conversation> implements IConversationRepository {
  constructor(dataSource: IDataSource) {
    super(dataSource);
  }

  /**
   * Get a conversation by ID
   * Optionally include related entities
   */
  async getById(id: string, includeRelations: boolean = false): Promise<Conversation | null> {
    console.log(`ConversationRepository: Getting conversation thread_id=${id} with includeRelations=${includeRelations}`);
    let conversation = await this.dataSource.getConversationById(id);

    if (!conversation) {
      console.warn(`ConversationRepository: Conversation thread_id=${id} not found`);
      return null;
    }

    if (!includeRelations) {
      // For lazy loading, return just the conversation metadata without messages
      console.log(`ConversationRepository: Returning conversation thread_id=${id} without messages (lazy loading)`);
      return {
        ...conversation,
        messages: [] // Set messages to empty array to save bandwidth
      };
    }

    // We need to load the messages since includeRelations is true
    if (conversation.messages && conversation.messages.length > 0) {
      // The conversation already has message IDs, but we need to load the actual messages
      console.log(`ConversationRepository: Loading messages for conversation thread_id=${id} (${conversation.messages.length} message IDs found)`);

      // Now we need to load the actual message content for these IDs
      const messages = await this.dataSource.getMessagesByConversationId(id);
      console.log(`ConversationRepository: Loaded ${messages.length} messages for conversation thread_id=${id}`);

      // Return conversation with messages loaded
      return {
        ...conversation,
        messagesLoaded: true
      };
    }

    console.log(`ConversationRepository: Returning conversation thread_id=${id} with no message IDs found`);
    return conversation;
  }

  /**
   * Get all conversations with pagination and filtering
   */
  async getAll(options?: QueryOptions): Promise<QueryResult<Conversation>> {
    const conversations = await this.dataSource.getConversations();
    const allConversations = Object.values(conversations);

    // Apply filtering
    const filteredConversations = this.filterItems(allConversations, options?.filter);
    const total = filteredConversations.length;

    // Apply pagination
    const paginatedConversations = this.applyPagination(filteredConversations, options);

    // For lazy loading, strip out message arrays to save bandwidth
    const lightweightConversations = paginatedConversations.map(conversation => ({
      ...conversation,
      messages: []
    }));

    return this.formatQueryResult(lightweightConversations, total, options);
  }

  /**
   * Get multiple conversations by IDs
   */
  async getByIds(ids: string[], includeRelations: boolean = false): Promise<Conversation[]> {
    const conversations = await this.dataSource.getConversations(ids);
    const result = Object.values(conversations);

    if (!includeRelations) {
      // For lazy loading, strip out message arrays
      return result.map(conversation => ({
        ...conversation,
        messages: []
      }));
    }

    return result;
  }

  /**
   * Create a new conversation
   */
  async create(data: Omit<Conversation, 'thread_id'>): Promise<Conversation> {
    return this.dataSource.createConversation(data);
  }

  /**
   * Update an existing conversation
   */
  async update(id: string, data: Partial<Conversation>): Promise<Conversation | null> {
    return this.dataSource.updateConversation(id, data);
  }

  /**
   * Delete a conversation
   */
  async delete(id: string): Promise<boolean> {
    return this.dataSource.deleteConversation(id);
  }

  /**
   * Count conversations matching filter criteria
   */
  async count(filter?: FilterOptions): Promise<number> {
    const conversations = await this.dataSource.getConversations();
    const allConversations = Object.values(conversations);

    if (!filter) {
      return allConversations.length;
    }

    const filteredConversations = this.filterItems(allConversations, filter);
    return filteredConversations.length;
  }

  /**
   * Get messages for a conversation (lazy loading)
   */
  async getMessages(thread_id: string, options?: QueryOptions): Promise<QueryResult<Message>> {
    const messages = await this.dataSource.getMessagesByConversationId(thread_id);

    // Apply filtering if provided
    const filteredMessages = this.filterItems(messages, options?.filter);
    const total = filteredMessages.length;

    // Apply pagination if provided
    const paginatedMessages = this.applyPagination(filteredMessages, options);

    return this.formatQueryResult(paginatedMessages, total, options);
  }

  /**
   * Get conversations by collection ID
   */
  async getByCollectionId(collectionId: string, options?: QueryOptions): Promise<QueryResult<Conversation>> {
    const conversations = await this.dataSource.getConversationsByCollectionId(collectionId);

    // Apply filtering if provided
    const filteredConversations = this.filterItems(conversations, options?.filter);
    const total = filteredConversations.length;

    // Apply pagination if provided
    const paginatedConversations = this.applyPagination(filteredConversations, options);

    // For lazy loading, strip out message arrays
    const lightweightConversations = paginatedConversations.map(conversation => ({
      ...conversation,
      messages: []
    }));

    return this.formatQueryResult(lightweightConversations, total, options);
  }

  /**
   * Get conversations by AI agent ID
   */
  async getByAIAgentId(aiAgentId: string, options?: QueryOptions): Promise<QueryResult<Conversation>> {
    const conversations = await this.dataSource.getConversationsByAIAgentId(aiAgentId);

    // Apply filtering if provided
    const filteredConversations = this.filterItems(conversations, options?.filter);
    const total = filteredConversations.length;

    // Apply pagination if provided
    const paginatedConversations = this.applyPagination(filteredConversations, options);

    // For lazy loading, strip out message arrays
    const lightweightConversations = paginatedConversations.map(conversation => ({
      ...conversation,
      messages: []
    }));

    return this.formatQueryResult(lightweightConversations, total, options);
  }

  /**
   * Get conversations by user ID
   */
  async getByUserId(userId: string, options?: QueryOptions): Promise<QueryResult<Conversation>> {
    const conversations = await this.dataSource.getConversationsByUserId(userId);

    // Apply filtering if provided
    const filteredConversations = this.filterItems(conversations, options?.filter);
    const total = filteredConversations.length;

    // Apply pagination if provided
    const paginatedConversations = this.applyPagination(filteredConversations, options);

    // For lazy loading, strip out message arrays
    const lightweightConversations = paginatedConversations.map(conversation => ({
      ...conversation,
      messages: []
    }));

    return this.formatQueryResult(lightweightConversations, total, options);
  }

  /**
   * Filter conversations by criteria
   */
  async filter(criteria: {
    aiAgentIds?: string[];
    timeRange?: { startDate?: string; endDate?: string; period?: string };
    outcome?: 'successful' | 'unsuccessful' | 'all';
    priority?: 'low' | 'medium' | 'high';
    status?: 'active' | 'closed';
    search?: string;
  }, options?: QueryOptions): Promise<QueryResult<Conversation>> {
    const conversations = await this.dataSource.getConversations();
    const allConversations = Object.values(conversations);

    // Convert the criteria to a format compatible with filterConversationsByCollectionCriteria
    const filterCriteria: any = {};

    if (criteria.aiAgentIds && criteria.aiAgentIds.length > 0) {
      filterCriteria.aiAgentBased = criteria.aiAgentIds;
    }

    if (criteria.timeRange) {
      filterCriteria.timeBased = criteria.timeRange;
    }

    if (criteria.outcome) {
      filterCriteria.outcomeBased = criteria.outcome;
    }

    // Apply basic filtering for criteria not handled by filterConversationsByCollectionCriteria
    let filteredConversations = allConversations;

    if (criteria.priority) {
      filteredConversations = filteredConversations.filter(
        conversation => conversation.priority === criteria.priority
      );
    }

    if (criteria.status) {
      filteredConversations = filteredConversations.filter(
        conversation => conversation.status === criteria.status
      );
    }

    if (criteria.search) {
      const searchLower = criteria.search.toLowerCase();
      filteredConversations = filteredConversations.filter(
        conversation =>
          conversation.resolutionNotes?.toLowerCase().includes(searchLower) ||
          conversation.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply additional filtering if provided in options
    const furtherFilteredConversations = this.filterItems(filteredConversations, options?.filter);
    const total = furtherFilteredConversations.length;

    // Apply pagination if provided
    const paginatedConversations = this.applyPagination(furtherFilteredConversations, options);

    // For lazy loading, strip out message arrays
    const lightweightConversations = paginatedConversations.map(conversation => ({
      ...conversation,
      messages: []
    }));

    return this.formatQueryResult(lightweightConversations, total, options);
  }

  /**
   * Get first message timestamp for a conversation
   */
  async getFirstMessageTimestamp(thread_id: string): Promise<string | null> {
    const firstMessage = await this.dataSource
      .getMessagesByConversationId(thread_id)
      .then(messages => messages.length > 0 ? messages[0] : null);

    return firstMessage ? firstMessage.timestamp : null;
  }

  /**
   * Get last message timestamp for a conversation
   */
  async getLastMessageTimestamp(thread_id: string): Promise<string | null> {
    const messages = await this.dataSource.getMessagesByConversationId(thread_id);

    if (messages.length === 0) {
      return null;
    }

    // Messages are sorted by timestamp, so the last one is the most recent
    return messages[messages.length - 1].timestamp;
  }
}