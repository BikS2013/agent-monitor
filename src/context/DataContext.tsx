import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Message,
  Conversation,
  Collection,
  Group,
  AIAgent,
  User
} from '../data/types';

import { useRepositories } from './RepositoryContext';
import { QueryOptions } from '../data/repositories/interfaces/IRepository';

/**
 * Updated DataContext with lazy loading support
 * Uses repositories instead of direct API access
 */

interface DataContextType {
  // State data - simplified for components to continue working
  messages: Record<string, Message>;
  conversations: Record<string, Conversation>;
  collections: Record<string, Collection>;
  groups: Record<string, Group>;
  aiAgents: Record<string, AIAgent>;
  users: Record<string, User>;

  // Loading states
  loading: {
    messages: boolean;
    conversations: boolean;
    collections: boolean;
    groups: boolean;
    aiAgents: boolean;
    users: boolean;
  };

  // Data access methods
  getMessagesByConversationId: (conversationId: string) => Promise<Message[]>;
  getConversationsByCollectionId: (collectionId: string, options?: QueryOptions) => Promise<Conversation[]>;
  getCollectionsByGroupId: (groupId: string, options?: QueryOptions) => Promise<Collection[]>;
  getCurrentUser: () => Promise<User>;

  // Data creation methods
  addCollection: (collectionData: Omit<Collection, 'id'> & { id?: string }) => Promise<Collection>;
  addGroup: (groupData: Omit<Group, 'id'>) => Promise<Group>;
  addAIAgent: (agentData: Omit<AIAgent, 'id'>) => Promise<AIAgent>;

  // Data update methods
  updateCollection: (collectionId: string, collectionData: Partial<Collection>) => Promise<Collection>;
  updateGroup: (group: Group) => Promise<Group>;
  updateAIAgent: (agent: AIAgent) => Promise<AIAgent>;

  // Data deletion methods
  deleteCollection: (collectionId: string) => Promise<boolean>;

  // Refresh methods
  refreshData: () => Promise<void>;
  refreshCollection: (collectionId: string) => Promise<void>;
  refreshAIAgentStats: (aiAgentId: string) => Promise<void>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use repositories from RepositoryContext
  const {
    initialized,
    messageRepository,
    conversationRepository,
    collectionRepository,
    groupRepository,
    aiAgentRepository,
    userRepository
  } = useRepositories();

  // State for entity data
  const [messages, setMessages] = useState<Record<string, Message>>({});
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  const [collections, setCollections] = useState<Record<string, Collection>>({});
  const [groups, setGroups] = useState<Record<string, Group>>({});
  const [aiAgents, setAIAgents] = useState<Record<string, AIAgent>>({});
  const [users, setUsers] = useState<Record<string, User>>({});

  // Loading states
  const [loading, setLoading] = useState({
    messages: false,
    conversations: false,
    collections: false,
    groups: false,
    aiAgents: false,
    users: false
  });

  // Load essential data on initialization
  useEffect(() => {
    if (initialized) {
      console.log("DataContext: Repositories initialized, loading initial data");
      loadInitialData();
    } else {
      console.log("DataContext: Waiting for repositories to initialize");
    }
  }, [initialized]);

  // Debug: Log data state changes
  useEffect(() => {
    console.log("DataContext: Conversations state updated", {
      count: Object.keys(conversations).length,
      ids: Object.keys(conversations)
    });
  }, [conversations]);

  useEffect(() => {
    console.log("DataContext: Collections state updated", {
      count: Object.keys(collections).length,
      ids: Object.keys(collections)
    });
  }, [collections]);

  useEffect(() => {
    console.log("DataContext: Groups state updated", {
      count: Object.keys(groups).length,
      ids: Object.keys(groups)
    });
  }, [groups]);

