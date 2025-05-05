import { IAIAgentRepository } from '../interfaces/IAIAgentRepository';
import { QueryOptions, FilterOptions, QueryResult } from '../interfaces/IRepository';
import { AIAgent, Conversation } from '../../types';
import { BaseRepository } from './BaseRepository';
import { IDataSource } from '../../sources/IDataSource';

/**
 * Repository implementation for AIAgent entities
 */
export class AIAgentRepository extends BaseRepository<AIAgent> implements IAIAgentRepository {
  constructor(dataSource: IDataSource) {
    super(dataSource);
  }
  
  /**
   * Get an AI agent by ID
   */
  async getById(id: string): Promise<AIAgent | null> {
    return this.dataSource.getAIAgentById(id);
  }
  
  /**
   * Get all AI agents with pagination and filtering
   */
  async getAll(options?: QueryOptions): Promise<QueryResult<AIAgent>> {
    const aiAgents = await this.dataSource.getAIAgents();
    const allAIAgents = Object.values(aiAgents);
    
    // Apply filtering if provided
    const filteredAIAgents = this.filterItems(allAIAgents, options?.filter);
    const total = filteredAIAgents.length;
    
    // Apply pagination if provided
    const paginatedAIAgents = this.applyPagination(filteredAIAgents, options);
    
    return this.formatQueryResult(paginatedAIAgents, total, options);
  }
  
  /**
   * Get multiple AI agents by IDs
   */
  async getByIds(ids: string[]): Promise<AIAgent[]> {
    const aiAgents = await this.dataSource.getAIAgents(ids);
    return Object.values(aiAgents);
  }
  
  /**
   * Create a new AI agent
   */
  async create(data: Omit<AIAgent, 'id'>): Promise<AIAgent> {
    return this.dataSource.createAIAgent(data);
  }
  
  /**
   * Update an existing AI agent
   */
  async update(id: string, data: Partial<AIAgent>): Promise<AIAgent | null> {
    return this.dataSource.updateAIAgent(id, data);
  }
  
  /**
   * Delete an AI agent
   */
  async delete(id: string): Promise<boolean> {
    return this.dataSource.deleteAIAgent(id);
  }
  
  /**
   * Count AI agents matching filter criteria
   */
  async count(filter?: FilterOptions): Promise<number> {
    const aiAgents = await this.dataSource.getAIAgents();
    const allAIAgents = Object.values(aiAgents);
    
    if (!filter) {
      return allAIAgents.length;
    }
    
    const filteredAIAgents = this.filterItems(allAIAgents, filter);
    return filteredAIAgents.length;
  }
  
  /**
   * Get conversations handled by an AI agent (lazy loading)
   */
  async getConversations(aiAgentId: string, options?: QueryOptions): Promise<QueryResult<Conversation>> {
    const conversations = await this.dataSource.getConversationsByAIAgentId(aiAgentId);
    
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
   * Get AI agents by status
   */
  async getByStatus(status: 'active' | 'inactive' | 'training', options?: QueryOptions): Promise<QueryResult<AIAgent>> {
    const aiAgents = await this.dataSource.getAIAgentsByStatus(status);
    
    // Apply filtering if provided
    const filteredAIAgents = this.filterItems(aiAgents, options?.filter);
    const total = filteredAIAgents.length;
    
    // Apply pagination if provided
    const paginatedAIAgents = this.applyPagination(filteredAIAgents, options);
    
    return this.formatQueryResult(paginatedAIAgents, total, options);
  }
  
  /**
   * Update AI agent statistics
   */
  async updateStatistics(aiAgentId: string): Promise<AIAgent | null> {
    const aiAgent = await this.dataSource.getAIAgentById(aiAgentId);
    
    if (!aiAgent) {
      return null;
    }
    
    // Get all conversations for this AI agent
    const conversations = await this.dataSource.getConversationsByAIAgentId(aiAgentId);
    
    // Update statistics
    
    // Number of conversations processed
    const conversationsProcessed = conversations.length;
    
    // Success rate
    const successfulConversations = conversations.filter(
      conversation => conversation.conclusion === 'successful'
    ).length;
    
    const successRate = conversationsProcessed > 0 
      ? `${Math.round((successfulConversations / conversationsProcessed) * 100)}%` 
      : '0%';
    
    // Average response time
    // In a real implementation, we would calculate this from message timestamps
    // For now, we'll use a simple formula based on duration
    let totalDurationMinutes = 0;
    const durationRegex = /(\d+)m/;
    
    conversations.forEach(conversation => {
      const match = conversation.duration.match(durationRegex);
      if (match && match[1]) {
        totalDurationMinutes += parseInt(match[1]);
      }
    });
    
    const avgResponseTime = conversationsProcessed > 0
      ? `${Math.round(totalDurationMinutes / conversationsProcessed)}m`
      : '0m';
    
    // Last active
    const lastActiveConversation = conversations
      .sort((a, b) => {
        const aTime = a.endTimestamp || a.startTimestamp;
        const bTime = b.endTimestamp || b.startTimestamp;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      })[0];
    
    const lastActive = lastActiveConversation 
      ? (lastActiveConversation.endTimestamp || lastActiveConversation.startTimestamp)
      : aiAgent.lastActive;
    
    // Update the AI agent with new statistics
    return this.dataSource.updateAIAgent(aiAgentId, {
      conversationsProcessed,
      successRate,
      avgResponseTime,
      lastActive
    });
  }
  
  /**
   * Compare performance metrics between AI agents
   */
  async comparePerformance(
    aiAgentIds: string[], 
    metrics: Array<'successRate' | 'avgResponseTime' | 'conversationsProcessed'>
  ): Promise<Record<string, Record<string, any>>> {
    // Get AI agents
    const aiAgents = await this.getByIds(aiAgentIds);
    
    // Create result object
    const result: Record<string, Record<string, any>> = {};
    
    // Extract metrics
    for (const aiAgent of aiAgents) {
      result[aiAgent.id] = {
        name: aiAgent.name,
        model: aiAgent.model
      };
      
      // Add requested metrics
      for (const metric of metrics) {
        result[aiAgent.id][metric] = aiAgent[metric];
      }
      
      // Ensure metrics are up to date
      await this.updateStatistics(aiAgent.id);
    }
    
    return result;
  }
}