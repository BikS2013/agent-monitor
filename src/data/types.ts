// Data model types based on the description.md

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'ai';
  senderName: string;
  messageType: 'text' | 'attachment' | 'system';
  readStatus: boolean;
  metadata: {
    tags: string[];
    priority: 'low' | 'medium' | 'high';
    confidence?: string;
  };
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  aiAgentId: string;
  aiAgentName: string;
  aiAgentType: string;
  status: 'active' | 'closed';
  conclusion: 'successful' | 'unsuccessful' | 'pending';
  startTimestamp: string;
  endTimestamp?: string;
  messages: string[]; // Message IDs
  tags: string[];
  resolutionNotes?: string;
  priority: 'low' | 'medium' | 'high';
  duration: string;
  messageCount: number;
  confidence: string;
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
    outcomeBased?: 'successful' | 'unsuccessful' | 'all';
    multiFactorFilters?: any[];
  };
  creationTimestamp: string;
  creator: string;
  accessPermissions: string[];
  metadata: Record<string, any>;
  conversations: string[]; // Conversation IDs
}

export interface Group {
  id: string;
  name: string;
  description: string;
  purpose: 'evaluation' | 'security' | 'efficiency';
  collectionIds: string[];
  adminUsers: string[];
  permissionLevels: Record<string, string>;
  analyticsData?: any;
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
  role: 'admin' | 'supervisor' | 'executive';
  permissions: string[];
}