  /**
   * Load initial data - only metadata, not full entities
   * This gives the UI something to display quickly
   */
  const loadInitialData = async () => {
    try {
      console.log("DataContext: Starting to load initial data");

      // Load conversations (without messages)
      console.log("DataContext: Loading conversations...");
      setLoading(prev => ({ ...prev, conversations: true }));
      const conversationsResult = await conversationRepository!.getAll();
      console.log(`DataContext: Received ${conversationsResult.data.length} conversations`);

      if (conversationsResult.data.length === 0) {
        console.warn("DataContext: No conversations found in repository");
      }

      const conversationsRecord = conversationsResult.data.reduce((record, conversation) => {
        // Ensure conclusion is one of the valid options
        if (conversation.conclusion !== 'successful' && conversation.conclusion !== 'unsuccessful') {
          conversation.conclusion = 'uncertain';
        }

        record[conversation.thread_id] = conversation;
        return record;
      }, {} as Record<string, Conversation>);

      console.log(`DataContext: Processed ${Object.keys(conversationsRecord).length} conversations`);
      setConversations(conversationsRecord);
      setLoading(prev => ({ ...prev, conversations: false }));

      // Load collections (without conversations)
      console.log("DataContext: Loading collections...");
      setLoading(prev => ({ ...prev, collections: true }));
      const collectionsResult = await collectionRepository!.getAll();
      console.log(`DataContext: Received ${collectionsResult.data.length} collections`);

      if (collectionsResult.data.length === 0) {
        console.warn("DataContext: No collections found in repository");
      }

      const collectionsRecord = collectionsResult.data.reduce((record, collection) => {
        record[collection.id] = collection;
        return record;
      }, {} as Record<string, Collection>);

      console.log(`DataContext: Processed ${Object.keys(collectionsRecord).length} collections`);
      setCollections(collectionsRecord);
      setLoading(prev => ({ ...prev, collections: false }));

      // Load groups (without collections)
      console.log("DataContext: Loading groups...");
      setLoading(prev => ({ ...prev, groups: true }));
      const groupsResult = await groupRepository!.getAll();
      console.log(`DataContext: Received ${groupsResult.data.length} groups`);

      if (groupsResult.data.length === 0) {
        console.warn("DataContext: No groups found in repository");
      }

      const groupsRecord = groupsResult.data.reduce((record, group) => {
        record[group.id] = group;
        return record;
      }, {} as Record<string, Group>);

      console.log(`DataContext: Processed ${Object.keys(groupsRecord).length} groups`);
      setGroups(groupsRecord);
      setLoading(prev => ({ ...prev, groups: false }));

      // Load AI agents
      console.log("DataContext: Loading AI agents...");
      setLoading(prev => ({ ...prev, aiAgents: true }));
      const aiAgentsResult = await aiAgentRepository!.getAll();
      console.log(`DataContext: Received ${aiAgentsResult.data.length} AI agents`);

      if (aiAgentsResult.data.length === 0) {
        console.warn("DataContext: No AI agents found in repository");
      }

      const aiAgentsRecord = aiAgentsResult.data.reduce((record, aiAgent) => {
        record[aiAgent.id] = aiAgent;
        return record;
      }, {} as Record<string, AIAgent>);

      console.log(`DataContext: Processed ${Object.keys(aiAgentsRecord).length} AI agents`);
      setAIAgents(aiAgentsRecord);
      setLoading(prev => ({ ...prev, aiAgents: false }));

      // Load users
      console.log("DataContext: Loading users...");
      setLoading(prev => ({ ...prev, users: true }));
      const usersResult = await userRepository!.getAll();
      console.log(`DataContext: Received ${usersResult.data.length} users`);

      if (usersResult.data.length === 0) {
        console.warn("DataContext: No users found in repository");
      }

      const usersRecord = usersResult.data.reduce((record, user) => {
        record[user.id] = user;
        return record;
      }, {} as Record<string, User>);

      console.log(`DataContext: Processed ${Object.keys(usersRecord).length} users`);
      setUsers(usersRecord);
      setLoading(prev => ({ ...prev, users: false }));

      console.log("DataContext: Initial data loading complete", {
        conversationsCount: Object.keys(conversationsRecord).length,
        collectionsCount: Object.keys(collectionsRecord).length,
        groupsCount: Object.keys(groupsRecord).length,
        aiAgentsCount: Object.keys(aiAgentsRecord).length,
        usersCount: Object.keys(usersRecord).length
      });
    } catch (error) {
      console.error('Failed to load initial data:', error);
      // Reset loading states
      setLoading({
        messages: false,
        conversations: false,
        collections: false,
        groups: false,
        aiAgents: false,
        users: false
      });
    }
  };

  // Store the last loaded conversation ID and timestamp to prevent excessive loading
  const [lastConversationMessageLoad, setLastConversationMessageLoad] = useState<{
    id: string,
    timestamp: number
  } | null>(null);

