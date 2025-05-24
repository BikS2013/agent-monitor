import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AIAgent, User } from '../data/types';
import { useAIAgentsRepositories } from './AIAgentsRepositoryContext';

interface AIAgentsDataContextType {
  aiAgents: Record<string, AIAgent>;
  users: Record<string, User>;

  // AI Agent operations
  getAIAgentById: (id: string) => Promise<AIAgent | null>;
  getAIAgentsByStatus: (status: 'active' | 'inactive' | 'training') => Promise<AIAgent[]>;
  createAIAgent: (data: Omit<AIAgent, 'id'>) => Promise<AIAgent>;
  updateAIAgent: (id: string, data: Partial<AIAgent>) => Promise<AIAgent | null>;
  deleteAIAgent: (id: string) => Promise<boolean>;

  // User operations (limited for AI Agents context)
  getCurrentUser: () => Promise<User | null>;

  // Utility operations
  cleanupInvalidAgents: () => number;

  // Loading and error states
  isLoading: boolean;
  error: Error | null;
}

const AIAgentsDataContext = createContext<AIAgentsDataContextType | undefined>(undefined);

export const useAIAgentsData = () => {
  const context = useContext(AIAgentsDataContext);
  if (!context) {
    throw new Error('useAIAgentsData must be used within AIAgentsDataProvider');
  }
  return context;
};

interface AIAgentsDataProviderProps {
  children: ReactNode;
}

