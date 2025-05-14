import { IRepository, FilterOptions, QueryOptions, QueryResult } from './IRepository';
import { Conversation, Message } from '../../types';

/**
 * Repository interface for Conversation entities
 */
export interface IConversationRepository extends IRepository<Conversation> {
  /**
   * Get messages for a conversation (lazy loading)
   * @param thread_id Conversation thread ID
   * @param options Query options
   */
  getMessages(thread_id: string, options?: QueryOptions): Promise<QueryResult<Message>>;
  
  /**
   * Get conversations by collection ID
   * @param collectionId Collection ID
   * @param options Query options
   */
  getByCollectionId(collectionId: string, options?: QueryOptions): Promise<QueryResult<Conversation>>;
  
  /**
   * Get conversations by AI agent ID
   * @param aiAgentId AI agent ID
   * @param options Query options
   */
  getByAIAgentId(aiAgentId: string, options?: QueryOptions): Promise<QueryResult<Conversation>>;
  
  /**
   * Get conversations by user ID
   * @param userId User ID
   * @param options Query options
   */
  getByUserId(userId: string, options?: QueryOptions): Promise<QueryResult<Conversation>>;
  
  /**
   * Filter conversations by criteria
   * @param criteria Filter criteria
   * @param options Query options
   */
  filter(criteria: {
    aiAgentIds?: string[];
    timeRange?: { startDate?: string; endDate?: string; period?: string };
    outcome?: 'successful' | 'unsuccessful' | 'all';
    priority?: 'low' | 'medium' | 'high';
    status?: 'active' | 'closed';
    search?: string;
  }, options?: QueryOptions): Promise<QueryResult<Conversation>>;
  
  /**
   * Get first message timestamp for a conversation
   * @param thread_id Conversation thread ID
   */
  getFirstMessageTimestamp(thread_id: string): Promise<string | null>;
  
  /**
   * Get last message timestamp for a conversation
   * @param thread_id Conversation thread ID
   */
  getLastMessageTimestamp(thread_id: string): Promise<string | null>;
}