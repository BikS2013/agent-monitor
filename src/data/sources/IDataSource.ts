import { 
  Message, 
  Conversation, 
  Collection, 
  Group, 
  AIAgent, 
  User 
} from '../types';

/**
 * Data source interface defining methods to access raw data
 * This abstraction allows swapping of different data backends
 */
export interface IDataSource {
  /**
   * Initialize the data source
   */
  initialize(): Promise<void>;
  
  /* Basic CRUD operations for each entity type */
  
  // Messages
  getMessageById(id: string): Promise<Message | null>;
  getMessages(ids?: string[]): Promise<Record<string, Message>>;
  getMessagesByConversationId(conversationId: string): Promise<Message[]>;
  createMessage(data: Omit<Message, 'id'>): Promise<Message>;
  updateMessage(id: string, data: Partial<Message>): Promise<Message | null>;
  deleteMessage(id: string): Promise<boolean>;
  
  // Conversations
  getConversationById(id: string): Promise<Conversation | null>;
  getConversations(ids?: string[]): Promise<Record<string, Conversation>>;
  getConversationsByCollectionId(collectionId: string): Promise<Conversation[]>;
  getConversationsByAIAgentId(aiAgentId: string): Promise<Conversation[]>;
  getConversationsByUserId(userId: string): Promise<Conversation[]>;
  createConversation(data: Omit<Conversation, 'id'>): Promise<Conversation>;
  updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation | null>;
  deleteConversation(id: string): Promise<boolean>;
  
  // Collections
  getCollectionById(id: string): Promise<Collection | null>;
  getCollections(ids?: string[]): Promise<Record<string, Collection>>;
  getCollectionsByGroupId(groupId: string): Promise<Collection[]>;
  getCollectionsByCreatorId(creatorId: string): Promise<Collection[]>;
  createCollection(data: Omit<Collection, 'id'>): Promise<Collection>;
  updateCollection(id: string, data: Partial<Collection>): Promise<Collection | null>;
  deleteCollection(id: string): Promise<boolean>;
  
  // Groups
  getGroupById(id: string): Promise<Group | null>;
  getGroups(ids?: string[]): Promise<Record<string, Group>>;
  getGroupsByAdminUserId(userId: string): Promise<Group[]>;
  createGroup(data: Omit<Group, 'id'>): Promise<Group>;
  updateGroup(id: string, data: Partial<Group>): Promise<Group | null>;
  deleteGroup(id: string): Promise<boolean>;
  
  // AI Agents
  getAIAgentById(id: string): Promise<AIAgent | null>;
  getAIAgents(ids?: string[]): Promise<Record<string, AIAgent>>;
  getAIAgentsByStatus(status: 'active' | 'inactive' | 'training'): Promise<AIAgent[]>;
  createAIAgent(data: Omit<AIAgent, 'id'>): Promise<AIAgent>;
  updateAIAgent(id: string, data: Partial<AIAgent>): Promise<AIAgent | null>;
  deleteAIAgent(id: string): Promise<boolean>;
  
  // Users
  getUserById(id: string): Promise<User | null>;
  getUsers(ids?: string[]): Promise<Record<string, User>>;
  getUsersByRole(role: string): Promise<User[]>;
  createUser(data: Omit<User, 'id'>): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;
  getCurrentUser(): Promise<User | null>;
  
  /* Query operations for filtering data */
  
  // Filter conversations by complex criteria
  filterConversations(filterCriteria: any): Promise<string[]>;
  
  /* Data maintenance operations */
  
  // Save all data to persistent storage
  saveData(): Promise<void>;
  
  // Clear all cached data
  clearCache(): Promise<void>;
}