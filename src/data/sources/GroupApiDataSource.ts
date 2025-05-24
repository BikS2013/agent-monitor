import { Group } from '../types';
import { IGroupDataSource } from './interfaces/IGroupDataSource';
import { ApiClient } from '../api/ApiClient';

/**
 * API client implementation of the IGroupDataSource interface.
 * This implementation is dedicated to Group operations and can be configured
 * independently from other API data sources.
 */
export class GroupApiDataSource implements IGroupDataSource {
  private apiClient: ApiClient;

  /**
   * Creates a new Group API data source client
   * @param baseUrl The base URL of the API server
   * @param authToken Optional JWT authentication token
   * @param clientSecret Optional client secret for API key authentication
   * @param clientId Optional client ID for API key authentication
   * @param noAuth Whether to disable authentication (no token or API key)
   */
  constructor(
    baseUrl: string = 'http://localhost:8000',
    authToken?: string,
    clientSecret?: string,
    clientId?: string,
    noAuth: boolean = false
  ) {
    this.apiClient = new ApiClient(baseUrl, authToken, clientSecret, clientId, noAuth);
  }

  /**
   * Sets the authentication token for API requests
   * @param token JWT token for authentication
   */
  public setAuthToken(token: string): void {
    this.apiClient.setAuthToken(token);
  }

  /**
   * Clears the authentication token
   */
  public clearAuthToken(): void {
    this.apiClient.clearAuthToken();
  }