export const AIAgentsDataProvider: React.FC<AIAgentsDataProviderProps> = ({ children }) => {
  const { repositories, isLoading: repoLoading, error: repoError } = useAIAgentsRepositories();
  const [aiAgents, setAIAgents] = useState<Record<string, AIAgent>>({});
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (!repositories || repoLoading) {
        console.log('[AIAgentsDataContext] Waiting for repositories to initialize...');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        console.log('[AIAgentsDataContext] Starting data load...');

        // Load AI agents
        console.log('[AIAgentsDataContext] Loading AI agents from API...');
        const agentsResult = await repositories.aiAgents.getAll();
        console.log('[AIAgentsDataContext] Raw API response for agents:', {
          hasData: !!agentsResult.data,
          dataLength: agentsResult.data?.length || 0,
          sampleAgent: agentsResult.data?.[0] || null
        });

        const agentsMap = agentsResult.data.reduce((acc: Record<string, AIAgent>, agent: AIAgent, index: number) => {
          console.log(`[AIAgentsDataContext] Processing agent ${index + 1}/${agentsResult.data.length}:`, {
            id: agent?.id,
            name: agent?.name,
            model: agent?.model,
            modelName: (agent as any)?.modelName,
            status: agent?.status,
            allFields: Object.keys(agent || {})
          });

          if (agent && agent.id) {
            acc[agent.id] = agent;
          } else {
            console.warn('[AIAgentsDataContext] Skipping agent without ID:', agent);
          }
          return acc;
        }, {} as Record<string, AIAgent>);
        
        console.log(`[AIAgentsDataContext] Loaded ${Object.keys(agentsMap).length} valid agents into state`);
        setAIAgents(agentsMap);

        // Load users (limited data)
        console.log('[AIAgentsDataContext] Loading users from API...');
        const usersResult = await repositories.users.getAll();
        console.log('[AIAgentsDataContext] Raw API response for users:', {
          hasData: !!usersResult.data,
          dataLength: usersResult.data?.length || 0
        });

        const usersMap = usersResult.data.reduce((acc: Record<string, User>, user: User) => {
          if (user && user.id) {
            acc[user.id] = user;
          }
          return acc;
        }, {} as Record<string, User>);
        
        console.log(`[AIAgentsDataContext] Loaded ${Object.keys(usersMap).length} users into state`);
        setUsers(usersMap);

      } catch (err) {
        console.error('[AIAgentsDataContext] Failed to load data:', {
          error: err,
          message: (err as Error)?.message,
          stack: (err as Error)?.stack
        });
        setError(err as Error);
      } finally {
        setIsLoading(false);
        console.log('[AIAgentsDataContext] Data loading completed');
      }
    };

    loadData();
  }, [repositories, repoLoading]);

  // AI Agent operations
  const getAIAgentById = async (id: string): Promise<AIAgent | null> => {
    if (!repositories) throw new Error('Repositories not initialized');

    try {
      const agent = await repositories.aiAgents.getById(id);
      if (agent) {
        setAIAgents(prev => ({ ...prev, [agent.id]: agent }));
      }
      return agent;
    } catch (err) {
      console.error(`Failed to get AI agent ${id}:`, err);
      throw err;
    }
  };

  const getAIAgentsByStatus = async (status: 'active' | 'inactive' | 'training'): Promise<AIAgent[]> => {
    if (!repositories) throw new Error('Repositories not initialized');

    try {
      const result = await repositories.aiAgents.getByStatus(status);
      const agents = result.data;
      // Update local cache
      agents.forEach((agent: AIAgent) => {
        setAIAgents(prev => ({ ...prev, [agent.id]: agent }));
      });
      return agents;
    } catch (err) {
      console.error(`Failed to get AI agents with status ${status}:`, err);
      throw err;
    }
  };

  const createAIAgent = async (data: Omit<AIAgent, 'id'>): Promise<AIAgent> => {
    if (!repositories) throw new Error('Repositories not initialized');

    try {
      console.log('[AIAgentsDataContext] Creating new agent:', {
        name: data.name,
        model: data.model,
        status: data.status,
        allFields: Object.keys(data)
      });
      
      const newAgent = await repositories.aiAgents.create(data);
      
      console.log('[AIAgentsDataContext] Agent created successfully:', {
        id: newAgent.id,
        name: newAgent.name,
        model: newAgent.model,
        status: newAgent.status,
        allReturnedFields: Object.keys(newAgent)
      });
      
      setAIAgents(prev => {
        const updated = { ...prev, [newAgent.id]: newAgent };
        console.log(`[AIAgentsDataContext] Updated agents state: now ${Object.keys(updated).length} agents`);
        return updated;
      });
      
      return newAgent;
    } catch (err) {
      console.error('[AIAgentsDataContext] Failed to create AI agent:', {
        error: err,
        message: (err as Error)?.message,
        inputData: data
      });
      throw err;
    }
  };

  const updateAIAgent = async (id: string, data: Partial<AIAgent>): Promise<AIAgent | null> => {
    if (!repositories) throw new Error('Repositories not initialized');

    try {
      console.log(`[AIAgentsDataContext] Updating agent ${id}:`, {
        updateData: data,
        currentAgent: aiAgents[id] ? {
          name: aiAgents[id].name,
          model: aiAgents[id].model,
          status: aiAgents[id].status
        } : 'not found in local state'
      });
      
      const updatedAgent = await repositories.aiAgents.update(id, data);
      
      if (updatedAgent) {
        console.log(`[AIAgentsDataContext] Agent ${id} updated successfully:`, {
          id: updatedAgent.id,
          name: updatedAgent.name,
          model: updatedAgent.model,
          status: updatedAgent.status,
          allReturnedFields: Object.keys(updatedAgent)
        });
        
        setAIAgents(prev => {
          const updated = { ...prev, [updatedAgent.id]: updatedAgent };
          console.log(`[AIAgentsDataContext] Force updating agent ${id} in state - agents count: ${Object.keys(updated).length}`);
          return updated;
        });
      } else {
        console.warn(`[AIAgentsDataContext] Update returned null for agent ${id}`);
      }
      
      return updatedAgent;
    } catch (err) {
      console.error(`[AIAgentsDataContext] Failed to update AI agent ${id}:`, {
        error: err,
        message: (err as Error)?.message,
        updateData: data
      });
      throw err;
    }
  };

  const deleteAIAgent = async (id: string): Promise<boolean> => {
    if (!repositories) throw new Error('Repositories not initialized');

    try {
      const success = await repositories.aiAgents.delete(id);
      if (success) {
        setAIAgents(prev => {
          const newAgents = { ...prev };
          delete newAgents[id];
          return newAgents;
        });
      }
      return success;
    } catch (err) {
      console.error(`Failed to delete AI agent ${id}:`, err);
      throw err;
    }
  };

  const cleanupInvalidAgents = useCallback((): number => {
    let cleanedCount = 0;
    let migratedCount = 0;
    let normalizedCount = 0;

    console.log('[AIAgentsDataContext] Starting cleanup of invalid agents...');
    
    setAIAgents(prev => {
      const newAgents = { ...prev };
      const totalAgents = Object.keys(newAgents).length;
      console.log(`[AIAgentsDataContext] Processing ${totalAgents} agents for cleanup`);

      for (const id of Object.keys(newAgents)) {
        const agent = newAgents[id];
        console.log(`[AIAgentsDataContext] Cleaning agent ${id}:`, {
          hasValidStructure: agent && typeof agent === 'object',
          hasId: !!(agent && agent.id),
          name: agent?.name,
          model: agent?.model,
          modelName: (agent as any)?.modelName,
          status: agent?.status
        });

        if (agent && typeof agent === 'object') {
          let needsUpdate = false;
          const updatedAgent = { ...agent };

          // Migrate modelName to model if needed
          if (!updatedAgent.model && (agent as any).modelName) {
            console.log(`[AIAgentsDataContext] Migrating modelName to model for agent ${id}: ${(agent as any).modelName}`);
            updatedAgent.model = (agent as any).modelName;
            needsUpdate = true;
            migratedCount++;
          }

          // Provide default values for missing fields (more lenient for API data)
          if (!updatedAgent.model || updatedAgent.model.trim() === '') {
            console.log(`[AIAgentsDataContext] Setting default model for agent ${id}`);
            updatedAgent.model = 'Unknown Model';
            needsUpdate = true;
            normalizedCount++;
          }

          if (!updatedAgent.name || updatedAgent.name.trim() === '') {
            console.log(`[AIAgentsDataContext] Setting default name for agent ${id}`);
            updatedAgent.name = 'Unnamed Agent';
            needsUpdate = true;
            normalizedCount++;
          }

          if (!updatedAgent.status) {
            console.log(`[AIAgentsDataContext] Setting default status for agent ${id}`);
            updatedAgent.status = 'inactive';
            needsUpdate = true;
            normalizedCount++;
          }

          // Ensure optional fields exist with defaults (don't count as normalization)
          if (typeof updatedAgent.conversationsProcessed !== 'number') {
            updatedAgent.conversationsProcessed = 0;
            needsUpdate = true;
          }

          if (!updatedAgent.successRate) {
            updatedAgent.successRate = '0%';
            needsUpdate = true;
          }

          if (!updatedAgent.avgResponseTime) {
            updatedAgent.avgResponseTime = '0ms';
            needsUpdate = true;
          }

          if (!updatedAgent.lastActive) {
            updatedAgent.lastActive = 'N/A';
            needsUpdate = true;
          }

          if (needsUpdate) {
            console.log(`[AIAgentsDataContext] Updated agent ${id} with missing fields`);
            newAgents[id] = updatedAgent;
          }

          // Only remove agents that are completely invalid (missing ID)
          if (!updatedAgent.id) {
            console.warn(`[AIAgentsDataContext] Removing agent with no ID:`, {
              originalAgent: agent,
              agentKeys: Object.keys(agent || {})
            });
            delete newAgents[id];
            cleanedCount++;
          }
        } else {
          console.warn(`[AIAgentsDataContext] Removing completely invalid agent:`, {
            agent,
            type: typeof agent,
            isNull: agent === null,
            isUndefined: agent === undefined
          });
          delete newAgents[id];
          cleanedCount++;
        }
      }

      console.log(`[AIAgentsDataContext] Cleanup completed: ${Object.keys(newAgents).length} agents remaining`);
      return newAgents;
    });

    if (migratedCount > 0) {
      console.log(`[AIAgentsDataContext] Migrated ${migratedCount} agents from old field structure`);
    }

    if (normalizedCount > 0) {
      console.log(`[AIAgentsDataContext] Normalized ${normalizedCount} agents with missing core fields`);
    }

    if (cleanedCount > 0) {
      console.log(`[AIAgentsDataContext] Cleaned up ${cleanedCount} invalid agents`);
    }

    return cleanedCount;
  }, []); // Empty deps - function doesn't depend on external state

  const getCurrentUser = async (): Promise<User | null> => {
    if (!repositories) throw new Error('Repositories not initialized');

    try {
      return await repositories.users.getCurrentUser();
    } catch (err) {
      console.error('Failed to get current user:', err);
      throw err;
    }
  };

  const value: AIAgentsDataContextType = {
    aiAgents,
    users,
    getAIAgentById,
    getAIAgentsByStatus,
    createAIAgent,
    updateAIAgent,
    deleteAIAgent,
    getCurrentUser,
    cleanupInvalidAgents,
    isLoading: isLoading || repoLoading,
    error: error || repoError
  };

  return (
    <AIAgentsDataContext.Provider value={value}>
      {children}
    </AIAgentsDataContext.Provider>
  );
};