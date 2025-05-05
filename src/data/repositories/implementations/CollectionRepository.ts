import { ICollectionRepository } from '../interfaces/ICollectionRepository';
import { QueryOptions, FilterOptions, QueryResult } from '../interfaces/IRepository';
import { Collection, Conversation } from '../../types';
import { BaseRepository } from './BaseRepository';
import { IDataSource } from '../../sources/IDataSource';

/**
 * Repository implementation for Collection entities
 */
export class CollectionRepository extends BaseRepository<Collection> implements ICollectionRepository {
  constructor(dataSource: IDataSource) {
    super(dataSource);
  }
  
  /**
   * Get a collection by ID
   */
  async getById(id: string, includeRelations: boolean = false): Promise<Collection | null> {
    const collection = await this.dataSource.getCollectionById(id);
    
    if (!collection) {
      return null;
    }
    
    // Always return the collection with its conversation IDs
    // This is needed for proper display in the UI
    return collection;
  }
  
  /**
   * Get all collections with pagination and filtering
   */
  async getAll(options?: QueryOptions): Promise<QueryResult<Collection>> {
    const collections = await this.dataSource.getCollections();
    const allCollections = Object.values(collections);
    
    // Apply filtering if provided
    const filteredCollections = this.filterItems(allCollections, options?.filter);
    const total = filteredCollections.length;
    
    // Apply pagination if provided
    const paginatedCollections = this.applyPagination(filteredCollections, options);
    
    // Keep the conversation IDs which are needed for UI display
    // This doesn't actually load the full conversation objects, just their IDs
    console.log(`CollectionRepository.getAll: Found ${paginatedCollections.length} collections`);
    
    if (paginatedCollections.length > 0) {
      console.log('CollectionRepository.getAll: First collection:', {
        id: paginatedCollections[0].id,
        name: paginatedCollections[0].name,
        conversationCount: paginatedCollections[0].conversations.length
      });
    }
    
    return this.formatQueryResult(paginatedCollections, total, options);
  }
  
  /**
   * Get multiple collections by IDs
   */
  async getByIds(ids: string[], includeRelations: boolean = false): Promise<Collection[]> {
    const collections = await this.dataSource.getCollections(ids);
    const result = Object.values(collections);
    
    // Always include conversation IDs, which are needed for UI display
    return result;
  }
  
  /**
   * Create a new collection
   */
  async create(data: Omit<Collection, 'id'>): Promise<Collection> {
    return this.dataSource.createCollection(data);
  }
  
  /**
   * Update an existing collection
   */
  async update(id: string, data: Partial<Collection>): Promise<Collection | null> {
    return this.dataSource.updateCollection(id, data);
  }
  
  /**
   * Delete a collection
   */
  async delete(id: string): Promise<boolean> {
    return this.dataSource.deleteCollection(id);
  }
  
  /**
   * Count collections matching filter criteria
   */
  async count(filter?: FilterOptions): Promise<number> {
    const collections = await this.dataSource.getCollections();
    const allCollections = Object.values(collections);
    
    if (!filter) {
      return allCollections.length;
    }
    
    const filteredCollections = this.filterItems(allCollections, filter);
    return filteredCollections.length;
  }
  
  /**
   * Get conversations in a collection (lazy loading)
   */
  async getConversations(collectionId: string, options?: QueryOptions): Promise<QueryResult<Conversation>> {
    const collection = await this.dataSource.getCollectionById(collectionId);
    
    if (!collection) {
      return {
        data: [],
        total: 0,
        hasMore: false
      };
    }
    
    // Get all conversations in the collection
    const conversations = await this.dataSource.getConversationsByCollectionId(collectionId);
    
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
   * Get collections by group ID
   */
  async getByGroupId(groupId: string, options?: QueryOptions): Promise<QueryResult<Collection>> {
    const collections = await this.dataSource.getCollectionsByGroupId(groupId);
    
    console.log(`CollectionRepository.getByGroupId: Found ${collections.length} collections for group ${groupId}`);
    
    // Apply filtering if provided
    const filteredCollections = this.filterItems(collections, options?.filter);
    const total = filteredCollections.length;
    
    // Apply pagination if provided
    const paginatedCollections = this.applyPagination(filteredCollections, options);
    
    // Always include conversation IDs for UI display
    if (paginatedCollections.length > 0) {
      console.log('CollectionRepository.getByGroupId: First collection:', {
        id: paginatedCollections[0].id,
        name: paginatedCollections[0].name,
        conversationCount: paginatedCollections[0].conversations.length
      });
    }
    
    return this.formatQueryResult(paginatedCollections, total, options);
  }
  
  /**
   * Get collections by creator ID
   */
  async getByCreatorId(creatorId: string, options?: QueryOptions): Promise<QueryResult<Collection>> {
    const collections = await this.dataSource.getCollectionsByCreatorId(creatorId);
    
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
   * Refresh conversations in a collection based on filter criteria
   * Re-evaluates filter criteria against all conversations
   */
  async refreshConversations(collectionId: string): Promise<void> {
    const collection = await this.dataSource.getCollectionById(collectionId);
    
    if (!collection) {
      throw new Error(`Collection not found: ${collectionId}`);
    }
    
    // Re-apply filter criteria to get updated conversation list
    const matchingConversationIds = await this.dataSource.filterConversations(collection.filterCriteria);
    
    // Update the collection with new conversation IDs
    await this.dataSource.updateCollection(collectionId, {
      conversations: matchingConversationIds,
      metadata: {
        ...collection.metadata,
        totalConversations: matchingConversationIds.length,
        lastRefreshed: new Date().toISOString()
      }
    });
  }
  
  /**
   * Calculate collection statistics
   */
  async calculateStatistics(collectionId: string): Promise<{
    totalConversations: number;
    avgDuration: string;
    successRate: string;
    [key: string]: any;
  }> {
    const collection = await this.dataSource.getCollectionById(collectionId);
    
    if (!collection) {
      throw new Error(`Collection not found: ${collectionId}`);
    }
    
    const conversations = await this.dataSource.getConversationsByCollectionId(collectionId);
    
    // Calculate statistics
    
    // Total conversations
    const totalConversations = conversations.length;
    
    // Average duration
    let totalDurationMinutes = 0;
    const durationRegex = /(\d+)m/;
    
    conversations.forEach(conversation => {
      const match = conversation.duration.match(durationRegex);
      if (match && match[1]) {
        totalDurationMinutes += parseInt(match[1]);
      }
    });
    
    const avgDuration = totalConversations > 0 
      ? `${Math.round(totalDurationMinutes / totalConversations)}m` 
      : '0m';
    
    // Success rate
    const successfulConversations = conversations.filter(
      conversation => conversation.conclusion === 'successful'
    ).length;
    
    const successRate = totalConversations > 0 
      ? `${Math.round((successfulConversations / totalConversations) * 100)}%` 
      : '0%';
    
    // Additional statistics
    const statistics = {
      totalConversations,
      avgDuration,
      successRate,
      activeConversations: conversations.filter(c => c.status === 'active').length,
      closedConversations: conversations.filter(c => c.status === 'closed').length,
      highPriorityCount: conversations.filter(c => c.priority === 'high').length,
      mediumPriorityCount: conversations.filter(c => c.priority === 'medium').length,
      lowPriorityCount: conversations.filter(c => c.priority === 'low').length,
      lastUpdated: new Date().toISOString()
    };
    
    // Update the collection metadata with the statistics
    await this.dataSource.updateCollection(collectionId, {
      metadata: {
        ...collection.metadata,
        ...statistics
      }
    });
    
    return statistics;
  }
}