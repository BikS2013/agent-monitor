import { IRepository, FilterOptions, QueryResult, QueryOptions } from './IRepository';
import { Message } from '../../types';

/**
 * Repository interface for Message entities
 */
export interface IMessageRepository extends IRepository<Message> {
  /**
   * Get messages by conversation ID
   * @param thread_id Thread ID of the conversation
   * @param includeSender Whether to include sender details
   */
  getByConversationId(thread_id: string, includeSender?: boolean): Promise<Message[]>;
  
  /**
   * Get the first message in a conversation
   * @param thread_id Thread ID of the conversation
   */
  getFirstMessageInConversation(thread_id: string): Promise<Message | null>;
  
  /**
   * Get the last message in a conversation
   * @param thread_id Thread ID of the conversation
   */
  getLastMessageInConversation(thread_id: string): Promise<Message | null>;
  
  /**
   * Count messages in a conversation
   * @param thread_id Thread ID of the conversation
   */
  countByConversationId(thread_id: string): Promise<number>;
  
  /**
   * Find messages by content search
   * @param searchText Text to search for
   * @param filter Additional filter options
   */
  searchByContent(searchText: string, filter?: FilterOptions): Promise<QueryResult<Message>>;
}