import { AIAgent, User, Conversation, Group } from '../../types';
import { IBaseDataSource } from './IBaseDataSource';

/**
 * Interface for AI Agents data sources
 * Contains only AI Agent and User related operations that AI Agents API actually supports
 */
export interface IAIAgentDataSource extends IBaseDataSource {
  // AI Agents operations (fully supported)
  getAIAgentById(id: string): Promise<AIAgent | null>;
  getAIAgents(ids?: string[]): Promise<Record<string, AIAgent>>;
  getAIAgentsByStatus(status: 'active' | 'inactive' | 'training'): Promise<AIAgent[]>;
  createAIAgent(data: Omit<AIAgent, 'id'>): Promise<AIAgent>;
  updateAIAgent(id: string, data: Partial<AIAgent>): Promise<AIAgent | null>;
  deleteAIAgent(id: string): Promise<boolean>;
  
  // User operations (read-only support)
  getUserById(id: string): Promise<User | null>;
  getUsers(ids?: string[]): Promise<Record<string, User>>;
  getUsersByRole(role: string): Promise<User[]>;
  getCurrentUser(): Promise<User | null>;
  
  // User modification operations (optional - some AI Agent APIs may support these)
  createUser?(data: Omit<User, 'id'>): Promise<User>;
  updateUser?(id: string, data: Partial<User>): Promise<User | null>;
  deleteUser?(id: string): Promise<boolean>;
  
  // Limited conversation support (for AI Agent related queries)
  getConversationsByAIAgentId?(aiAgentId: string): Promise<Conversation[]>;
  getConversationsByUserId?(userId: string): Promise<Conversation[]>;
  
  // Limited group support (for admin user queries)
  getGroupsByAdminUserId?(userId: string): Promise<Group[]>;
}