import { IRepository, QueryOptions, QueryResult } from './IRepository';
import { Collection, Conversation } from '../../types';

/**
 * Repository interface for Collection entities
 */
export interface ICollectionRepository extends IRepository<Collection> {
  /**
   * Get conversations in a collection (lazy loading)
   * @param collectionId Collection ID
   * @param options Query options
   */
  getConversations(collectionId: string, options?: QueryOptions): Promise<QueryResult<Conversation>>;
  
  /**
   * Get collections by group ID
   * @param groupId Group ID
   * @param options Query options
   */
  getByGroupId(groupId: string, options?: QueryOptions): Promise<QueryResult<Collection>>;
  
  /**
   * Get collections by creator ID
   * @param creatorId Creator user ID
   * @param options Query options
   */
  getByCreatorId(creatorId: string, options?: QueryOptions): Promise<QueryResult<Collection>>;
  
  /**
   * Refresh conversations in a collection based on filter criteria
   * Re-evaluates filter criteria against all conversations
   * @param collectionId Collection ID
   */
  refreshConversations(collectionId: string): Promise<void>;
  
  /**
   * Calculate collection statistics
   * @param collectionId Collection ID
   */
  calculateStatistics(collectionId: string): Promise<{
    totalConversations: number;
    avgDuration: string;
    successRate: string;
    [key: string]: any;
  }>;
}