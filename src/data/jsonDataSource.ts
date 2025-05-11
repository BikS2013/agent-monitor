/**
 * JSON Data Source implementation
 * Can load data from a static JSON file instead of using in-memory sample data
 * Supports different dataset sizes: small, medium, and large
 */
import { IDataSource } from './sources/IDataSource';
import { Message, Conversation, Collection, Group, AIAgent, User } from './types';

export type DataSize = 'small' | 'medium' | 'large';

interface JsonData {
  messages: Record<string, Message>;
  conversations: Record<string, Conversation>;
  collections: Record<string, Collection>;
  groups: Record<string, Group>;
  aiAgents: Record<string, AIAgent>;
  users: Record<string, User>;
}

export class JsonDataSource implements IDataSource {
  private data: JsonData | null = null;
  private dataUrl: string;
  private size: DataSize;
  private loading: boolean = false;
  private loadPromise: Promise<void> | null = null;

  constructor(size: DataSize = 'medium') {
    this.size = size;
    this.dataUrl = `/${size}SampleData.json`;
  }

  /**
   * Initialize the data source
   * This is required by the IDataSource interface
   */
  async initialize(): Promise<void> {
    return this.loadData();
  }

  private async loadData(): Promise<void> {
    if (this.data !== null) return;
    if (this.loadPromise) return this.loadPromise;

    this.loading = true;
    this.loadPromise = new Promise<void>(async (resolve, reject) => {
      try {
        console.log(`Loading data from ${this.dataUrl}...`);
        const response = await fetch(this.dataUrl);
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.statusText}`);
        }
        this.data = await response.json();
        console.log('Data loaded successfully');
        console.log('Data statistics:', {
          messagesCount: Object.keys(this.data?.messages || {}).length,
          conversationsCount: Object.keys(this.data?.conversations || {}).length,
          collectionsCount: Object.keys(this.data?.collections || {}).length,
          groupsCount: Object.keys(this.data?.groups || {}).length,
          aiAgentsCount: Object.keys(this.data?.aiAgents || {}).length,
          usersCount: Object.keys(this.data?.users || {}).length
        });
        this.loading = false;
        resolve();
      } catch (error) {
        console.error('Error loading data:', error);
        this.loading = false;
        reject(error);
      }
    });

    return this.loadPromise;
  }

  // Messages
  async getMessageById(id: string): Promise<Message | null> {
    await this.loadData();
    return this.data?.messages[id] || null;
  }

  async getMessages(ids?: string[]): Promise<Record<string, Message>> {
    await this.loadData();

    if (!ids) {
      return { ...(this.data?.messages || {}) };
    }

    const result: Record<string, Message> = {};
    for (const id of ids) {
      if (this.data?.messages[id]) {
        result[id] = this.data.messages[id];
      }
    }

    return result;
  }

  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    await this.loadData();

    // First try direct access by key
    let conversation = null;
    if (this.data?.conversations && this.data.conversations[conversationId]) {
      conversation = this.data.conversations[conversationId];
    } else {
      // If that fails, look for a conversation with matching thread_id
      conversation = Object.values(this.data?.conversations || {}).find(conv => conv.thread_id === conversationId);
    }

    if (!conversation) return [];

    return conversation.messages
      .map(msgId => this.data?.messages[msgId])
      .filter(Boolean) as Message[];
  }

  async createMessage(data: Omit<Message, 'id'>): Promise<Message> {
    await this.loadData();
    const id = `m${Object.keys(this.data?.messages || {}).length + 1}`;
    const newMessage: Message = {
      id,
      ...data
    };

    if (this.data?.messages) {
      this.data.messages[id] = newMessage;
    }

    return newMessage;
  }

  async updateMessage(id: string, data: Partial<Message>): Promise<Message | null> {
    await this.loadData();
    if (!this.data?.messages[id]) return null;

    this.data.messages[id] = {
      ...this.data.messages[id],
      ...data
    };

    return this.data.messages[id];
  }

  async deleteMessage(id: string): Promise<boolean> {
    await this.loadData();
    if (!this.data?.messages[id]) return false;

    if (this.data?.messages) {
      delete this.data.messages[id];
    }

    return true;
  }

  // Conversations
  async getConversationById(id: string): Promise<Conversation | null> {
    await this.loadData();

    // First try to get the conversation directly by key (which might match thread_id)
    if (this.data?.conversations && this.data.conversations[id]) {
      return this.data.conversations[id];
    }

    // If that fails, look through all conversations for one with matching thread_id
    return Object.values(this.data?.conversations || {}).find(conv => conv.thread_id === id) || null;
  }

  async getConversations(ids?: string[]): Promise<Record<string, Conversation>> {
    await this.loadData();

    if (!ids) {
      return { ...(this.data?.conversations || {}) };
    }

    const result: Record<string, Conversation> = {};
    for (const id of ids) {
      // First try direct access by key
      if (this.data?.conversations && this.data.conversations[id]) {
        result[id] = this.data.conversations[id];
      } else {
        // If that fails, look for a conversation with matching thread_id
        const conversation = Object.values(this.data?.conversations || {}).find(conv => conv.thread_id === id);
        if (conversation) {
          result[id] = conversation;
        }
      }
    }

    return result;
  }

  async getConversationsByCollectionId(collectionId: string): Promise<Conversation[]> {
    await this.loadData();
    const collection = this.data?.collections[collectionId];
    if (!collection) return [];

    // First try direct key access, then fallback to thread_id search
    return collection.conversations
      .map(convId => {
        // First try direct access by key
        if (this.data?.conversations && this.data.conversations[convId]) {
          return this.data.conversations[convId];
        }
        // Then try by thread_id
        return Object.values(this.data?.conversations || {}).find(conv => conv.thread_id === convId);
      })
      .filter(Boolean) as Conversation[];
  }

  async getConversationsByAIAgentId(aiAgentId: string): Promise<Conversation[]> {
    await this.loadData();
    return Object.values(this.data?.conversations || {})
      .filter(conv => conv.aiAgentId === aiAgentId);
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    await this.loadData();
    return Object.values(this.data?.conversations || {})
      .filter(conv => conv.userId === userId);
  }

  async createConversation(data: Omit<Conversation, 'thread_id'>): Promise<Conversation> {
    await this.loadData();
    const thread_id = `c${Object.keys(this.data?.conversations || {}).length + 1}`;
    const newConversation: Conversation = {
      thread_id,
      ...data
    };

    if (this.data?.conversations) {
      const conversationId = thread_id; // Use thread_id as the key
      this.data.conversations[conversationId] = newConversation;
    }

    return newConversation;
  }

  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation | null> {
    await this.loadData();

    // First check if the conversation exists with the id as key
    if (this.data?.conversations && this.data.conversations[id]) {
      this.data.conversations[id] = {
        ...this.data.conversations[id],
        ...data
      };
      return this.data.conversations[id];
    }

    // If not, try to find by thread_id
    const conversationEntry = Object.entries(this.data?.conversations || {}).find(
      ([key, conv]) => conv.thread_id === id
    );

    if (!conversationEntry) return null;

    const [storeKey, conversation] = conversationEntry;

    this.data.conversations[storeKey] = {
      ...conversation,
      ...data
    };

    return this.data.conversations[storeKey];
  }

  async deleteConversation(id: string): Promise<boolean> {
    await this.loadData();

    // First check if the conversation exists with the id as key
    if (this.data?.conversations && this.data.conversations[id]) {
      delete this.data.conversations[id];
      return true;
    }

    // If not, try to find by thread_id
    const conversationEntry = Object.entries(this.data?.conversations || {}).find(
      ([key, conv]) => conv.thread_id === id
    );

    if (!conversationEntry) return false;

    const [storeKey] = conversationEntry;

    if (this.data?.conversations) {
      delete this.data.conversations[storeKey];
    }

    return true;
  }

  // Collections
  async getCollectionById(id: string): Promise<Collection | null> {
    await this.loadData();
    return this.data?.collections[id] || null;
  }

  async getCollections(ids?: string[]): Promise<Record<string, Collection>> {
    await this.loadData();

    if (!ids) {
      return { ...(this.data?.collections || {}) };
    }

    const result: Record<string, Collection> = {};
    for (const id of ids) {
      if (this.data?.collections[id]) {
        result[id] = this.data.collections[id];
      }
    }

    return result;
  }

  async getCollectionsByGroupId(groupId: string): Promise<Collection[]> {
    await this.loadData();
    const group = this.data?.groups[groupId];
    if (!group) return [];

    return group.collectionIds
      .map(colId => this.data?.collections[colId])
      .filter(Boolean) as Collection[];
  }

  async getCollectionsByCreatorId(creatorId: string): Promise<Collection[]> {
    await this.loadData();
    return Object.values(this.data?.collections || {})
      .filter(collection => collection.creator === creatorId);
  }

  async createCollection(data: Omit<Collection, 'id'>): Promise<Collection> {
    await this.loadData();
    const id = `col${Object.keys(this.data?.collections || {}).length + 1}`;
    const newCollection: Collection = {
      id,
      ...data
    };

    if (this.data?.collections) {
      this.data.collections[id] = newCollection;
    }

    return newCollection;
  }

  async updateCollection(id: string, data: Partial<Collection>): Promise<Collection | null> {
    await this.loadData();
    if (!this.data?.collections[id]) return null;

    this.data.collections[id] = {
      ...this.data.collections[id],
      ...data
    };

    return this.data.collections[id];
  }

  async deleteCollection(id: string): Promise<boolean> {
    await this.loadData();
    if (!this.data?.collections[id]) return false;

    if (this.data?.collections) {
      delete this.data.collections[id];
    }

    return true;
  }

  // Groups
  async getGroupById(id: string): Promise<Group | null> {
    await this.loadData();
    return this.data?.groups[id] || null;
  }

  async getGroups(ids?: string[]): Promise<Record<string, Group>> {
    await this.loadData();

    if (!ids) {
      return { ...(this.data?.groups || {}) };
    }

    const result: Record<string, Group> = {};
    for (const id of ids) {
      if (this.data?.groups[id]) {
        result[id] = this.data.groups[id];
      }
    }

    return result;
  }

  async getGroupsByAdminUserId(userId: string): Promise<Group[]> {
    await this.loadData();
    return Object.values(this.data?.groups || {})
      .filter(group => group.adminUsers.includes(userId));
  }

  async createGroup(data: Omit<Group, 'id'>): Promise<Group> {
    await this.loadData();
    const id = `g${Object.keys(this.data?.groups || {}).length + 1}`;
    const newGroup: Group = {
      id,
      ...data
    };

    if (this.data?.groups) {
      this.data.groups[id] = newGroup;
    }

    return newGroup;
  }

  async updateGroup(id: string, data: Partial<Group>): Promise<Group | null> {
    await this.loadData();
    if (!this.data?.groups[id]) return null;

    this.data.groups[id] = {
      ...this.data.groups[id],
      ...data
    };

    return this.data.groups[id];
  }

  async deleteGroup(id: string): Promise<boolean> {
    await this.loadData();
    if (!this.data?.groups[id]) return false;

    if (this.data?.groups) {
      delete this.data.groups[id];
    }

    return true;
  }

  // AI Agents
  async getAIAgentById(id: string): Promise<AIAgent | null> {
    await this.loadData();
    return this.data?.aiAgents[id] || null;
  }

  async getAIAgents(ids?: string[]): Promise<Record<string, AIAgent>> {
    await this.loadData();

    if (!ids) {
      return { ...(this.data?.aiAgents || {}) };
    }

    const result: Record<string, AIAgent> = {};
    for (const id of ids) {
      if (this.data?.aiAgents[id]) {
        result[id] = this.data.aiAgents[id];
      }
    }

    return result;
  }

  async getAIAgentsByStatus(status: 'active' | 'inactive' | 'training'): Promise<AIAgent[]> {
    await this.loadData();
    return Object.values(this.data?.aiAgents || {})
      .filter(agent => agent.status === status);
  }

  async createAIAgent(data: Omit<AIAgent, 'id'>): Promise<AIAgent> {
    await this.loadData();
    const id = `ai${Object.keys(this.data?.aiAgents || {}).length + 1}`;
    const newAIAgent: AIAgent = {
      id,
      ...data
    };

    if (this.data?.aiAgents) {
      this.data.aiAgents[id] = newAIAgent;
    }

    return newAIAgent;
  }

  async updateAIAgent(id: string, data: Partial<AIAgent>): Promise<AIAgent | null> {
    await this.loadData();
    if (!this.data?.aiAgents[id]) return null;

    this.data.aiAgents[id] = {
      ...this.data.aiAgents[id],
      ...data
    };

    return this.data.aiAgents[id];
  }

  async deleteAIAgent(id: string): Promise<boolean> {
    await this.loadData();
    if (!this.data?.aiAgents[id]) return false;

    if (this.data?.aiAgents) {
      delete this.data.aiAgents[id];
    }

    return true;
  }

  // Users
  async getUserById(id: string): Promise<User | null> {
    await this.loadData();
    return this.data?.users[id] || null;
  }

  async getUsers(ids?: string[]): Promise<Record<string, User>> {
    await this.loadData();

    if (!ids) {
      return { ...(this.data?.users || {}) };
    }

    const result: Record<string, User> = {};
    for (const id of ids) {
      if (this.data?.users[id]) {
        result[id] = this.data.users[id];
      }
    }

    return result;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    await this.loadData();
    return Object.values(this.data?.users || {})
      .filter(user => user.role === role);
  }

  async createUser(data: Omit<User, 'id'>): Promise<User> {
    await this.loadData();
    const id = `u${Object.keys(this.data?.users || {}).length + 1}`;
    const newUser: User = {
      id,
      ...data
    };

    if (this.data?.users) {
      this.data.users[id] = newUser;
    }

    return newUser;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    await this.loadData();
    if (!this.data?.users[id]) return null;

    this.data.users[id] = {
      ...this.data.users[id],
      ...data
    };

    return this.data.users[id];
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.loadData();
    if (!this.data?.users[id]) return false;

    if (this.data?.users) {
      delete this.data.users[id];
    }

    return true;
  }

  async getCurrentUser(): Promise<User | null> {
    await this.loadData();
    // Return the first admin user as the current user
    const adminUsers = Object.values(this.data?.users || {})
      .filter(user => user.role === 'admin');

    return adminUsers.length > 0 ? adminUsers[0] : null;
  }

  async filterConversations(filterCriteria: any): Promise<string[]> {
    await this.loadData();
    // Simple implementation - in a real app this would be more sophisticated
    return Object.keys(this.data?.conversations || {});
  }

  async saveData(): Promise<void> {
    // In a real app, this would save data to persistent storage
    console.log('Saving data to persistent storage (mock)');
  }

  async clearCache(): Promise<void> {
    this.data = null;
    this.loadPromise = null;
  }
}