  /**
   * Get messages for a conversation (lazy loading) with improved stability
   * Enhanced request cancellation, caching, and loading state management
   */
  const getMessagesByConversationId = async (conversationId: string): Promise<Message[]> => {
    if (!initialized || !messageRepository || !conversationRepository) {
      console.warn(`DataContext: Repositories not initialized, cannot load messages for ${conversationId}`);
      return [];
    }

    // Get the conversation object first
    const conversation = conversations[conversationId];
    if (!conversation) {
      console.warn(`DataContext: Conversation ${conversationId} not found in local state`);
      return [];
    }

    // Check if we have any cached messages for this conversation
    const cachedMessages = conversation.messages
      .filter(msgId => messages[msgId]) // Only include messages we already have
      .map(msgId => messages[msgId])
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // If we have all messages cached and there's at least one, return them immediately
    const hasAllCachedMessages =
      cachedMessages.length === conversation.messages.length &&
      cachedMessages.length > 0;

    if (hasAllCachedMessages) {
      console.log(`DataContext: Using ${cachedMessages.length} cached messages for conversation ${conversationId}`);
      return cachedMessages;
    }

    // Implement strict throttling for message loading (max once per second per conversation)
    // Return cached messages (even if incomplete) during throttling period
    if (lastConversationMessageLoad &&
        lastConversationMessageLoad.id === conversationId &&
        Date.now() - lastConversationMessageLoad.timestamp < 1000) {
      console.log(`DataContext: Throttling message load for ${conversationId}, last load was ${Date.now() - lastConversationMessageLoad.timestamp}ms ago`);

      // If we have any cached messages, return them during throttling
      if (cachedMessages.length > 0) {
        return cachedMessages;
      }
    }

    // Generate a unique ID for this request to track cancellations
    const requestId = Date.now();

    // Use a ref to track the latest request (instead of window global)
    const currentLatestRequestId = (window as any)._latestMessageRequest || 0;
    if (requestId <= currentLatestRequestId) {
      console.log(`DataContext: Request ${requestId} is not newer than current latest ${currentLatestRequestId}, using cached data`);
      return cachedMessages.length > 0 ? cachedMessages : [];
    }

    // Set this as the latest request
    (window as any)._latestMessageRequest = requestId;

    // Update the last load timestamp atomically
    setLastConversationMessageLoad({
      id: conversationId,
      timestamp: Date.now()
    });

    // Use ref to track if this request was canceled
    let wasRequestCanceled = false;

    try {
      console.log(`DataContext: Loading messages for conversation ${conversationId} (request ${requestId})`);

      // Set loading state
      setLoading(prev => ({ ...prev, messages: true }));

      // Return any partial cached results if this request is canceled before repository call
      if ((window as any)._latestMessageRequest !== requestId) {
        wasRequestCanceled = true;
        console.log(`DataContext: Request ${requestId} was superseded before repository call`);
        return cachedMessages.length > 0 ? cachedMessages : [];
      }

      // Get new messages from the repository
      console.log(`DataContext: Fetching messages for conversation ${conversationId} from repository`);
      const messagesResult = await conversationRepository.getMessages(conversationId);

      // Verify if this request is still the latest after repository call
      if ((window as any)._latestMessageRequest !== requestId) {
        wasRequestCanceled = true;
        console.log(`DataContext: Request ${requestId} was superseded during repository call`);
        return cachedMessages.length > 0 ? cachedMessages : messagesResult.data;
      }

      console.log(`DataContext: Received ${messagesResult.data.length} messages for request ${requestId}`);

      // Use functional update to atomically update the messages state
      setMessages(prevMessages => {
        const merged = { ...prevMessages };
        messagesResult.data.forEach(message => {
          merged[message.id] = message;
        });
        return merged;
      });

      // Clean up loading state if this is still the latest request
      if ((window as any)._latestMessageRequest === requestId) {
        setLoading(prev => ({ ...prev, messages: false }));
      }

      return messagesResult.data;
    } catch (error) {
      console.error(`Failed to get messages for conversation ${conversationId} (request ${requestId}):`, error);

      // Only update loading state if this was the latest request
      if ((window as any)._latestMessageRequest === requestId) {
        setLoading(prev => ({ ...prev, messages: false }));
      }

      // Return any cached messages on error
      return cachedMessages.length > 0 ? cachedMessages : [];
    } finally {
      // Always check if we need to update the loading state
      if (wasRequestCanceled) {
        console.log(`DataContext: Cleaning up canceled request ${requestId}`);
      }
    }
  };

