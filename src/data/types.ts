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

// Filter element for collections
export interface FilterElement {
  aiAgentIds?: string[] | null;
  timeRange?: {
    startDate?: string | null;
    endDate?: string | null;
    period?: string | null;
  } | null;
  outcome?: 'successful' | 'unsuccessful' | 'uncertain' | 'all' | null;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  filter: FilterElement[]; // Collection will include conversations that meet any of the filter elements
  createdAt: string;
  updatedAt?: string;
  creator: string;
  ownerId: string;
  accessPermissions: string[];
  metadata: Record<string, any>;
  conversations?: string[]; // Array of conversation threadIds (optional, used client-side)
  conversationIds?: string[]; // Alternative field name for conversation IDs
  isPublic: boolean;
  tags: string[];
  
  // Legacy field support
  filterCriteria?: {
    aiAgentBased?: string[];
    timeBased?: {
      startDate?: string;
      endDate?: string;
      period?: string;
    };
    outcomeBased?: 'successful' | 'unsuccessful' | 'uncertain' | 'all';
    multiFactorFilters?: any[];
  };

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