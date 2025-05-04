import { IRepository, QueryOptions, QueryResult } from './IRepository';
import { User, Conversation, Collection, Group } from '../../types';

/**
 * Repository interface for User entities
 */
export interface IUserRepository extends IRepository<User> {
  /**
   * Get conversations for a user (lazy loading)
   * @param userId User ID
   * @param options Query options
   */
  getConversations(userId: string, options?: QueryOptions): Promise<QueryResult<Conversation>>;
  
  /**
   * Get collections created by a user (lazy loading)
   * @param userId User ID
   * @param options Query options
   */
  getCollections(userId: string, options?: QueryOptions): Promise<QueryResult<Collection>>;
  
  /**
   * Get groups administered by a user (lazy loading)
   * @param userId User ID
   * @param options Query options
   */
  getGroups(userId: string, options?: QueryOptions): Promise<QueryResult<Group>>;
  
  /**
   * Get users by role
   * @param role User role
   * @param options Query options
   */
  getByRole(role: 'admin' | 'supervisor' | 'executive', options?: QueryOptions): Promise<QueryResult<User>>;
  
  /**
   * Check if a user has a specific permission
   * @param userId User ID
   * @param permission Permission to check
   */
  hasPermission(userId: string, permission: string): Promise<boolean>;
  
  /**
   * Get current authenticated user
   */
  getCurrentUser(): Promise<User | null>;
}