  /**
   * Get conversations for a collection (lazy loading)
   */
  const getConversationsByCollectionId = async (
    collectionId: string,
    options?: QueryOptions
  ): Promise<Conversation[]> => {
    if (!initialized || !collectionRepository) {
      return [];
    }

    try {
      setLoading(prev => ({ ...prev, conversations: true }));

      // Check if collection exists
      const collection = await collectionRepository.getById(collectionId);
      if (!collection) {
        return [];
      }

      // Get conversations for the collection
      const conversationsResult = await collectionRepository.getConversations(collectionId, options);

      // Update conversations state with new conversations
      const newConversations = { ...conversations };
      conversationsResult.data.forEach(conversation => {
        // Ensure conclusion is one of the valid options
        if (conversation.conclusion !== 'successful' && conversation.conclusion !== 'unsuccessful') {
          conversation.conclusion = 'uncertain';
        }

        newConversations[conversation.thread_id] = conversation;
      });
      setConversations(newConversations);

      setLoading(prev => ({ ...prev, conversations: false }));
      return conversationsResult.data;
    } catch (error) {
      console.error(`Failed to get conversations for collection ${collectionId}:`, error);
      setLoading(prev => ({ ...prev, conversations: false }));
      return [];
    }
  };

  /**
   * Get collections for a group (lazy loading)
   */
  const getCollectionsByGroupId = async (
    groupId: string,
    options?: QueryOptions
  ): Promise<Collection[]> => {
    if (!initialized || !groupRepository) {
      return [];
    }

    try {
      setLoading(prev => ({ ...prev, collections: true }));

      // Check if group exists
      const group = await groupRepository.getById(groupId);
      if (!group) {
        return [];
      }

      // Get collections for the group
      const collectionsResult = await groupRepository.getCollections(groupId, options);

      // Update collections state with new collections
      const newCollections = { ...collections };
      collectionsResult.data.forEach(collection => {
        newCollections[collection.id] = collection;
      });
      setCollections(newCollections);

      setLoading(prev => ({ ...prev, collections: false }));
      return collectionsResult.data;
    } catch (error) {
      console.error(`Failed to get collections for group ${groupId}:`, error);
      setLoading(prev => ({ ...prev, collections: false }));
      return [];
    }
  };

  /**
   * Get current user
   */
  const getCurrentUser = async (): Promise<User> => {
    if (!initialized || !userRepository) {
      throw new Error('User repository not initialized');
    }

    const user = await userRepository.getCurrentUser();
    if (!user) {
      throw new Error('Current user not found');
    }

    return user;
  };

  /**
   * Add a new collection
   */
  const addCollection = async (
    collectionData: Omit<Collection, 'id'> & { id?: string }
  ): Promise<Collection> => {
    if (!initialized || !collectionRepository) {
      throw new Error('Collection repository not initialized');
    }

    try {
      // Create the collection
      const collection = await collectionRepository.create(collectionData);

      // Update collections state
      setCollections(prev => ({
        ...prev,
        [collection.id]: collection
      }));

      return collection;
    } catch (error) {
      console.error('Failed to create collection:', error);
      throw error;
    }
  };

  /**
   * Update an existing collection
   */
  const updateCollection = async (collectionId: string, collectionData: Partial<Collection>): Promise<Collection> => {
    if (!initialized || !collectionRepository) {
      throw new Error('Collection repository not initialized');
    }

    try {
      // Update the collection
      const updatedCollection = await collectionRepository.update(collectionId, collectionData);

      if (!updatedCollection) {
        throw new Error('Failed to update collection');
      }

      // Update collections state
      setCollections(prev => ({
        ...prev,
        [collectionId]: updatedCollection
      }));

      return updatedCollection;
    } catch (error) {
      console.error('Failed to update collection:', error);
      throw error;
    }
  };

  /**
   * Add a new group
   */
  const addGroup = async (groupData: Omit<Group, 'id'>): Promise<Group> => {
    if (!initialized || !groupRepository) {
      throw new Error('Group repository not initialized');
    }

    try {
      // Create the group
      const group = await groupRepository.create(groupData);

      // Update groups state
      setGroups(prev => ({
        ...prev,
        [group.id]: group
      }));

      return group;
    } catch (error) {
      console.error('Failed to create group:', error);
      throw error;
    }
  };

