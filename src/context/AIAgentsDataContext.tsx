import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
      if (!repositories || repoLoading) return;

      try {
        setIsLoading(true);
        setError(null);

        // Load AI agents
        const agentsResult = await repositories.aiAgents.getAll();
        const agentsMap = agentsResult.data.reduce((acc: Record<string, AIAgent>, agent: AIAgent) => {
          acc[agent.id] = agent;
          return acc;
        }, {} as Record<string, AIAgent>);
        setAIAgents(agentsMap);

        // Load users (limited data)
        const usersResult = await repositories.users.getAll();
        const usersMap = usersResult.data.reduce((acc: Record<string, User>, user: User) => {
          acc[user.id] = user;
          return acc;
        }, {} as Record<string, User>);
        setUsers(usersMap);

      } catch (err) {
        console.error('AIAgentsDataContext: Failed to load data:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
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
      const newAgent = await repositories.aiAgents.create(data);
      setAIAgents(prev => ({ ...prev, [newAgent.id]: newAgent }));
      return newAgent;
    } catch (err) {
      console.error('Failed to create AI agent:', err);
      throw err;
    }
  };

  const updateAIAgent = async (id: string, data: Partial<AIAgent>): Promise<AIAgent | null> => {
    if (!repositories) throw new Error('Repositories not initialized');
    
    try {
      const updatedAgent = await repositories.aiAgents.update(id, data);
      if (updatedAgent) {
        setAIAgents(prev => ({ ...prev, [updatedAgent.id]: updatedAgent }));
      }
      return updatedAgent;
    } catch (err) {
      console.error(`Failed to update AI agent ${id}:`, err);
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
    isLoading: isLoading || repoLoading,
    error: error || repoError
  };

  return (
    <AIAgentsDataContext.Provider value={value}>
      {children}
    </AIAgentsDataContext.Provider>
  );
};