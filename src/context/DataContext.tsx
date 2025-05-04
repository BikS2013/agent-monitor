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
  getCurrentUser as getUser
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages] = useState<Record<string, Message>>(getMessages());
  const [conversations] = useState<Record<string, Conversation>>(getConversations());
  const [collections] = useState<Record<string, Collection>>(getCollections());
  const [groups] = useState<Record<string, Group>>(getGroups());
  const [aiAgents] = useState<Record<string, AIAgent>>(getAIAgents());
  const [users] = useState<Record<string, User>>(getUsers());

  // Helper function to get current user
  const getCurrentUser = (): User => {
    return getUser();
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
    getCurrentUser
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
