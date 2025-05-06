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
  async getMessages(): Promise<Message[]> {
    await this.loadData();
    return Object.values(this.data?.messages || {});
  }

  async getMessage(id: string): Promise<Message | null> {
    await this.loadData();
    return this.data?.messages[id] || null;
  }

  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    await this.loadData();
    const conversation = this.data?.conversations[conversationId];
    if (!conversation) return [];

    return conversation.messages
      .map(msgId => this.data?.messages[msgId])
      .filter(Boolean) as Message[];
  }

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    await this.loadData();
    return Object.values(this.data?.conversations || {});
  }

  async getConversation(id: string): Promise<Conversation | null> {
    await this.loadData();
    return this.data?.conversations[id] || null;
  }

  async getConversationsByCollectionId(collectionId: string): Promise<Conversation[]> {
    await this.loadData();
    const collection = this.data?.collections[collectionId];
    if (!collection) return [];

    return collection.conversations
      .map(convId => this.data?.conversations[convId])
      .filter(Boolean) as Conversation[];
  }

  // Collections
  async getCollections(): Promise<Collection[]> {
    await this.loadData();
    return Object.values(this.data?.collections || {});
  }

  async getCollection(id: string): Promise<Collection | null> {
    await this.loadData();
    return this.data?.collections[id] || null;
  }

  async getCollectionsByGroupId(groupId: string): Promise<Collection[]> {
    await this.loadData();
    const group = this.data?.groups[groupId];
    if (!group) return [];

    return group.collectionIds
      .map(colId => this.data?.collections[colId])
      .filter(Boolean) as Collection[];
  }

  // Groups
  async getGroups(): Promise<Group[]> {
    await this.loadData();
    return Object.values(this.data?.groups || {});
  }

  async getGroup(id: string): Promise<Group | null> {
    await this.loadData();
    return this.data?.groups[id] || null;
  }

  // AI Agents
  async getAIAgents(): Promise<AIAgent[]> {
    await this.loadData();
    return Object.values(this.data?.aiAgents || {});
  }

  async getAIAgent(id: string): Promise<AIAgent | null> {
    await this.loadData();
    return this.data?.aiAgents[id] || null;
  }

  // Users
  async getUsers(): Promise<User[]> {
    await this.loadData();
    return Object.values(this.data?.users || {});
  }

  async getUser(id: string): Promise<User | null> {
    await this.loadData();
    return this.data?.users[id] || null;
  }
}