import { Group, Collection, User } from '../../types';
import { IBaseDataSource } from './IBaseDataSource';

/**
 * Interface for Group data sources
 * Contains group related operations
 */
export interface IGroupDataSource extends IBaseDataSource {
  // Group operations
  getGroupById(id: string): Promise<Group | null>;
  getGroups(ids?: string[]): Promise<Record<string, Group>>;
  getGroupsByAdminUserId(userId: string): Promise<Group[]>;
  createGroup(data: Omit<Group, 'id'>): Promise<Group>;
  updateGroup(id: string, data: Partial<Group>): Promise<Group | null>;
  deleteGroup(id: string): Promise<boolean>;
  
  // Collection operations (for group-collection relationships)
  getCollectionsByGroupId?(groupId: string): Promise<Collection[]>;
  
  // User operations (for group-user relationships)
  getUsersByRole?(role: string): Promise<User[]>;
}