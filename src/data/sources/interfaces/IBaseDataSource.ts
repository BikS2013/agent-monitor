/**
 * Base interface for all data sources
 * Contains only the essential initialization and data maintenance methods
 */
export interface IBaseDataSource {
  /**
   * Initialize the data source
   */
  initialize(): Promise<void>;
  
  /**
   * Save all data to persistent storage
   */
  saveData(): Promise<void>;
  
  /**
   * Clear all cached data
   */
  clearCache(): Promise<void>;
}