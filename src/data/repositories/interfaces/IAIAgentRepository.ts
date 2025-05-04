import { IRepository, QueryOptions, QueryResult } from './IRepository';
import { AIAgent, Conversation } from '../../types';

/**
 * Repository interface for AIAgent entities
 */
export interface IAIAgentRepository extends IRepository<AIAgent> {
  /**
   * Get conversations handled by an AI agent (lazy loading)
   * @param aiAgentId AI agent ID
   * @param options Query options
   */
  getConversations(aiAgentId: string, options?: QueryOptions): Promise<QueryResult<Conversation>>;
  
  /**
   * Get AI agents by status
   * @param status Agent status
   * @param options Query options
   */
  getByStatus(status: 'active' | 'inactive' | 'training', options?: QueryOptions): Promise<QueryResult<AIAgent>>;
  
  /**
   * Update AI agent statistics
   * @param aiAgentId AI agent ID
   */
  updateStatistics(aiAgentId: string): Promise<AIAgent | null>;
  
  /**
   * Compare performance metrics between AI agents
   * @param aiAgentIds Array of AI agent IDs to compare
   * @param metrics Array of metrics to compare
   */
  comparePerformance(
    aiAgentIds: string[], 
    metrics: Array<'successRate' | 'avgResponseTime' | 'conversationsProcessed'>
  ): Promise<Record<string, Record<string, any>>>;
}