  /**
   * Add a new AI agent
   */
  const addAIAgent = async (agentData: Omit<AIAgent, 'id'>): Promise<AIAgent> => {
    if (!initialized || !aiAgentRepository) {
      throw new Error('AI agent repository not initialized');
    }

    try {
      // Create the AI agent
      const aiAgent = await aiAgentRepository.create(agentData);

      // Update AI agents state
      setAIAgents(prev => ({
        ...prev,
        [aiAgent.id]: aiAgent
      }));

      return aiAgent;
    } catch (error) {
      console.error('Failed to create AI agent:', error);
      throw error;
    }
  };

  /**
   * Delete a collection
   */
  const deleteCollection = async (collectionId: string): Promise<boolean> => {
    if (!initialized || !collectionRepository) {
      throw new Error('Collection repository not initialized');
    }

    try {
      // Delete the collection
      const success = await collectionRepository.delete(collectionId);

      if (success) {
        // Remove from collections state
        setCollections(prev => {
          const updated = { ...prev };
          delete updated[collectionId];
          return updated;
        });
      }

      return success;
    } catch (error) {
      console.error('Failed to delete collection:', error);
      throw error;
    }
  };

  /**
   * Refresh all data
   */
  const refreshData = async (): Promise<void> => {
    if (!initialized) {
      return;
    }

    await loadInitialData();
  };

  /**
   * Refresh a collection
   */
  const refreshCollection = async (collectionId: string): Promise<void> => {
    if (!initialized || !collectionRepository) {
      return;
    }

    try {
      // Refresh conversations in the collection
      await collectionRepository.refreshConversations(collectionId);

      // Get the updated collection
      const collection = await collectionRepository.getById(collectionId);

      if (collection) {
        // Update collections state
        setCollections(prev => ({
          ...prev,
          [collectionId]: collection
        }));
      }
    } catch (error) {
      console.error(`Failed to refresh collection ${collectionId}:`, error);
    }
  };

  /**
   * Refresh AI agent statistics
   */
  const refreshAIAgentStats = async (aiAgentId: string): Promise<void> => {
    if (!initialized || !aiAgentRepository) {
      return;
    }

    try {
      // Update AI agent statistics
      const aiAgent = await aiAgentRepository.updateStatistics(aiAgentId);

      if (aiAgent) {
        // Update AI agents state
        setAIAgents(prev => ({
          ...prev,
          [aiAgentId]: aiAgent
        }));
      }
    } catch (error) {
      console.error(`Failed to refresh AI agent statistics ${aiAgentId}:`, error);
    }
  };

  /**
   * Update an existing group
   */
  const updateGroup = async (group: Group): Promise<Group> => {
    if (!initialized || !groupRepository) {
      throw new Error('Group repository not initialized');
    }

    try {
      // For mock implementation, just update the state directly
      // In a real implementation, this would call the repository's update method
      // const updatedGroup = await groupRepository.update(group.id, group);

      // Update groups state
      setGroups(prev => ({
        ...prev,
        [group.id]: group
      }));

      return group;
    } catch (error) {
      console.error(`Failed to update group ${group.id}:`, error);
      throw error;
    }
  };

  /**
   * Update an existing AI agent
   */
  const updateAIAgent = async (agent: AIAgent): Promise<AIAgent> => {
    if (!initialized || !aiAgentRepository) {
      throw new Error('AI agent repository not initialized');
    }

    try {
      // For mock implementation, just update the state directly
      // In a real implementation, this would call the repository's update method
      // const updatedAgent = await aiAgentRepository.update(agent.id, agent);

      // Update AI agents state
      setAIAgents(prev => ({
        ...prev,
        [agent.id]: agent
      }));

      return agent;
    } catch (error) {
      console.error(`Failed to update AI agent ${agent.id}:`, error);
      throw error;
    }
  };

  const value: DataContextType = {
    // State data
    messages,
    conversations,
    collections,
    groups,
    aiAgents,
    users,

    // Loading states
    loading,

    // Data access methods
    getMessagesByConversationId,
    getConversationsByCollectionId,
    getCollectionsByGroupId,
    getCurrentUser,

    // Data creation methods
    addCollection,
    addGroup,
    addAIAgent,

    // Data update methods
    updateCollection,
    updateGroup,
    updateAIAgent,

    // Data deletion methods
    deleteCollection,

    // Refresh methods
    refreshData,
    refreshCollection,
    refreshAIAgentStats
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};