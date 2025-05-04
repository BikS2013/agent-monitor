import { 
  Message, 
  Conversation, 
  Collection, 
  Group, 
  AIAgent, 
  User 
} from '../types';
import { IDataSource } from './IDataSource';
import { filterConversationsByCollectionCriteria } from '../filterUtils';

/**
 * Implementation of data source using a JSON file
 * In a real application, this would be replaced with API calls
 */
export class JsonDataSource implements IDataSource {
  private filePath: string;
  private initialized: boolean = false;
  
  // Cache for loaded data
  private data: {
    messages: Record<string, Message>;
    conversations: Record<string, Conversation>;
    collections: Record<string, Collection>;
    groups: Record<string, Group>;
    aiAgents: Record<string, AIAgent>;
    users: Record<string, User>;
  } | null = null;
  
  constructor(filePath: string) {
    this.filePath = filePath;
  }
  
  /**
   * Initialize the data source by loading data from JSON file
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // In a browser environment, we would use fetch
      // For simplicity, we're directly importing mock data here
      const { 
        messages, 
        conversations, 
        collections, 
        groups, 
        aiAgents, 
        users 
      } = await import('../mockData');
      
      this.data = {
        messages: { ...messages },
        conversations: { ...conversations },
        collections: { ...collections },
        groups: { ...groups },
        aiAgents: { ...aiAgents },
        users: { ...users }
      };
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize JsonDataSource:', error);
      throw new Error('Failed to initialize data source');
    }
  }
  
  /**
   * Ensure data source is initialized before accessing data
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.data) {
      throw new Error('Data source not properly initialized');
    }
  }
  
  /* Message operations */
  
  async getMessageById(id: string): Promise<Message | null> {
    await this.ensureInitialized();
    return this.data!.messages[id] || null;
  }
  
  async getMessages(ids?: string[]): Promise<Record<string, Message>> {
    await this.ensureInitialized();
    
    if (!ids) {
      return { ...this.data!.messages };
    }
    
    const result: Record<string, Message> = {};
    for (const id of ids) {
      if (this.data!.messages[id]) {
        result[id] = this.data!.messages[id];
      }
    }
    
    return result;
  }
  
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    await this.ensureInitialized();
    
    const conversation = this.data!.conversations[conversationId];
    if (!conversation) return [];
    
    // Get and sort messages by timestamp
    return conversation.messages
      .map(messageId => this.data!.messages[messageId])
      .filter(Boolean)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  
  async createMessage(data: Omit<Message, 'id'>): Promise<Message> {
    await this.ensureInitialized();
    
    const id = `m${Object.keys(this.data!.messages).length + 1}`;
    const newMessage: Message = {
      id,
      ...data
    };
    
    this.data!.messages[id] = newMessage;
    
    // Add to conversation if specified
    const conversationId = Object.values(this.data!.conversations).find(
      conv => conv.messages.some(mId => mId === id)
    )?.id;
    
    if (conversationId) {
      this.data!.conversations[conversationId].messages.push(id);
    }
    
    return newMessage;
  }
  
  async updateMessage(id: string, data: Partial<Message>): Promise<Message | null> {
    await this.ensureInitialized();
    
    if (!this.data!.messages[id]) return null;
    
    this.data!.messages[id] = {
      ...this.data!.messages[id],
      ...data
    };
    
    return this.data!.messages[id];
  }
  
  async deleteMessage(id: string): Promise<boolean> {
    await this.ensureInitialized();
    
    if (!this.data!.messages[id]) return false;
    
    // Remove from conversation
    Object.values(this.data!.conversations).forEach(conversation => {
      const index = conversation.messages.indexOf(id);
      if (index !== -1) {
        conversation.messages.splice(index, 1);
      }
    });
    
    delete this.data!.messages[id];
    return true;
  }
  
  /* Conversation operations */
  
  async getConversationById(id: string): Promise<Conversation | null> {
    await this.ensureInitialized();
    return this.data!.conversations[id] || null;
  }
  
  async getConversations(ids?: string[]): Promise<Record<string, Conversation>> {
    await this.ensureInitialized();
    
    if (!ids) {
      return { ...this.data!.conversations };
    }
    
    const result: Record<string, Conversation> = {};
    for (const id of ids) {
      if (this.data!.conversations[id]) {
        result[id] = this.data!.conversations[id];
      }
    }
    
    return result;
  }
  
  async getConversationsByCollectionId(collectionId: string): Promise<Conversation[]> {
    await this.ensureInitialized();
    
    const collection = this.data!.collections[collectionId];
    if (!collection) return [];
    
    return collection.conversations
      .map(conversationId => this.data!.conversations[conversationId])
      .filter(Boolean);
  }
  
