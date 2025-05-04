import { IRepository, FilterOptions, QueryResult } from './IRepository';
import { Message } from '../../types';

/**
 * Repository interface for Message entities
 */
export interface IMessageRepository extends IRepository<Message> {
  /**
   * Get messages by conversation ID
   * @param conversationId Conversation ID
   * @param includeSender Whether to include sender details
   */
  getByConversationId(conversationId: string, includeSender?: boolean): Promise<Message[]>;
  
  /**
   * Get the first message in a conversation
   * @param conversationId Conversation ID
   */
  getFirstMessageInConversation(conversationId: string): Promise<Message | null>;
  
  /**
   * Get the last message in a conversation
   * @param conversationId Conversation ID
   */
  getLastMessageInConversation(conversationId: string): Promise<Message | null>;
  
  /**
   * Count messages in a conversation
   * @param conversationId Conversation ID
   */
  countByConversationId(conversationId: string): Promise<number>;
  
  /**
   * Find messages by content search
   * @param searchText Text to search for
   * @param filter Additional filter options
   */
  searchByContent(searchText: string, filter?: FilterOptions): Promise<QueryResult<Message>>;
}