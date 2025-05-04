import { 
  IRepository, 
  PaginationOptions, 
  FilterOptions, 
  QueryOptions, 
  QueryResult 
} from '../interfaces/IRepository';
import { IDataSource } from '../../sources/IDataSource';

/**
 * Base repository implementation with common functionality
 * for all entity types
 */
export abstract class BaseRepository<T> implements IRepository<T> {
  protected dataSource: IDataSource;
  
  constructor(dataSource: IDataSource) {
    this.dataSource = dataSource;
  }
  
  /**
   * Apply pagination to a result set
   */
  protected applyPagination<T>(
    items: T[], 
    options?: { pagination?: PaginationOptions }
  ): T[] {
    if (!options?.pagination) {
      return items;
    }
    
    const { offset = 0, limit = 20 } = options.pagination;
    return items.slice(offset, offset + limit);
  }
  
  /**
   * Format a paginated result
   */
  protected formatQueryResult<T>(
    items: T[], 
    total: number, 
    options?: { pagination?: PaginationOptions }
  ): QueryResult<T> {
    if (!options?.pagination) {
      return {
        data: items,
        total,
        hasMore: false
      };
    }
    
    const { offset = 0, limit = 20 } = options.pagination;
    const hasMore = offset + limit < total;
    
    return {
      data: items,
      total,
      hasMore
    };
  }
  
  /**
   * Filter items based on filter criteria
   * Basic implementation - should be overridden by specific repositories
   * for more advanced filtering
   */
  protected filterItems<T extends { [key: string]: any }>(
    items: T[], 
    filter?: FilterOptions
  ): T[] {
    if (!filter) {
      return items;
    }
    
    return items.filter(item => {
      for (const [key, value] of Object.entries(filter)) {
        if (item[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }
  
  /**
   * Abstract method to get entity by ID
   * Must be implemented by child classes
   */
  abstract getById(id: string, includeRelations?: boolean): Promise<T | null>;
  
  /**
   * Abstract method to get all entities
   * Must be implemented by child classes
   */
  abstract getAll(options?: QueryOptions): Promise<QueryResult<T>>;
  
  /**
   * Get multiple entities by IDs
   */
  abstract getByIds(ids: string[], includeRelations?: boolean): Promise<T[]>;
  
  /**
   * Create a new entity
   */
  abstract create(data: Omit<T, 'id'>): Promise<T>;
  
  /**
   * Update an existing entity
   */
  abstract update(id: string, data: Partial<T>): Promise<T | null>;
  
  /**
   * Delete an entity
   */
  abstract delete(id: string): Promise<boolean>;
  
  /**
   * Count entities matching filter criteria
   */
  abstract count(filter?: FilterOptions): Promise<number>;
}