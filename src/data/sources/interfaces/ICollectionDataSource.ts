import { Collection, Conversation, Message } from '../../types';
import { IBaseDataSource } from './IBaseDataSource';

/**
 * Interface for Collection data sources
 * Contains collection related operations and conversation/message support for data consistency
 */
export interface ICollectionDataSource extends IBaseDataSource {
  // Collection operations
  getCollectionById(id: string): Promise<Collection | null>;
  getCollections(ids?: string[]): Promise<Record<string, Collection>>;
  getCollectionsByGroupId(groupId: string): Promise<Collection[]>;
  getCollectionsByCreatorId(creatorId: string): Promise<Collection[]>;
  createCollection(data: Omit<Collection, 'id'>): Promise<Collection>;
  updateCollection(id: string, data: Partial<Collection>): Promise<Collection | null>;
  deleteCollection(id: string): Promise<boolean>;
  
  // Conversation operations (for data consistency with collections)
  getConversationById(thread_id: string): Promise<Conversation | null>;
  getConversations(ids?: string[]): Promise<Record<string, Conversation>>;
  getConversationsByCollectionId(collectionId: string): Promise<Conversation[]>;
  getConversationsByAIAgentId(aiAgentId: string): Promise<Conversation[]>;
  getConversationsByUserId(userId: string): Promise<Conversation[]>;
  
  // Message operations (for collection conversation support)
  getMessagesByConversationId(thread_id: string): Promise<Message[]>;
  
  // Filter conversations by complex criteria (for collection filtering)
  filterConversations(filterCriteria: any): Promise<string[]>;
}