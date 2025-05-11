import {
  messages as initialMessages,
  conversations as initialConversations,
  collections as initialCollections,
  groups as initialGroups,
  aiAgents as initialAIAgents,
  users as initialUsers
} from './mockData';

// Create mutable copies of the mock data
const messages = { ...initialMessages };
const conversations = { ...initialConversations };
const collections = { ...initialCollections };
const groups = { ...initialGroups };
const aiAgents = { ...initialAIAgents };
const users = { ...initialUsers };

import {
  Message,
  Conversation,
  Collection,
  Group,
  AIAgent,
  User
} from './types';
import { filterConversationsByCollectionCriteria } from './filterUtils';

// Mock API functions to simulate backend calls

// Messages
export const getMessages = (): Record<string, Message> => {
  return messages;
};

export const getMessage = (id: string): Message | undefined => {
  return messages[id];
};

export const getMessagesByConversationId = (conversationId: string): Message[] => {
  // First try direct access by key
  let conversation = conversations[conversationId];

  // If that fails, look for a conversation with matching thread_id
  if (!conversation) {
    conversation = Object.values(conversations).find(conv => conv.thread_id === conversationId);
  }

  if (!conversation) return [];

  return conversation.messages
    .map(messageId => messages[messageId])
    .filter(Boolean)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

// Conversations
export const getConversations = (): Record<string, Conversation> => {
  // Add the conversationTimestamp virtual property and getOrderedMessages method to all conversations
  Object.keys(conversations).forEach(id => {
    const conversation = conversations[id];
    const msgs = getMessagesByConversationId(conversation.thread_id);

    // Set the conversationTimestamp (use created_at as fallback if no messages)
    conversation.conversationTimestamp = msgs.length > 0
      ? msgs[0].timestamp
      : conversation.created_at;

    // Add the getOrderedMessages method
    conversation.getOrderedMessages = () => {
      return getMessagesByConversationId(conversation.thread_id);
    };
  });

  return conversations;
};

export const getConversation = (id: string): Conversation | undefined => {
  // First try direct access by key
  let conversation = conversations[id];

  // If that fails, look for a conversation with matching thread_id
  if (!conversation) {
    conversation = Object.values(conversations).find(conv => conv.thread_id === id);
  }

  if (conversation) {
    const msgs = getMessagesByConversationId(conversation.thread_id);

    // Add the conversationTimestamp virtual property
    conversation.conversationTimestamp = msgs.length > 0
      ? msgs[0].timestamp
      : conversation.created_at;

    // Add the getOrderedMessages method
    conversation.getOrderedMessages = () => {
      return getMessagesByConversationId(conversation.thread_id);
    };
  }
  return conversation;
};

export const getConversationsByCollectionId = (collectionId: string): Conversation[] => {
  const collection = collections[collectionId];
  if (!collection) return [];

  return collection.conversations
    .map(conversationId => {
      // First try direct access by key
      let conversation = conversations[conversationId];

      // If that fails, look for a conversation with matching thread_id
      if (!conversation) {
        conversation = Object.values(conversations).find(conv => conv.thread_id === conversationId);
      }

      if (conversation) {
        const msgs = getMessagesByConversationId(conversation.thread_id);

        // Ensure the conversationTimestamp is set
        conversation.conversationTimestamp = msgs.length > 0
          ? msgs[0].timestamp
          : conversation.created_at;

        // Add the getOrderedMessages method
        conversation.getOrderedMessages = () => {
          return getMessagesByConversationId(conversation.thread_id);
        };
      }
      return conversation;
    })
    .filter(Boolean);
};

// Collections
export const getCollections = (): Record<string, Collection> => {
  // Add methods to all collections
  Object.keys(collections).forEach(id => {
    const collection = collections[id];

    // Add the getConversations method
    collection.getConversations = () => {
      return getConversationsByCollectionId(id);
    };

    // Add the refreshConversations method
    collection.refreshConversations = () => {
      collection.conversations = filterConversationsByCollectionCriteria(
        conversations,
        collection.filterCriteria
      );

      // Update metadata
      collection.metadata = {
        ...collection.metadata,
        totalConversations: collection.conversations.length,
        avgDuration: collection.conversations.length > 0
          ? calculateAverageDuration(collection.conversations)
          : '0m'
      };
    };
  });

  return collections;
};

export const getCollection = (id: string): Collection | undefined => {
  const collection = collections[id];
  if (collection) {
    // Add the getConversations method
    collection.getConversations = () => {
      return getConversationsByCollectionId(id);
    };

    // Add the refreshConversations method
    collection.refreshConversations = () => {
      collection.conversations = filterConversationsByCollectionCriteria(
        conversations,
        collection.filterCriteria
      );

      // Update metadata
      collection.metadata = {
        ...collection.metadata,
        totalConversations: collection.conversations.length,
        avgDuration: collection.conversations.length > 0
          ? calculateAverageDuration(collection.conversations)
          : '0m'
      };
    };
  }
  return collection;
};

export const getCollectionsByGroupId = (groupId: string): Collection[] => {
  const group = groups[groupId];
  if (!group) return [];

  return group.collectionIds
    .map(collectionId => {
      const collection = collections[collectionId];
      if (collection) {
        // Add the getConversations method
        collection.getConversations = () => {
          return getConversationsByCollectionId(collectionId);
        };

        // Add the refreshConversations method
        collection.refreshConversations = () => {
          collection.conversations = filterConversationsByCollectionCriteria(
            conversations,
            collection.filterCriteria
          );

          // Update metadata
          collection.metadata = {
            ...collection.metadata,
            totalConversations: collection.conversations.length,
            avgDuration: collection.conversations.length > 0
              ? calculateAverageDuration(collection.conversations)
              : '0m'
          };
        };
      }
      return collection;
    })
    .filter(Boolean);
};

// Groups
export const getGroups = (): Record<string, Group> => {
  return groups;
};

export const getGroup = (id: string): Group | undefined => {
  return groups[id];
};

// AI Agents
export const getAIAgents = (): Record<string, AIAgent> => {
  return aiAgents;
};

export const getAIAgent = (id: string): AIAgent | undefined => {
  return aiAgents[id];
};

// Users
export const getUsers = (): Record<string, User> => {
  return users;
};

export const getUser = (id: string): User | undefined => {
  return users[id];
};

export const getCurrentUser = (): User => {
  return users['admin1'];
};

// Create or update collections
export const createCollection = (collectionData: Omit<Collection, 'id'> & { id?: string }): Collection => {
  // Apply filter criteria to get matching conversations
  const matchingConversationIds = filterConversationsByCollectionCriteria(
    conversations,
    collectionData.filterCriteria
  );

  // Update the conversations list in the collection data
  const updatedData = {
    ...collectionData,
    conversations: matchingConversationIds,
    metadata: {
      ...collectionData.metadata,
      totalConversations: matchingConversationIds.length,
      // Calculate average duration if there are conversations
      avgDuration: matchingConversationIds.length > 0
        ? calculateAverageDuration(matchingConversationIds)
        : '0m'
    }
  };

  let resultCollection: Collection;

  // If id is provided, update existing collection
  if (updatedData.id && collections[updatedData.id]) {
    const { id, ...data } = updatedData;
    const updatedCollection: Collection = {
      id,
      ...data
    };

    collections[id] = updatedCollection;
    resultCollection = updatedCollection;
  } else {
    // Otherwise create a new collection
    const id = `c${Object.keys(collections).length + 1}`;
    const newCollection: Collection = {
      id,
      ...updatedData
    };

    collections[id] = newCollection;
    resultCollection = newCollection;
  }

  // Add methods to the collection
  resultCollection.getConversations = () => {
    return getConversationsByCollectionId(resultCollection.id);
  };

  resultCollection.refreshConversations = () => {
    resultCollection.conversations = filterConversationsByCollectionCriteria(
      conversations,
      resultCollection.filterCriteria
    );

    // Update metadata
    resultCollection.metadata = {
      ...resultCollection.metadata,
      totalConversations: resultCollection.conversations.length,
      avgDuration: resultCollection.conversations.length > 0
        ? calculateAverageDuration(resultCollection.conversations)
        : '0m'
    };
  };

  return resultCollection;
};

// Helper function to calculate average duration of conversations
const calculateAverageDuration = (conversationIds: string[]): string => {
  if (conversationIds.length === 0) return '0m';

  // Extract duration strings and convert to minutes
  const durationRegex = /(\d+)m/;
  let totalMinutes = 0;
  let count = 0;

  conversationIds.forEach(id => {
    // First try direct access by key
    let conversation = conversations[id];

    // If that fails, look for a conversation with matching thread_id
    if (!conversation) {
      conversation = Object.values(conversations).find(conv => conv.thread_id === id);
    }

    if (conversation) {
      const match = conversation.duration.match(durationRegex);
      if (match && match[1]) {
        totalMinutes += parseInt(match[1]);
        count++;
      }
    }
  });

  if (count === 0) return '0m';

  // Calculate average and round to nearest minute
  const avgMinutes = Math.round(totalMinutes / count);
  return `${avgMinutes}m`;
};

export const createGroup = (groupData: Omit<Group, 'id'>): Group => {
  const id = `g${Object.keys(groups).length + 1}`;
  const newGroup: Group = {
    id,
    ...groupData
  };

  groups[id] = newGroup;
  return newGroup;
};

export const createAIAgent = (agentData: Omit<AIAgent, 'id'>): AIAgent => {
  const id = `ai${Object.keys(aiAgents).length + 1}`;
  const newAgent: AIAgent = {
    id,
    ...agentData
  };

  aiAgents[id] = newAgent;
  return newAgent;
};
