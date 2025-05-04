import { 
  IGroupRepository, 
  QueryOptions, 
  FilterOptions, 
  QueryResult 
} from '../interfaces/IGroupRepository';
import { Group, Collection } from '../../types';
import { BaseRepository } from './BaseRepository';
import { IDataSource } from '../../sources/IDataSource';

/**
 * Repository implementation for Group entities
 */
export class GroupRepository extends BaseRepository<Group> implements IGroupRepository {
  constructor(dataSource: IDataSource) {
    super(dataSource);
  }
  
  /**
   * Get a group by ID
   */
  async getById(id: string, includeRelations: boolean = false): Promise<Group | null> {
    const group = await this.dataSource.getGroupById(id);
    
    if (!group) {
      return null;
    }
    
    // Always return the group with its collection IDs
    // This is needed for proper display in the UI
    return group;
  }
  
  /**
   * Get all groups with pagination and filtering
   */
  async getAll(options?: QueryOptions): Promise<QueryResult<Group>> {
    const groups = await this.dataSource.getGroups();
    const allGroups = Object.values(groups);
    
    // Apply filtering if provided
    const filteredGroups = this.filterItems(allGroups, options?.filter);
    const total = filteredGroups.length;
    
    // Apply pagination if provided
    const paginatedGroups = this.applyPagination(filteredGroups, options);
    
    // Keep the collection IDs which are needed for UI display
    // This doesn't actually load the full collection objects, just their IDs
    console.log(`GroupRepository.getAll: Found ${paginatedGroups.length} groups`);
    
    if (paginatedGroups.length > 0) {
      console.log('GroupRepository.getAll: First group:', {
        id: paginatedGroups[0].id,
        name: paginatedGroups[0].name,
        collectionsCount: paginatedGroups[0].collectionIds.length
      });
    }
    
    return this.formatQueryResult(paginatedGroups, total, options);
  }
  
  /**
   * Get multiple groups by IDs
   */
  async getByIds(ids: string[], includeRelations: boolean = false): Promise<Group[]> {
    const groups = await this.dataSource.getGroups(ids);
    const result = Object.values(groups);
    
    // Always include collection IDs, which are needed for UI display
    return result;
  }
  
  /**
   * Create a new group
   */
  async create(data: Omit<Group, 'id'>): Promise<Group> {
    return this.dataSource.createGroup(data);
  }
  
  /**
   * Update an existing group
   */
  async update(id: string, data: Partial<Group>): Promise<Group | null> {
    return this.dataSource.updateGroup(id, data);
  }
  
  /**
   * Delete a group
   */
  async delete(id: string): Promise<boolean> {
    return this.dataSource.deleteGroup(id);
  }
  
  /**
   * Count groups matching filter criteria
   */
  async count(filter?: FilterOptions): Promise<number> {
    const groups = await this.dataSource.getGroups();
    const allGroups = Object.values(groups);
    
    if (!filter) {
      return allGroups.length;
    }
    
    const filteredGroups = this.filterItems(allGroups, filter);
    return filteredGroups.length;
  }
  
  /**
   * Get collections in a group (lazy loading)
   */
  async getCollections(groupId: string, options?: QueryOptions): Promise<QueryResult<Collection>> {
    const group = await this.dataSource.getGroupById(groupId);
    
    if (!group) {
      return {
        data: [],
        total: 0,
        hasMore: false
      };
    }
    
    // Get all collections in the group
    const collections = await this.dataSource.getCollectionsByGroupId(groupId);
    
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
   * Add a collection to a group
   */
  async addCollection(groupId: string, collectionId: string): Promise<boolean> {
    const group = await this.dataSource.getGroupById(groupId);
    
    if (!group) {
      return false;
    }
    
    // Check if the collection exists
    const collection = await this.dataSource.getCollectionById(collectionId);
    
    if (!collection) {
      return false;
    }
    
    // Check if the collection is already in the group
    if (group.collectionIds.includes(collectionId)) {
      return true;
    }
    
    // Add the collection to the group
    const updatedGroup = await this.dataSource.updateGroup(groupId, {
      collectionIds: [...group.collectionIds, collectionId]
    });
    
    return !!updatedGroup;
  }
  
  /**
   * Remove a collection from a group
   */
  async removeCollection(groupId: string, collectionId: string): Promise<boolean> {
    const group = await this.dataSource.getGroupById(groupId);
    
    if (!group) {
      return false;
    }
    
    // Check if the collection is in the group
    const index = group.collectionIds.indexOf(collectionId);
    
    if (index === -1) {
      return true;
    }
    
    // Remove the collection from the group
    const updatedCollectionIds = [...group.collectionIds];
    updatedCollectionIds.splice(index, 1);
    
    const updatedGroup = await this.dataSource.updateGroup(groupId, {
      collectionIds: updatedCollectionIds
    });
    
    return !!updatedGroup;
  }
  
  /**
   * Get groups by admin user ID
   */
  async getByAdminUserId(userId: string, options?: QueryOptions): Promise<QueryResult<Group>> {
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
   * Check if a user has permission for a group
   */
  async checkUserPermission(groupId: string, userId: string, permission: string): Promise<boolean> {
    const group = await this.dataSource.getGroupById(groupId);
    
    if (!group) {
      return false;
    }
    
    // Check if the user is an admin
    if (group.adminUsers.includes(userId)) {
      return true;
    }
    
    // Check if the user has the specific permission
    const userPermissions = group.permissionLevels[userId];
    
    if (!userPermissions) {
      return false;
    }
    
    // In a real implementation, we would have a more sophisticated permission system
    // For now, we'll just check if the permission string matches
    return userPermissions === permission;
  }
}