  async getConversationsByAIAgentId(aiAgentId: string): Promise<Conversation[]> {
    await this.ensureInitialized();
    
    return Object.values(this.data!.conversations)
      .filter(conversation => conversation.aiAgentId === aiAgentId);
  }
  
  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    await this.ensureInitialized();
    
    return Object.values(this.data!.conversations)
      .filter(conversation => conversation.userId === userId);
  }
  
  async createConversation(data: Omit<Conversation, 'id'>): Promise<Conversation> {
    await this.ensureInitialized();
    
    const id = `c${Object.keys(this.data!.conversations).length + 1}`;
    const newConversation: Conversation = {
      id,
      ...data
    };
    
    this.data!.conversations[id] = newConversation;
    return newConversation;
  }
  
  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation | null> {
    await this.ensureInitialized();
    
    if (!this.data!.conversations[id]) return null;
    
    this.data!.conversations[id] = {
      ...this.data!.conversations[id],
      ...data
    };
    
    return this.data!.conversations[id];
  }
  
  async deleteConversation(id: string): Promise<boolean> {
    await this.ensureInitialized();
    
    if (!this.data!.conversations[id]) return false;
    
    // Remove from collections
    Object.values(this.data!.collections).forEach(collection => {
      const index = collection.conversations.indexOf(id);
      if (index !== -1) {
        collection.conversations.splice(index, 1);
      }
    });
    
    delete this.data!.conversations[id];
    return true;
  }
  
  /* Collection operations */
  
  async getCollectionById(id: string): Promise<Collection | null> {
    await this.ensureInitialized();
    return this.data!.collections[id] || null;
  }
  
  async getCollections(ids?: string[]): Promise<Record<string, Collection>> {
    await this.ensureInitialized();
    
    if (!ids) {
      return { ...this.data!.collections };
    }
    
    const result: Record<string, Collection> = {};
    for (const id of ids) {
      if (this.data!.collections[id]) {
        result[id] = this.data!.collections[id];
      }
    }
    
    return result;
  }
  
  async getCollectionsByGroupId(groupId: string): Promise<Collection[]> {
    await this.ensureInitialized();
    
    const group = this.data!.groups[groupId];
    if (!group) return [];
    
    return group.collectionIds
      .map(collectionId => this.data!.collections[collectionId])
      .filter(Boolean);
  }
  
  async getCollectionsByCreatorId(creatorId: string): Promise<Collection[]> {
    await this.ensureInitialized();
    
    return Object.values(this.data!.collections)
      .filter(collection => collection.creator === creatorId);
  }
  
  async createCollection(data: Omit<Collection, 'id'>): Promise<Collection> {
    await this.ensureInitialized();
    
    const id = `col${Object.keys(this.data!.collections).length + 1}`;
    
    // Apply filter criteria to get matching conversations
    const matchingConversationIds = await this.filterConversations(data.filterCriteria);
    
    const newCollection: Collection = {
      id,
      ...data,
      conversations: matchingConversationIds
    };
    
    this.data!.collections[id] = newCollection;
    return newCollection;
  }
  
  async updateCollection(id: string, data: Partial<Collection>): Promise<Collection | null> {
    await this.ensureInitialized();
    
    if (!this.data!.collections[id]) return null;
    
    // If filter criteria changed, recalculate matching conversations
    if (data.filterCriteria) {
      const matchingConversationIds = await this.filterConversations(data.filterCriteria);
      data.conversations = matchingConversationIds;
    }
    
    this.data!.collections[id] = {
      ...this.data!.collections[id],
      ...data
    };
    
    return this.data!.collections[id];
  }
  
  async deleteCollection(id: string): Promise<boolean> {
    await this.ensureInitialized();
    
    if (!this.data!.collections[id]) return false;
    
    // Remove from groups
    Object.values(this.data!.groups).forEach(group => {
      const index = group.collectionIds.indexOf(id);
      if (index !== -1) {
        group.collectionIds.splice(index, 1);
      }
    });
    
    delete this.data!.collections[id];
    return true;
  }
  
  /* Group operations */
  
  async getGroupById(id: string): Promise<Group | null> {
    await this.ensureInitialized();
    return this.data!.groups[id] || null;
  }
  
  async getGroups(ids?: string[]): Promise<Record<string, Group>> {
    await this.ensureInitialized();
    
    if (!ids) {
      return { ...this.data!.groups };
    }
    
    const result: Record<string, Group> = {};
    for (const id of ids) {
      if (this.data!.groups[id]) {
        result[id] = this.data!.groups[id];
      }
    }
    
    return result;
  }
  
  async getGroupsByAdminUserId(userId: string): Promise<Group[]> {
    await this.ensureInitialized();
    
    return Object.values(this.data!.groups)
      .filter(group => group.adminUsers.includes(userId));
  }
  
  async createGroup(data: Omit<Group, 'id'>): Promise<Group> {
    await this.ensureInitialized();
    
    const id = `g${Object.keys(this.data!.groups).length + 1}`;
    const newGroup: Group = {
      id,
      ...data
    };
    
    this.data!.groups[id] = newGroup;
    return newGroup;
  }
  
  async updateGroup(id: string, data: Partial<Group>): Promise<Group | null> {
    await this.ensureInitialized();
    
    if (!this.data!.groups[id]) return null;
    
    this.data!.groups[id] = {
      ...this.data!.groups[id],
      ...data
    };
    
    return this.data!.groups[id];
  }
  
  async deleteGroup(id: string): Promise<boolean> {
    await this.ensureInitialized();
    
    if (!this.data!.groups[id]) return false;
    
    delete this.data!.groups[id];
    return true;
  }
  
  /* AI Agent operations */
  
  async getAIAgentById(id: string): Promise<AIAgent | null> {
    await this.ensureInitialized();
    return this.data!.aiAgents[id] || null;
  }
  
  async getAIAgents(ids?: string[]): Promise<Record<string, AIAgent>> {
    await this.ensureInitialized();
    
    if (!ids) {
      return { ...this.data!.aiAgents };
    }
    
    const result: Record<string, AIAgent> = {};
    for (const id of ids) {
      if (this.data!.aiAgents[id]) {
        result[id] = this.data!.aiAgents[id];
      }
    }
    
    return result;
  }
  
  async getAIAgentsByStatus(status: 'active' | 'inactive' | 'training'): Promise<AIAgent[]> {
    await this.ensureInitialized();
    
    return Object.values(this.data!.aiAgents)
      .filter(agent => agent.status === status);
  }
  
  async createAIAgent(data: Omit<AIAgent, 'id'>): Promise<AIAgent> {
    await this.ensureInitialized();
    
    const id = `ai${Object.keys(this.data!.aiAgents).length + 1}`;
    const newAIAgent: AIAgent = {
      id,
      ...data
    };
    
    this.data!.aiAgents[id] = newAIAgent;
    return newAIAgent;
  }
  
  async updateAIAgent(id: string, data: Partial<AIAgent>): Promise<AIAgent | null> {
    await this.ensureInitialized();
    
    if (!this.data!.aiAgents[id]) return null;
    
    this.data!.aiAgents[id] = {
      ...this.data!.aiAgents[id],
      ...data
    };
    
    return this.data!.aiAgents[id];
  }
  
  async deleteAIAgent(id: string): Promise<boolean> {
    await this.ensureInitialized();
    
    if (!this.data!.aiAgents[id]) return false;
    
    delete this.data!.aiAgents[id];
    return true;
  }
  
  /* User operations */
  
  async getUserById(id: string): Promise<User | null> {
    await this.ensureInitialized();
    return this.data!.users[id] || null;
  }
  
  async getUsers(ids?: string[]): Promise<Record<string, User>> {
    await this.ensureInitialized();
    
    if (!ids) {
      return { ...this.data!.users };
    }
    
    const result: Record<string, User> = {};
    for (const id of ids) {
      if (this.data!.users[id]) {
        result[id] = this.data!.users[id];
      }
    }
    
    return result;
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    await this.ensureInitialized();
    
    return Object.values(this.data!.users)
      .filter(user => user.role === role);
  }
  
  async createUser(data: Omit<User, 'id'>): Promise<User> {
    await this.ensureInitialized();
    
    const id = `u${Object.keys(this.data!.users).length + 1}`;
    const newUser: User = {
      id,
      ...data
    };
    
    this.data!.users[id] = newUser;
    return newUser;
  }
  
  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    await this.ensureInitialized();
    
    if (!this.data!.users[id]) return null;
    
    this.data!.users[id] = {
      ...this.data!.users[id],
      ...data
    };
    
    return this.data!.users[id];
  }
  
  async deleteUser(id: string): Promise<boolean> {
    await this.ensureInitialized();
    
    if (!this.data!.users[id]) return false;
    
    delete this.data!.users[id];
    return true;
  }
  
  async getCurrentUser(): Promise<User | null> {
    await this.ensureInitialized();
    return this.data!.users['admin1'] || null;
  }
  
  /* Query operations */
  
  async filterConversations(filterCriteria: any): Promise<string[]> {
    await this.ensureInitialized();
    
    // Use existing filter utility
    return filterConversationsByCollectionCriteria(this.data!.conversations, filterCriteria);
  }
  
  /* Data maintenance operations */
  
  async saveData(): Promise<void> {
    // In a real application, this would persist data to storage
    console.log('Saving data to persistent storage (mock)');
  }
  
  async clearCache(): Promise<void> {
    this.data = null;
    this.initialized = false;
  }
}