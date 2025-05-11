/**
 * Dynamic Data Source implementation
 * Generates data on-the-fly instead of reading from static JSON files
 */
import { IDataSource } from './IDataSource';
import { Message, Conversation, Collection, Group, AIAgent, User } from '../types';
import { faker } from '@faker-js/faker';

export interface DynamicDataConfig {
  messageCount?: number;
  conversationCount?: number;
  collectionCount?: number;
  groupCount?: number;
  aiAgentCount?: number;
  userCount?: number;
}

export class DynamicDataSource implements IDataSource {
  private messages: Record<string, Message> = {};
  private conversations: Record<string, Conversation> = {};
  private collections: Record<string, Collection> = {};
  private groups: Record<string, Group> = {};
  private aiAgents: Record<string, AIAgent> = {};
  private users: Record<string, User> = {};
  private initialized: boolean = false;
  private config: DynamicDataConfig;

  constructor(config: DynamicDataConfig = {}) {
    this.config = {
      messageCount: config.messageCount || 500,
      conversationCount: config.conversationCount || 100,
      collectionCount: config.collectionCount || 10,
      groupCount: config.groupCount || 5,
      aiAgentCount: config.aiAgentCount || 5,
      userCount: config.userCount || 5
    };
  }

  /**
   * Initialize the data source
   * This is required by the IDataSource interface
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('Initializing DynamicDataSource with config:', this.config);
    
    // Seed faker for consistent results
    faker.seed(123);
    
    // Generate data in the right order
    this.generateUsers();
    this.generateAIAgents();
    this.generateMessages();
    this.generateConversations();
    this.generateCollections();
    this.generateGroups();
    
    this.initialized = true;
    
    console.log('Dynamic data generation complete. Statistics:', {
      messagesCount: Object.keys(this.messages).length,
      conversationsCount: Object.keys(this.conversations).length,
      collectionsCount: Object.keys(this.collections).length,
      groupsCount: Object.keys(this.groups).length,
      aiAgentsCount: Object.keys(this.aiAgents).length,
      usersCount: Object.keys(this.users).length
    });
  }

  private generateUsers(): void {
    // Create admin user
    this.users['admin1'] = {
      id: 'admin1',
      name: 'Admin User',
      role: 'admin',
      permissions: ['full-access', 'manage-agents', 'manage-users']
    };

    // Create supervisor users
    for (let i = 1; i <= Math.floor(this.config.userCount! * 0.5); i++) {
      const id = `super${i}`;
      this.users[id] = {
        id,
        name: faker.person.fullName(),
        role: 'supervisor',
        permissions: ['view-conversations', 'manage-collections']
      };
    }

    // Create executive users
    for (let i = 1; i <= Math.floor(this.config.userCount! * 0.3); i++) {
      const id = `exec${i}`;
      this.users[id] = {
        id,
        name: faker.person.fullName(),
        role: 'executive',
        permissions: ['view-analytics', 'view-reports']
      };
    }
  }

  private generateAIAgents(): void {
    const aiAgentNames = [
      'Claude', 'GPT-4', 'Llama', 'Falcon', 'Gemini',
      'Bard', 'Mistral', 'Sage', 'Nexus', 'Athena'
    ];
    
    const aiAgentModels = [
      'Claude-3.5-Sonnet', 'GPT-4-Turbo', 'Llama-3-70B', 'Falcon-180B', 'Gemini-Pro',
      'PaLM-2', 'Mistral-8x7B', 'Sage-20B', 'Nexus-13B', 'Athena-65B'
    ];

    for (let i = 1; i <= this.config.aiAgentCount!; i++) {
      const id = `ai${i}`;
      const nameIndex = (i - 1) % aiAgentNames.length;
      const status = Math.random() > 0.2 ?
        'active' :
        (Math.random() > 0.5 ? 'inactive' : 'training');
      
      const conversations = Math.floor(Math.random() * 500) + 50;
      const successRate = Math.floor(Math.random() * 30) + 70; // 70-99%
      
      this.aiAgents[id] = {
        id,
        name: aiAgentNames[nameIndex],
        model: aiAgentModels[nameIndex],
        status,
        conversationsProcessed: conversations,
        successRate: `${successRate}%`,
        avgResponseTime: `${Math.floor(Math.random() * 25) + 5}m`,
        lastActive: faker.date.recent().toISOString(),
        capabilities: [
          'natural language',
          'conversation',
          'knowledge retrieval',
          'problem solving',
          'personalization'
        ].slice(0, Math.floor(Math.random() * 3) + 2),
        specializations: [
          'customer support',
          'technical support',
          'sales',
          'booking',
          'feedback'
        ].slice(0, Math.floor(Math.random() * 2) + 1)
      };
    }
  }

  private generateMessages(): void {
    const supportTopics = [
      'account access', 'billing issue', 'product feature',
      'technical problem', 'how to', 'subscription change',
      'refund request', 'service outage', 'payment method',
      'password reset', 'account upgrade', 'product compatibility'
    ];

    for (let i = 1; i <= this.config.messageCount!; i++) {
      const id = `m${i}`;
      const sender = Math.random() > 0.5 ? 'user' : 'ai';
      const senderName = sender === 'user' 
        ? faker.person.fullName() 
        : Object.values(this.aiAgents)[Math.floor(Math.random() * Object.keys(this.aiAgents).length)].name;
      
      this.messages[id] = {
        id,
        content: faker.lorem.paragraph(),
        sender,
        senderName
      };
    }
  }

  private generateConversations(): void {
    const userIds = Object.keys(this.users);
    const aiAgentIds = Object.keys(this.aiAgents);
    const messageIds = Object.keys(this.messages);
    const supportTopics = [
      'account access', 'billing issue', 'product feature',
      'technical problem', 'how to', 'subscription change',
      'refund request', 'service outage', 'payment method',
      'password reset', 'account upgrade', 'product compatibility'
    ];

    for (let i = 1; i <= this.config.conversationCount!; i++) {
      const thread_id = `c${i}`;
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const aiAgentId = aiAgentIds[Math.floor(Math.random() * aiAgentIds.length)];
      const status = Math.random() > 0.3 ? 'active' : 'closed';
      const conclusion = status === 'closed'
        ? (Math.random() > 0.2 ? 'successful' : 'unsuccessful')
        : 'pending';
      
      // Generate random message ids for this conversation
      const msgCount = Math.floor(Math.random() * 10) + 2; // At least 2 messages
      const shuffledMessageIds = [...messageIds].sort(() => 0.5 - Math.random());
      const conversationMessageIds = shuffledMessageIds.slice(0, msgCount);
      
      // Generate random tags for conversation
      const tagCount = Math.floor(Math.random() * 3) + 1;
      const tags = [];
      for (let j = 0; j < tagCount; j++) {
        tags.push(supportTopics[Math.floor(Math.random() * supportTopics.length)]);
      }
      
      if (conclusion === 'successful') {
        tags.push('resolved');
      } else if (conclusion === 'unsuccessful') {
        tags.push('unresolved');
      }
      
      // Random priority
      const priority = Math.random() < 0.7 ? 
        'medium' : 
        (Math.random() < 0.5 ? 'low' : 'high');
      
      // Create the conversation
      this.conversations[thread_id] = {
        thread_id,
        userId,
        userName: this.users[userId].name,
        aiAgentId,
        aiAgentName: this.aiAgents[aiAgentId].name,
        aiAgentType: this.aiAgents[aiAgentId].model,
        status,
        conclusion,
        created_at: faker.date.recent({ days: 30 }).toISOString(),
        updated_at: status === 'closed' ? faker.date.recent({ days: 15 }).toISOString() : undefined,
        messages: conversationMessageIds,
        tags,
        resolutionNotes: conclusion === 'successful' ?
          'Issue resolved to customer satisfaction.' :
          (conclusion === 'unsuccessful' ? 'Customer issue could not be resolved.' : undefined),
        priority,
        duration: `${Math.floor(Math.random() * 30) + 5}m`,
        messageCount: conversationMessageIds.length,
        confidence: `${Math.floor(Math.random() * 30) + 70}%`
      };
    }
  }

  private generateCollections(): void {
    const conversationIds = Object.keys(this.conversations);
    const userIds = Object.keys(this.users);
    
    const collectionTemplates = [
      { name: "AI Performance Evaluation", description: "Monitoring AI agent performance metrics" },
      { name: "Customer Support Issues", description: "Tracking customer support interactions" },
      { name: "Technical Problems", description: "Analyzing technical support conversations" },
      { name: "High Priority Cases", description: "Monitoring high priority customer interactions" },
      { name: "Billing Inquiries", description: "Conversations related to billing and payments" },
      { name: "Account Management", description: "User account related conversations" },
      { name: "Product Feature Questions", description: "Queries about product features and usage" },
      { name: "Unresolved Issues", description: "Tracking conversations with unresolved outcomes" },
      { name: "Successful Resolutions", description: "Collection of successfully resolved cases" },
      { name: "Long Conversations", description: "Analyzing lengthy customer interactions" }
    ];

    for (let i = 1; i <= this.config.collectionCount!; i++) {
      const id = `col${i}`;
      const templateIndex = (i - 1) % collectionTemplates.length;
      const template = collectionTemplates[templateIndex];
      
      // Assign a random user as creator
      const creatorId = userIds[Math.floor(Math.random() * userIds.length)];
      
      // Assign a subset of conversations to this collection
      const collectionConvCount = Math.min(
        conversationIds.length, 
        Math.floor(Math.random() * 30) + 5
      );
      const collectionConversations = conversationIds
        .sort(() => 0.5 - Math.random())
        .slice(0, collectionConvCount);
      
      // Generate access permissions (always include creator)
      const accessPermissions = [creatorId];
      
      // Add 1-3 random additional users
      const otherUsers = userIds.filter(id => id !== creatorId);
      const additionalCount = Math.min(otherUsers.length, Math.floor(Math.random() * 3) + 1);
      const additionalUserIds = otherUsers
        .sort(() => 0.5 - Math.random())
        .slice(0, additionalCount);
      
      accessPermissions.push(...additionalUserIds);
      
      // Create the collection
      this.collections[id] = {
        id,
        name: template.name,
        description: template.description,
        filterCriteria: {
          aiAgentBased: templateIndex % 3 === 0 ? 
            [Object.keys(this.aiAgents)[0]] : undefined,
          timeBased: templateIndex % 3 === 1 ? {
            period: 'month'
          } : undefined,
          outcomeBased: templateIndex % 3 === 2 ? 
            'successful' : undefined
        },
        creationTimestamp: faker.date.recent({ days: 60 }).toISOString(),
        creator: creatorId,
        accessPermissions,
        metadata: {
          totalConversations: collectionConversations.length,
          avgDuration: `${Math.round(Math.random() * 20) + 5}m`
        },
        conversations: collectionConversations
      };
    }
  }

  private generateGroups(): void {
    const collectionIds = Object.keys(this.collections);
    const userIds = Object.keys(this.users);
    
    const groupTemplates = [
      { name: "Customer Support Team", description: "Customer service agent evaluation group", purpose: "evaluation" },
      { name: "Technical Support Analysis", description: "Technical support performance monitoring", purpose: "evaluation" },
      { name: "AI Performance Review", description: "AI agent performance evaluation group", purpose: "evaluation" },
      { name: "Critical Issues Team", description: "Management of high priority cases", purpose: "security" },
      { name: "Efficiency Improvement", description: "Analyzing conversation efficiency metrics", purpose: "efficiency" }
    ];

    for (let i = 1; i <= this.config.groupCount!; i++) {
      const id = `g${i}`;
      const templateIndex = (i - 1) % groupTemplates.length;
      const template = groupTemplates[templateIndex];
      
      // Select admin users (1-3)
      const adminCount = Math.min(userIds.length, Math.floor(Math.random() * 3) + 1);
      const adminUsers = userIds
        .sort(() => 0.5 - Math.random())
        .slice(0, adminCount);
      
      // Select collections for this group (2-5)
      const collectionCount = Math.min(
        collectionIds.length,
        Math.floor(Math.random() * 4) + 2
      );
      const groupCollections = collectionIds
        .sort(() => 0.5 - Math.random())
        .slice(0, collectionCount);
      
      // Generate permission levels
      const permissionLevels: Record<string, string> = {};
      
      // Admin users
      adminUsers.forEach(userId => {
        permissionLevels[userId] = this.users[userId].role === 'admin' ? 
          'admin' : 'edit';
      });
      
      // Some view-only permissions
      const viewerCount = Math.min(
        userIds.length - adminCount,
        Math.floor(Math.random() * 3)
      );
      const viewers = userIds
        .filter(id => !adminUsers.includes(id))
        .sort(() => 0.5 - Math.random())
        .slice(0, viewerCount);
      
      viewers.forEach(userId => {
        permissionLevels[userId] = 'view';
      });
      
      // Create the group
      this.groups[id] = {
        id,
        name: template.name,
        description: template.description,
        purpose: template.purpose as 'evaluation' | 'security' | 'efficiency',
        collectionIds: groupCollections,
        adminUsers,
        permissionLevels,
        analyticsData: {
          totalConversations: Math.floor(Math.random() * 200) + 50,
          avgResponseTime: `${Math.floor(Math.random() * 10) + 5}m`,
          successRate: `${Math.floor(Math.random() * 20) + 75}%`
        }
      };
    }
  }

  // Message operations
  async getMessageById(id: string): Promise<Message | null> {
    await this.initialize();
    return this.messages[id] || null;
  }

  async getMessages(ids?: string[]): Promise<Record<string, Message>> {
    await this.initialize();

    if (!ids) {
      return { ...this.messages };
    }

    const result: Record<string, Message> = {};
    for (const id of ids) {
      if (this.messages[id]) {
        result[id] = this.messages[id];
      }
    }

    return result;
  }

  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    await this.initialize();

    // First try direct access by key
    let conversation = this.conversations[conversationId];

    // If that fails, look for a conversation with matching thread_id
    if (!conversation) {
      conversation = Object.values(this.conversations).find(conv => conv.thread_id === conversationId) || null;
    }

    if (!conversation) return [];

    return conversation.messages
      .map(msgId => this.messages[msgId])
      .filter(Boolean) as Message[];
  }

  async createMessage(data: Omit<Message, 'id'>): Promise<Message> {
    await this.initialize();
    const id = `m${Object.keys(this.messages).length + 1}`;
    const newMessage: Message = {
      id,
      ...data
    };

    this.messages[id] = newMessage;
    return newMessage;
  }

  async updateMessage(id: string, data: Partial<Message>): Promise<Message | null> {
    await this.initialize();
    if (!this.messages[id]) return null;

    this.messages[id] = {
      ...this.messages[id],
      ...data
    };

    return this.messages[id];
  }

  async deleteMessage(id: string): Promise<boolean> {
    await this.initialize();
    if (!this.messages[id]) return false;

    delete this.messages[id];
    return true;
  }

  // Conversation operations
  async getConversationById(id: string): Promise<Conversation | null> {
    await this.initialize();

    // First try direct access by key
    if (this.conversations[id]) {
      return this.conversations[id];
    }

    // If that fails, look for a conversation with matching thread_id
    return Object.values(this.conversations).find(conv => conv.thread_id === id) || null;
  }

  async getConversations(ids?: string[]): Promise<Record<string, Conversation>> {
    await this.initialize();

    if (!ids) {
      return { ...this.conversations };
    }

    const result: Record<string, Conversation> = {};
    for (const id of ids) {
      // First try direct access by key
      if (this.conversations[id]) {
        result[id] = this.conversations[id];
      } else {
        // If that fails, look for a conversation with matching thread_id
        const conversation = Object.values(this.conversations).find(conv => conv.thread_id === id);
        if (conversation) {
          result[id] = conversation;
        }
      }
    }

    return result;
  }

  async getConversationsByCollectionId(collectionId: string): Promise<Conversation[]> {
    await this.initialize();
    const collection = this.collections[collectionId];
    if (!collection) return [];

    return collection.conversations
      .map(convId => {
        // First try direct access by key
        if (this.conversations[convId]) {
          return this.conversations[convId];
        }
        // If that fails, look for a conversation with matching thread_id
        return Object.values(this.conversations).find(conv => conv.thread_id === convId);
      })
      .filter(Boolean) as Conversation[];
  }

  async getConversationsByAIAgentId(aiAgentId: string): Promise<Conversation[]> {
    await this.initialize();
    return Object.values(this.conversations)
      .filter(conv => conv.aiAgentId === aiAgentId);
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    await this.initialize();
    return Object.values(this.conversations)
      .filter(conv => conv.userId === userId);
  }

  async createConversation(data: Omit<Conversation, 'thread_id'>): Promise<Conversation> {
    await this.initialize();
    const thread_id = `c${Object.keys(this.conversations).length + 1}`;
    const newConversation: Conversation = {
      thread_id,
      ...data
    };

    this.conversations[thread_id] = newConversation;
    return newConversation;
  }

  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation | null> {
    await this.initialize();

    // First try direct access by key
    if (this.conversations[id]) {
      this.conversations[id] = {
        ...this.conversations[id],
        ...data
      };
      return this.conversations[id];
    }

    // If that fails, look for a conversation with matching thread_id
    const storeKey = Object.keys(this.conversations).find(
      key => this.conversations[key].thread_id === id
    );

    if (!storeKey) return null;

    this.conversations[storeKey] = {
      ...this.conversations[storeKey],
      ...data
    };

    return this.conversations[storeKey];
  }

  async deleteConversation(id: string): Promise<boolean> {
    await this.initialize();

    // First try direct access by key
    if (this.conversations[id]) {
      delete this.conversations[id];
      return true;
    }

    // If that fails, look for a conversation with matching thread_id
    const storeKey = Object.keys(this.conversations).find(
      key => this.conversations[key].thread_id === id
    );

    if (!storeKey) return false;

    delete this.conversations[storeKey];
    return true;
  }

  // Collection operations
  async getCollectionById(id: string): Promise<Collection | null> {
    await this.initialize();
    return this.collections[id] || null;
  }

  async getCollections(ids?: string[]): Promise<Record<string, Collection>> {
    await this.initialize();

    if (!ids) {
      return { ...this.collections };
    }

    const result: Record<string, Collection> = {};
    for (const id of ids) {
      if (this.collections[id]) {
        result[id] = this.collections[id];
      }
    }

    return result;
  }

  async getCollectionsByGroupId(groupId: string): Promise<Collection[]> {
    await this.initialize();
    const group = this.groups[groupId];
    if (!group) return [];

    return group.collectionIds
      .map(colId => this.collections[colId])
      .filter(Boolean) as Collection[];
  }

  async getCollectionsByCreatorId(creatorId: string): Promise<Collection[]> {
    await this.initialize();
    return Object.values(this.collections)
      .filter(collection => collection.creator === creatorId);
  }

  async createCollection(data: Omit<Collection, 'id'>): Promise<Collection> {
    await this.initialize();
    const id = `col${Object.keys(this.collections).length + 1}`;
    const newCollection: Collection = {
      id,
      ...data
    };

    this.collections[id] = newCollection;
    return newCollection;
  }

  async updateCollection(id: string, data: Partial<Collection>): Promise<Collection | null> {
    await this.initialize();
    if (!this.collections[id]) return null;

    this.collections[id] = {
      ...this.collections[id],
      ...data
    };

    return this.collections[id];
  }

  async deleteCollection(id: string): Promise<boolean> {
    await this.initialize();
    if (!this.collections[id]) return false;

    delete this.collections[id];
    return true;
  }

  // Group operations
  async getGroupById(id: string): Promise<Group | null> {
    await this.initialize();
    return this.groups[id] || null;
  }

  async getGroups(ids?: string[]): Promise<Record<string, Group>> {
    await this.initialize();

    if (!ids) {
      return { ...this.groups };
    }

    const result: Record<string, Group> = {};
    for (const id of ids) {
      if (this.groups[id]) {
        result[id] = this.groups[id];
      }
    }

    return result;
  }

  async getGroupsByAdminUserId(userId: string): Promise<Group[]> {
    await this.initialize();
    return Object.values(this.groups)
      .filter(group => group.adminUsers.includes(userId));
  }

  async createGroup(data: Omit<Group, 'id'>): Promise<Group> {
    await this.initialize();
    const id = `g${Object.keys(this.groups).length + 1}`;
    const newGroup: Group = {
      id,
      ...data
    };

    this.groups[id] = newGroup;
    return newGroup;
  }

  async updateGroup(id: string, data: Partial<Group>): Promise<Group | null> {
    await this.initialize();
    if (!this.groups[id]) return null;

    this.groups[id] = {
      ...this.groups[id],
      ...data
    };

    return this.groups[id];
  }

  async deleteGroup(id: string): Promise<boolean> {
    await this.initialize();
    if (!this.groups[id]) return false;

    delete this.groups[id];
    return true;
  }

  // AI Agent operations
  async getAIAgentById(id: string): Promise<AIAgent | null> {
    await this.initialize();
    return this.aiAgents[id] || null;
  }

  async getAIAgents(ids?: string[]): Promise<Record<string, AIAgent>> {
    await this.initialize();

    if (!ids) {
      return { ...this.aiAgents };
    }

    const result: Record<string, AIAgent> = {};
    for (const id of ids) {
      if (this.aiAgents[id]) {
        result[id] = this.aiAgents[id];
      }
    }

    return result;
  }

  async getAIAgentsByStatus(status: 'active' | 'inactive' | 'training'): Promise<AIAgent[]> {
    await this.initialize();
    return Object.values(this.aiAgents)
      .filter(agent => agent.status === status);
  }

  async createAIAgent(data: Omit<AIAgent, 'id'>): Promise<AIAgent> {
    await this.initialize();
    const id = `ai${Object.keys(this.aiAgents).length + 1}`;
    const newAIAgent: AIAgent = {
      id,
      ...data
    };

    this.aiAgents[id] = newAIAgent;
    return newAIAgent;
  }

  async updateAIAgent(id: string, data: Partial<AIAgent>): Promise<AIAgent | null> {
    await this.initialize();
    if (!this.aiAgents[id]) return null;

    this.aiAgents[id] = {
      ...this.aiAgents[id],
      ...data
    };

    return this.aiAgents[id];
  }

  async deleteAIAgent(id: string): Promise<boolean> {
    await this.initialize();
    if (!this.aiAgents[id]) return false;

    delete this.aiAgents[id];
    return true;
  }

  // User operations
  async getUserById(id: string): Promise<User | null> {
    await this.initialize();
    return this.users[id] || null;
  }

  async getUsers(ids?: string[]): Promise<Record<string, User>> {
    await this.initialize();

    if (!ids) {
      return { ...this.users };
    }

    const result: Record<string, User> = {};
    for (const id of ids) {
      if (this.users[id]) {
        result[id] = this.users[id];
      }
    }

    return result;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    await this.initialize();
    return Object.values(this.users)
      .filter(user => user.role === role);
  }

  async createUser(data: Omit<User, 'id'>): Promise<User> {
    await this.initialize();
    const id = `u${Object.keys(this.users).length + 1}`;
    const newUser: User = {
      id,
      ...data
    };

    this.users[id] = newUser;
    return newUser;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    await this.initialize();
    if (!this.users[id]) return null;

    this.users[id] = {
      ...this.users[id],
      ...data
    };

    return this.users[id];
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.initialize();
    if (!this.users[id]) return false;

    delete this.users[id];
    return true;
  }

  async getCurrentUser(): Promise<User | null> {
    await this.initialize();
    // Return the first admin user as the current user
    const adminUsers = Object.values(this.users)
      .filter(user => user.role === 'admin');

    return adminUsers.length > 0 ? adminUsers[0] : null;
  }

  async filterConversations(filterCriteria: any): Promise<string[]> {
    await this.initialize();
    // Simple implementation - in a real app this would be more sophisticated
    return Object.keys(this.conversations);
  }

  async saveData(): Promise<void> {
    // In a real app, this would save data to persistent storage
    console.log('Saving data to persistent storage (mock)');
  }

  async clearCache(): Promise<void> {
    this.messages = {};
    this.conversations = {};
    this.collections = {};
    this.groups = {};
    this.aiAgents = {};
    this.users = {};
    this.initialized = false;
  }
}