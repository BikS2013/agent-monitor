import { Message, Conversation, User } from '../../types';
import { IBaseDataSource } from './IBaseDataSource';

/**
 * Interface for Conversation data sources
 * Contains conversation and message related operations
 */
export interface IConversationDataSource extends IBaseDataSource {
  // Message operations
  getMessageById(id: string): Promise<Message | null>;
  getMessages(ids?: string[]): Promise<Record<string, Message>>;
  getMessagesByConversationId(thread_id: string): Promise<Message[]>;
  createMessage(data: Omit<Message, 'id'>): Promise<Message>;
  updateMessage(id: string, data: Partial<Message>): Promise<Message | null>;
  deleteMessage(id: string): Promise<boolean>;
  
  // Conversation operations
  getConversationById(thread_id: string): Promise<Conversation | null>;
  getConversations(ids?: string[]): Promise<Record<string, Conversation>>;
  getConversationsByCollectionId(collectionId: string): Promise<Conversation[]>;
  getConversationsByAIAgentId(aiAgentId: string): Promise<Conversation[]>;
  getConversationsByUserId(userId: string): Promise<Conversation[]>;
  createConversation(data: Omit<Conversation, 'thread_id'>): Promise<Conversation>;
  updateConversation(thread_id: string, data: Partial<Conversation>): Promise<Conversation | null>;
  deleteConversation(thread_id: string): Promise<boolean>;
  
  // Filter conversations by complex criteria
  filterConversations(filterCriteria: any): Promise<string[]>;
  
  // Basic user support (for conversation context)
  getCurrentUser?(): Promise<User | null>;
}