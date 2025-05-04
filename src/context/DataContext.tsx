import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  getMessages,
  getConversations,
  getCollections,
  getGroups,
  getAIAgents,
  getUsers,
  getMessagesByConversationId,
  getConversationsByCollectionId,
  getCollectionsByGroupId,
  getCurrentUser as getUser,
  createCollection,
  createGroup,
  createAIAgent
} from '../data/api';
import { Message, Conversation, Collection, Group, AIAgent, User } from '../data/types';

interface DataContextType {
  messages: Record<string, Message>;
  conversations: Record<string, Conversation>;
  collections: Record<string, Collection>;
  groups: Record<string, Group>;
  aiAgents: Record<string, AIAgent>;
  users: Record<string, User>;
  getMessagesByConversationId: (conversationId: string) => Message[];
  getConversationsByCollectionId: (collectionId: string) => Conversation[];
  getCollectionsByGroupId: (groupId: string) => Collection[];
  getCurrentUser: () => User;
  addCollection: (collectionData: Omit<Collection, 'id'> & { id?: string }) => Collection;
  addGroup: (groupData: Omit<Group, 'id'>) => Group;
  addAIAgent: (agentData: Omit<AIAgent, 'id'>) => AIAgent;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Record<string, Message>>(getMessages());
  const [conversations, setConversations] = useState<Record<string, Conversation>>(getConversations());
  const [collections, setCollections] = useState<Record<string, Collection>>(getCollections());
  const [groups, setGroups] = useState<Record<string, Group>>(getGroups());
  const [aiAgents, setAIAgents] = useState<Record<string, AIAgent>>(getAIAgents());
  const [users, setUsers] = useState<Record<string, User>>(getUsers());

  // Helper function to get current user
  const getCurrentUser = (): User => {
    return getUser();
  };

  // Function to refresh data from the API
  const refreshData = () => {
    setMessages(getMessages());
    setConversations(getConversations());
    setCollections(getCollections());
    setGroups(getGroups());
    setAIAgents(getAIAgents());
    setUsers(getUsers());
  };

  // Functions to add or update items
  const addCollection = (collectionData: Omit<Collection, 'id'> & { id?: string }): Collection => {
    const collection = createCollection(collectionData);
    setCollections(prev => ({
      ...prev,
      [collection.id]: collection
    }));
    return collection;
  };

  const addGroup = (groupData: Omit<Group, 'id'>): Group => {
    const newGroup = createGroup(groupData);
    setGroups(prev => ({
      ...prev,
      [newGroup.id]: newGroup
    }));
    return newGroup;
  };

  const addAIAgent = (agentData: Omit<AIAgent, 'id'>): AIAgent => {
    const newAgent = createAIAgent(agentData);
    setAIAgents(prev => ({
      ...prev,
      [newAgent.id]: newAgent
    }));
    return newAgent;
  };

  const value = {
    messages,
    conversations,
    collections,
    groups,
    aiAgents,
    users,
    getMessagesByConversationId,
    getConversationsByCollectionId,
    getCollectionsByGroupId,
    getCurrentUser,
    addCollection,
    addGroup,
    addAIAgent,
    refreshData
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
