// Data model types based on the description.md

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  senderName: string;
}

export interface Conversation {
  thread_id: string;
  userId: string;
  userName: string;
  aiAgentId: string;
  aiAgentName: string;
  aiAgentType: string;
  status: 'active' | 'closed';
  conclusion: 'successful' | 'unsuccessful' | 'uncertain'; // Default is 'uncertain'
  created_at: string;
  updated_at?: string;
  messages: string[]; // Message IDs
  tags: string[];
  resolutionNotes?: string;
  duration: string;
  messageCount: number;
  confidence: string;

  // Virtual properties - these are not actually stored but computed on demand
  conversationTimestamp?: string; // Will be set to the timestamp of the first message

  // Methods
  getOrderedMessages?: () => Message[]; // Returns all messages in chronological order
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  filterCriteria: {
    aiAgentBased?: string[];
    timeBased?: {
      startDate?: string;
      endDate?: string;
      period?: string;
    };
    outcomeBased?: 'successful' | 'unsuccessful' | 'uncertain' | 'all';
    multiFactorFilters?: any[];
  };
  createdAt: string;
  updatedAt?: string;
  creator: string;
  ownerId: string;
  accessPermissions: string[];
  metadata: Record<string, any>;
  conversations: string[]; // Conversation thread_ids
  isPublic: boolean;
  tags: string[];

  // Methods
  getConversations?: () => Conversation[]; // Returns conversations based on filter criteria
  refreshConversations?: () => void; // Re-evaluates all conversations against filter criteria
}

export interface Group {
  id: string;
  name: string;
  description: string;
  purpose: 'evaluation' | 'security' | 'efficiency';
  collectionIds: string[];
  adminIds: string[];
  userIds: string[];
  permissionLevels: Record<string, string>;
  createdAt: string;
  updatedAt?: string;
  metadata: Record<string, any>;
  isPrivate: boolean;
}

export interface AIAgent {
  id: string;
  name: string;
  model: string;
  status: 'active' | 'inactive' | 'training';
  conversationsProcessed: number;
  successRate: string;
  avgResponseTime: string;
  lastActive: string;
  capabilities?: string[];
  specializations?: string[];
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'supervisor' | 'executive';
  permissions: string[];
  createdAt: string;
  lastActive: string;
  isActive: boolean;
}