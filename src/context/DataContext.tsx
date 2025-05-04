import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  messages as initialMessages,
  conversations as initialConversations,
  collections as initialCollections,
  groups as initialGroups,
  aiAgents as initialAIAgents,
  users as initialUsers
} from '../data/mockData';
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
  const [messages] = useState<Record<string, Message>>(initialMessages);
  const [conversations] = useState<Record<string, Conversation>>(initialConversations);
  const [collections] = useState<Record<string, Collection>>(initialCollections);
  const [groups] = useState<Record<string, Group>>(initialGroups);
  const [aiAgents] = useState<Record<string, AIAgent>>(initialAIAgents);
  const [users] = useState<Record<string, User>>(initialUsers);

  // Helper function to get messages by conversation ID
  const getMessagesByConversationId = (conversationId: string): Message[] => {
    const conversation = conversations[conversationId];
    if (!conversation) return [];
    
    return conversation.messages
      .map(messageId => messages[messageId])
      .filter(Boolean)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  // Helper function to get conversations by collection ID
  const getConversationsByCollectionId = (collectionId: string): Conversation[] => {
    const collection = collections[collectionId];
    if (!collection) return [];
    
    return collection.conversations
      .map(conversationId => conversations[conversationId])
      .filter(Boolean);
  };

  // Helper function to get collections by group ID
  const getCollectionsByGroupId = (groupId: string): Collection[] => {
    const group = groups[groupId];
    if (!group) return [];
    
    return group.collectionIds
      .map(collectionId => collections[collectionId])
      .filter(Boolean);
  };

  // Helper function to get current user (for demo, we'll return the admin)
  const getCurrentUser = (): User => {
    return users['admin1'];
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