  /**
   * Initialize the data source
   */
  async initialize(): Promise<void> {
    try {
      console.log('GroupApiDataSource: Initializing with settings:', {
        baseUrl: this.apiClient['apiClient'].defaults.baseURL,
        noAuth: this.apiClient['noAuth'],
        hasToken: !!this.apiClient['authToken'],
        hasClientSecret: !!this.apiClient['clientSecret']
      });

      await this.apiClient.initialize();
      console.log('GroupApiDataSource: Successfully initialized API client');
    } catch (error) {
      console.error('GroupApiDataSource: Failed to initialize data source:', error);
      console.error('GroupApiDataSource: Error message:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Save all data to persistent storage
   */
  async saveData(): Promise<void> {
    await this.apiClient.saveData();
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    await this.apiClient.clearCache();
  }

  // #region Group Methods

  /**
   * Get a specific group by ID
   * @param id Group ID
   */
  async getGroupById(id: string): Promise<Group | null> {
    try {
      const group = await this.apiClient.getGroup(id);
      if (!group) return null;

      return this.transformApiGroup(group);
    } catch (error) {
      console.error(`Failed to get group ${id}:`, error);
      return null;
    }
  }

  /**
   * Get multiple groups by their IDs
   * @param ids Optional array of group IDs. If not provided, returns all groups
   */
  async getGroups(ids?: string[]): Promise<Record<string, Group>> {
    try {
      const result = await this.apiClient.getGroups(ids);
      console.log('GroupApiDataSource.getGroups: Raw API response:', result);

      let groups: any[] = [];

      // Handle different response formats
      if (result && typeof result === 'object' && !Array.isArray(result)) {
        // Check if response has items wrapper
        if (result.items && Array.isArray(result.items)) {
          console.log('GroupApiDataSource.getGroups: Found items wrapper with', result.items.length, 'groups');
          groups = result.items;
        } else {
          // Object format with IDs as keys (legacy)
          console.log('GroupApiDataSource.getGroups: Processing object format with keys:', Object.keys(result));
          return Object.entries(result).reduce((acc, [key, group]) => {
            // Skip if this is the 'items' key
            if (key === 'items') return acc;
            
            console.log(`GroupApiDataSource.getGroups: Processing group with key ${key}:`, group);
            const transformed = this.transformApiGroup(group as any);
            // Use the group's actual ID if available, otherwise use the key
            const groupId = transformed.id || (group as any).id || key;
            console.log(`GroupApiDataSource.getGroups: Transformed group ${groupId}:`, transformed);
            acc[groupId] = { ...transformed, id: groupId };
            return acc;
          }, {} as Record<string, Group>);
        }
      } else if (Array.isArray(result)) {
        // Direct array format
        console.log('GroupApiDataSource.getGroups: Direct array format with', result.length, 'groups');
        groups = result;
      }

      // Transform array to record with IDs as keys
      const groupsRecord = groups.reduce((acc, group) => {
        const transformed = this.transformApiGroup(group);
        const groupId = transformed.id || group.id;
        if (groupId) {
          acc[groupId] = transformed;
        }
        return acc;
      }, {} as Record<string, Group>);

      console.log('GroupApiDataSource.getGroups: Returning', Object.keys(groupsRecord).length, 'groups');
      return groupsRecord;
    } catch (error) {
      console.error('Failed to get groups:', error);
      return {};
    }
  }

  /**
   * Get all groups administered by a specific user
   * @param userId User ID
   */
  async getGroupsByAdminUserId(userId: string): Promise<Group[]> {
    try {
      const groups = await this.apiClient.getGroupsByAdminUser(userId);
      return Array.isArray(groups)
        ? groups.map(group => this.transformApiGroup(group))
        : [];
    } catch (error) {
      console.error(`Failed to get admin groups for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Create a new group
   * @param data Group data without the ID
   */
  async createGroup(data: Omit<Group, 'id'>): Promise<Group> {
    try {
      const apiData = this.prepareGroupForApi(data as Group);
      const result = await this.apiClient.createGroup(apiData);
      return this.transformApiGroup(result);
    } catch (error) {
      console.error('Failed to create group:', error);
      throw error;
    }
  }

  /**
   * Update an existing group
   * @param id Group ID
   * @param data Updated group data
   */
  async updateGroup(id: string, data: Partial<Group>): Promise<Group | null> {
    try {
      const apiData = this.prepareGroupForApi(data as Group);
      const result = await this.apiClient.updateGroup(id, apiData);
      if (!result) return null;
      return this.transformApiGroup(result);
    } catch (error) {
      console.error(`Failed to update group ${id}:`, error);
      return null;
    }
  }

  /**
   * Delete a group
   * @param id Group ID
   */
  async deleteGroup(id: string): Promise<boolean> {
    try {
      return await this.apiClient.deleteGroup(id);
    } catch (error) {
      console.error(`Failed to delete group ${id}:`, error);
      return false;
    }
  }

  // #endregion

  // #region Helper Methods

  /**
   * Transform API group format to app format
   */
  private transformApiGroup(apiGroup: any): Group {
    // Create the group object in our app format
    return {
      id: apiGroup.id,
      name: apiGroup.name || '',
      description: apiGroup.description || '',
      createdAt: apiGroup.createdAt || apiGroup.created_at || new Date().toISOString(),
      updatedAt: apiGroup.updatedAt || apiGroup.updated_at || new Date().toISOString(),
      adminIds: Array.isArray(apiGroup.adminIds)
                ? apiGroup.adminIds
                : (apiGroup.admin_ids || []),
      collectionIds: Array.isArray(apiGroup.collectionIds)
                     ? apiGroup.collectionIds
                     : (apiGroup.collection_ids || []),
      userIds: Array.isArray(apiGroup.userIds)
               ? apiGroup.userIds
               : (apiGroup.user_ids || []),
      purpose: apiGroup.purpose || '',
      metadata: apiGroup.metadata || {},
      isPrivate: apiGroup.isPrivate || apiGroup.is_private || false,
      permissionLevels: apiGroup.permissionLevels || apiGroup.permission_levels || {}
    };
  }

  /**
   * Prepare group data for API
   */
  private prepareGroupForApi(group: Partial<Group>): any {
    // Create a copy to avoid modifying the original
    const apiData: any = { ...group };

    // Convert snake_case to camelCase if needed
    if (apiData.admin_ids === undefined && apiData.adminIds !== undefined) {
      apiData.admin_ids = apiData.adminIds;
      delete apiData.adminIds;
    }

    if (apiData.collection_ids === undefined && apiData.collectionIds !== undefined) {
      apiData.collection_ids = apiData.collectionIds;
      delete apiData.collectionIds;
    }

    if (apiData.user_ids === undefined && apiData.userIds !== undefined) {
      apiData.user_ids = apiData.userIds;
      delete apiData.userIds;
    }

    if (apiData.is_private === undefined && apiData.isPrivate !== undefined) {
      apiData.is_private = apiData.isPrivate;
      delete apiData.isPrivate;
    }

    if (apiData.permission_levels === undefined && apiData.permissionLevels !== undefined) {
      apiData.permission_levels = apiData.permissionLevels;
      delete apiData.permissionLevels;
    }

    return apiData;
  }

  // #endregion
}