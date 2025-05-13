import { IMessageRepository } from '../interfaces/IMessageRepository';
import { QueryOptions, FilterOptions, QueryResult } from '../interfaces/IRepository';
import { Message } from '../../types';
import { BaseRepository } from './BaseRepository';
import { IDataSource } from '../../sources/IDataSource';

/**
 * Repository implementation for Message entities
 */
export class MessageRepository extends BaseRepository<Message> implements IMessageRepository {
  constructor(dataSource: IDataSource) {
    super(dataSource);
  }
  
  /**
   * Get a message by ID
   */
  async getById(id: string): Promise<Message | null> {
    return this.dataSource.getMessageById(id);
  }
  
  /**
   * Get all messages with pagination and filtering
   */
  async getAll(options?: QueryOptions): Promise<QueryResult<Message>> {
    const messages = await this.dataSource.getMessages();
    const allMessages = Object.values(messages);
    
    // Apply filtering
    const filteredMessages = this.filterItems(allMessages, options?.filter);
    const total = filteredMessages.length;
    
    // Apply pagination
    const paginatedMessages = this.applyPagination(filteredMessages, options);
    
    return this.formatQueryResult(paginatedMessages, total, options);
  }
  
  /**
   * Get multiple messages by IDs
   */
  async getByIds(ids: string[]): Promise<Message[]> {
    const messages = await this.dataSource.getMessages(ids);
    return Object.values(messages);
  }
  
  /**
   * Create a new message
   */
  async create(data: Omit<Message, 'id'>): Promise<Message> {
    return this.dataSource.createMessage(data);
  }
  
  /**
   * Update an existing message
   */
  async update(id: string, data: Partial<Message>): Promise<Message | null> {
    return this.dataSource.updateMessage(id, data);
  }
  
  /**
   * Delete a message
   */
  async delete(id: string): Promise<boolean> {
    return this.dataSource.deleteMessage(id);
  }
  
  /**
   * Count messages matching filter criteria
   */
  async count(filter?: FilterOptions): Promise<number> {
    const messages = await this.dataSource.getMessages();
    const allMessages = Object.values(messages);
    
    if (!filter) {
      return allMessages.length;
    }
    
    const filteredMessages = this.filterItems(allMessages, filter);
    return filteredMessages.length;
  }
  
  /**
   * Get messages by conversation ID
   */
  async getByConversationId(thread_id: string, includeSender?: boolean): Promise<Message[]> {
    const messages = await this.dataSource.getMessagesByConversationId(thread_id);
    
    if (!includeSender) {
      return messages;
    }
    
    // In a real implementation, we would fetch sender details here
    // For now, we're just returning the messages since the sender name is already included
    return messages;
  }
  
  /**
   * Get the first message in a conversation
   */
  async getFirstMessageInConversation(thread_id: string): Promise<Message | null> {
    const messages = await this.dataSource.getMessagesByConversationId(thread_id);
    
    if (messages.length === 0) {
      return null;
    }
    
    // Messages are already sorted by timestamp
    return messages[0];
  }
  
  /**
   * Get the last message in a conversation
   */
  async getLastMessageInConversation(thread_id: string): Promise<Message | null> {
    const messages = await this.dataSource.getMessagesByConversationId(thread_id);
    
    if (messages.length === 0) {
      return null;
    }
    
    // Messages are already sorted by timestamp
    return messages[messages.length - 1];
  }
  
  /**
   * Count messages in a conversation
   */
  async countByConversationId(thread_id: string): Promise<number> {
    const messages = await this.dataSource.getMessagesByConversationId(thread_id);
    return messages.length;
  }
  
  /**
   * Find messages by content search
   */
  async searchByContent(searchText: string, filter?: FilterOptions): Promise<QueryResult<Message>> {
    const messages = await this.dataSource.getMessages();
    const allMessages = Object.values(messages);
    
    // Filter messages by content
    const matchingMessages = allMessages.filter(message => 
      message.content.toLowerCase().includes(searchText.toLowerCase())
    );
    
    // Apply additional filtering
    const filteredMessages = this.filterItems(matchingMessages, filter);
    const total = filteredMessages.length;
    
    // We're not applying pagination here, but in a real implementation we would
    return {
      data: filteredMessages,
      total,
      hasMore: false
    };
  }
}