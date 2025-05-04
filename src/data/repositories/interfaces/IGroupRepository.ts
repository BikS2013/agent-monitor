import { IRepository, QueryOptions, QueryResult } from './IRepository';
import { Group, Collection } from '../../types';

/**
 * Repository interface for Group entities
 */
export interface IGroupRepository extends IRepository<Group> {
  /**
   * Get collections in a group (lazy loading)
   * @param groupId Group ID
   * @param options Query options
   */
  getCollections(groupId: string, options?: QueryOptions): Promise<QueryResult<Collection>>;
  
  /**
   * Add a collection to a group
   * @param groupId Group ID
   * @param collectionId Collection ID
   */
  addCollection(groupId: string, collectionId: string): Promise<boolean>;
  
  /**
   * Remove a collection from a group
   * @param groupId Group ID
   * @param collectionId Collection ID
   */
  removeCollection(groupId: string, collectionId: string): Promise<boolean>;
  
  /**
   * Get groups by admin user ID
   * @param userId Admin user ID
   * @param options Query options
   */
  getByAdminUserId(userId: string, options?: QueryOptions): Promise<QueryResult<Group>>;
  
  /**
   * Check if a user has permission for a group
   * @param groupId Group ID
   * @param userId User ID
   * @param permission Permission to check
   */
  checkUserPermission(groupId: string, userId: string, permission: string): Promise<boolean>;
}