import { 
  IUserRepository, 
  QueryOptions, 
  FilterOptions, 
  QueryResult 
} from '../interfaces/IUserRepository';
import { User, Conversation, Collection, Group } from '../../types';
import { BaseRepository } from './BaseRepository';
import { IDataSource } from '../../sources/IDataSource';

/**
 * Repository implementation for User entities
 */
export class UserRepository extends BaseRepository<User> implements IUserRepository {
  constructor(dataSource: IDataSource) {
    super(dataSource);
  }
  
  /**
   * Get a user by ID
   */
  async getById(id: string): Promise<User | null> {
    return this.dataSource.getUserById(id);
  }
  
  /**
   * Get all users with pagination and filtering
   */
  async getAll(options?: QueryOptions): Promise<QueryResult<User>> {
    const users = await this.dataSource.getUsers();
    const allUsers = Object.values(users);
    
    // Apply filtering if provided
    const filteredUsers = this.filterItems(allUsers, options?.filter);
    const total = filteredUsers.length;
    
    // Apply pagination if provided
    const paginatedUsers = this.applyPagination(filteredUsers, options);
    
    return this.formatQueryResult(paginatedUsers, total, options);
  }
  
  /**
   * Get multiple users by IDs
   */
  async getByIds(ids: string[]): Promise<User[]> {
    const users = await this.dataSource.getUsers(ids);
    return Object.values(users);
  }
  
  /**
   * Create a new user
   */
  async create(data: Omit<User, 'id'>): Promise<User> {
    return this.dataSource.createUser(data);
  }
  
  /**
   * Update an existing user
   */
  async update(id: string, data: Partial<User>): Promise<User | null> {
    return this.dataSource.updateUser(id, data);
  }
  
  /**
   * Delete a user
   */
  async delete(id: string): Promise<boolean> {
    return this.dataSource.deleteUser(id);
  }
  
  /**
   * Count users matching filter criteria
   */
  async count(filter?: FilterOptions): Promise<number> {
    const users = await this.dataSource.getUsers();
    const allUsers = Object.values(users);
    
    if (!filter) {
      return allUsers.length;
    }
    
    const filteredUsers = this.filterItems(allUsers, filter);
    return filteredUsers.length;
  }
  
  /**
   * Get conversations for a user (lazy loading)
   */
  async getConversations(userId: string, options?: QueryOptions): Promise<QueryResult<Conversation>> {
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
   * Get collections created by a user (lazy loading)
   */
  async getCollections(userId: string, options?: QueryOptions): Promise<QueryResult<Collection>> {
    const collections = await this.dataSource.getCollectionsByCreatorId(userId);
    
    // Apply filtering if provided
    const filteredCollections = this.filterItems(collections, options?.filter);
    const total = filteredCollections.length;
    
    // Apply pagination if provided
    const paginatedCollections = this.applyPagination(filteredCollections, options);
    
    // For lazy loading, strip out conversation arrays
    const lightweightCollections = paginatedCollections.map(collection => ({
      ...collection,
      conversations: []
    }));
    
    return this.formatQueryResult(lightweightCollections, total, options);
  }
  
  /**
   * Get groups administered by a user (lazy loading)
   */
  async getGroups(userId: string, options?: QueryOptions): Promise<QueryResult<Group>> {
    const groups = await this.dataSource.getGroupsByAdminUserId(userId);
    
    // Apply filtering if provided
    const filteredGroups = this.filterItems(groups, options?.filter);
    const total = filteredGroups.length;
    
    // Apply pagination if provided
    const paginatedGroups = this.applyPagination(filteredGroups, options);
    
    // For lazy loading, strip out collection arrays
    const lightweightGroups = paginatedGroups.map(group => ({
      ...group,
      collectionIds: []
    }));
    
    return this.formatQueryResult(lightweightGroups, total, options);
  }
  
  /**
   * Get users by role
   */
  async getByRole(role: 'admin' | 'supervisor' | 'executive', options?: QueryOptions): Promise<QueryResult<User>> {
    const users = await this.dataSource.getUsersByRole(role);
    
    // Apply filtering if provided
    const filteredUsers = this.filterItems(users, options?.filter);
    const total = filteredUsers.length;
    
    // Apply pagination if provided
    const paginatedUsers = this.applyPagination(filteredUsers, options);
    
    return this.formatQueryResult(paginatedUsers, total, options);
  }
  
  /**
   * Check if a user has a specific permission
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const user = await this.dataSource.getUserById(userId);
    
    if (!user) {
      return false;
    }
    
    return user.permissions.includes(permission);
  }
  
  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    return this.dataSource.getCurrentUser();
  }
}