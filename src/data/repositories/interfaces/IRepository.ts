/**
 * Base repository interface for data entities
 * Defines common data access patterns with lazy loading
 */
export interface PaginationOptions {
  offset: number;
  limit: number;
}

export interface FilterOptions {
  [key: string]: any;
}

export interface QueryOptions {
  pagination?: PaginationOptions;
  filter?: FilterOptions;
}

export interface QueryResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

export interface IRepository<T> {
  /**
   * Get an entity by ID
   * @param id Entity ID
   * @param includeRelations Whether to include related entities
   */
  getById(id: string, includeRelations?: boolean): Promise<T | null>;

  /**
   * Get all entities with pagination and filtering
   * @param options Query options for pagination and filtering
   */
  getAll(options?: QueryOptions): Promise<QueryResult<T>>;

  /**
   * Get multiple entities by IDs
   * @param ids Array of entity IDs
   * @param includeRelations Whether to include related entities
   */
  getByIds(ids: string[], includeRelations?: boolean): Promise<T[]>;

  /**
   * Create a new entity
   * @param data Entity data
   */
  create(data: Omit<T, 'thread_id' | 'id'>): Promise<T>;

  /**
   * Update an existing entity
   * @param id Entity ID
   * @param data Partial entity data to update
   */
  update(id: string, data: Partial<T>): Promise<T | null>;

  /**
   * Delete an entity
   * @param id Entity ID
   */
  delete(id: string): Promise<boolean>;

  /**
   * Count entities matching filter criteria
   * @param filter Filter criteria
   */
  count(filter?: FilterOptions): Promise<number>;
}