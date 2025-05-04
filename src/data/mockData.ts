import { Message, Conversation, Collection, Group, AIAgent, User } from './types';

// Mock Messages
export const messages: Record<string, Message> = {
  'm1': {
    id: 'm1',
    content: 'Γεια σας 👋 Είμαι ο AI Βοηθός του Contact Center. Πως μπορώ να σας εξυπηρετήσω;',
    timestamp: '2023-11-15T16:24:00',
    sender: 'ai',
    senderName: 'Customer Service Bot',
    messageType: 'text',
    readStatus: true,
    metadata: {
      tags: ['greeting'],
      priority: 'medium',
      confidence: '98%'
    }
  },
  'm2': {
    id: 'm2',
    content: 'Το Money Box ανοίγεται δωρεάν. Δεν απαιτείται αρχική κατάθεση. Χωρίς μηνιαία προμήθεια.',
    timestamp: '2023-11-15T16:24:30',
    sender: 'user',
    senderName: 'Customer #4521',
    messageType: 'text',
    readStatus: true,
    metadata: {
      tags: ['money-box', 'inquiry'],
      priority: 'high'
    }
  },
  'm3': {
    id: 'm3',
    content: 'Σωστά! Το Money Box είναι εντελώς δωρεάν. Δεν υπάρχει κόστος ανοίγματος και δεν απαιτείται ελάχιστη κατάθεση. Επίσης, δεν υπάρχουν μηνιαίες χρεώσεις ή προμήθειες συντήρησης. Θα θέλατε να μάθετε περισσότερα για τα οφέλη του Money Box;',
    timestamp: '2023-11-15T16:25:00',
    sender: 'ai',
    senderName: 'Customer Service Bot',
    messageType: 'text',
    readStatus: true,
    metadata: {
      tags: ['money-box', 'information'],
      priority: 'high',
      confidence: '96%'
    }
  },
  'm4': {
    id: 'm4',
    content: 'Ναι, θα ήθελα να μάθω περισσότερα για τα οφέλη.',
    timestamp: '2023-11-15T16:25:30',
    sender: 'user',
    senderName: 'Customer #4521',
    messageType: 'text',
    readStatus: true,
    metadata: {
      tags: ['money-box', 'inquiry'],
      priority: 'high'
    }
  },
  'm5': {
    id: 'm5',
    content: 'Έχω ένα τεχνικό πρόβλημα με την εφαρμογή. Δεν μπορώ να συνδεθώ.',
    timestamp: '2023-11-15T16:10:00',
    sender: 'user',
    senderName: 'Customer #4522',
    messageType: 'text',
    readStatus: true,
    metadata: {
      tags: ['technical-issue', 'login'],
      priority: 'medium'
    }
  },
  'm6': {
    id: 'm6',
    content: 'Λυπάμαι για την ταλαιπωρία. Μπορείτε να μου πείτε τι μήνυμα σφάλματος βλέπετε όταν προσπαθείτε να συνδεθείτε;',
    timestamp: '2023-11-15T16:10:30',
    sender: 'ai',
    senderName: 'Technical Support AI',
    messageType: 'text',
    readStatus: true,
    metadata: {
      tags: ['technical-issue', 'troubleshooting'],
      priority: 'medium',
      confidence: '85%'
    }
  },
  'm7': {
    id: 'm7',
    content: 'Λέει "Σφάλμα σύνδεσης: Ο διακομιστής δεν ανταποκρίνεται"',
    timestamp: '2023-11-15T16:11:00',
    sender: 'user',
    senderName: 'Customer #4522',
    messageType: 'text',
    readStatus: true,
    metadata: {
      tags: ['technical-issue', 'server-error'],
      priority: 'medium'
    }
  },
  'm8': {
    id: 'm8',
    content: 'Κατανοώ. Φαίνεται να υπάρχει πρόβλημα με τη σύνδεση στον διακομιστή. Έχετε δοκιμάσει να κάνετε επανεκκίνηση της εφαρμογής ή της συσκευής σας;',
    timestamp: '2023-11-15T16:11:30',
    sender: 'ai',
    senderName: 'Technical Support AI',
    messageType: 'text',
    readStatus: true,
    metadata: {
      tags: ['technical-issue', 'troubleshooting'],
      priority: 'medium',
      confidence: '78%'
    }
  }
};

// Mock Conversations
export const conversations: Record<string, Conversation> = {
  't92178': {
    id: 't92178',
    userId: 'u4521',
    userName: 'Customer #4521',
    aiAgentId: 'ai1',
    aiAgentName: 'Customer Service Bot',
    aiAgentType: 'GPT-4-Turbo',
    status: 'active',
    conclusion: 'successful',
    startTimestamp: '2023-11-15T16:24:00',
    messages: ['m1', 'm2', 'm3', 'm4'],
    tags: ['money-box', 'quick-resolution'],
    priority: 'high',
    duration: '15m',
    messageCount: 4,
    confidence: '98%'
  },
  't92179': {
    id: 't92179',
    userId: 'u4522',
    userName: 'Customer #4522',
    aiAgentId: 'ai2',
    aiAgentName: 'Technical Support AI',
    aiAgentType: 'Claude-3-Opus',
    status: 'active',
    conclusion: 'unsuccessful',
    startTimestamp: '2023-11-15T16:10:00',
    messages: ['m5', 'm6', 'm7', 'm8'],
    tags: ['technical-issue', 'escalation'],
    priority: 'medium',
    duration: '45m',
    messageCount: 4,
    confidence: '62%'
  },
  't92180': {
    id: 't92180',
    userId: 'u4523',
    userName: 'Customer #4523',
    aiAgentId: 'ai1',
    aiAgentName: 'Customer Service Bot',
    aiAgentType: 'GPT-4-Turbo',
    status: 'closed',
    conclusion: 'successful',
    startTimestamp: '2023-11-15T15:30:00',
    endTimestamp: '2023-11-15T15:45:00',
    messages: [],
    tags: ['account-inquiry', 'resolved'],
    priority: 'low',
    duration: '15m',
    messageCount: 6,
    confidence: '95%'
  },
  't92181': {
    id: 't92181',
    userId: 'u4524',
    userName: 'Customer #4524',
    aiAgentId: 'ai2',
    aiAgentName: 'Technical Support AI',
    aiAgentType: 'Claude-3-Opus',
    status: 'closed',
    conclusion: 'successful',
    startTimestamp: '2023-11-15T14:20:00',
    endTimestamp: '2023-11-15T14:40:00',
    messages: [],
    tags: ['password-reset', 'resolved'],
    priority: 'medium',
    duration: '20m',
    messageCount: 8,
    confidence: '88%'
  }
};

// Mock Collections
export const collections: Record<string, Collection> = {
  'c1': {
    id: 'c1',
    name: 'Today\'s Successful Resolutions',
    description: 'All successful conversations from today',
    filterCriteria: {
      timeBased: {
        period: 'today'
      },
      outcomeBased: 'successful'
    },
    creationTimestamp: '2023-11-15T08:00:00',
    creator: 'admin1',
    accessPermissions: ['admin1', 'supervisor1'],
    metadata: {
      totalConversations: 24,
      avgDuration: '12m'
    },
    conversations: ['t92178', 't92180']
  },
  'c2': {
    id: 'c2',
    name: 'Technical Support Issues',
    description: 'All conversations handled by Technical Support AI',
    filterCriteria: {
      aiAgentBased: ['ai2']
    },
    creationTimestamp: '2023-11-14T09:00:00',
    creator: 'admin1',
    accessPermissions: ['admin1', 'supervisor2'],
    metadata: {
      totalConversations: 42,
      avgDuration: '25m'
    },
    conversations: ['t92179', 't92181']
  },
  'c3': {
    id: 'c3',
    name: 'High Priority Cases',
    description: 'All high priority conversations',
    filterCriteria: {
      multiFactorFilters: [
        { priority: 'high' }
      ]
    },
    creationTimestamp: '2023-11-13T10:00:00',
    creator: 'supervisor1',
    accessPermissions: ['admin1', 'supervisor1', 'supervisor2'],
    metadata: {
      totalConversations: 15,
      avgDuration: '18m'
    },
    conversations: ['t92178']
  }
};

// Mock Groups
export const groups: Record<string, Group> = {
  'g1': {
    id: 'g1',
    name: 'Customer Service Performance',
    description: 'Group for evaluating customer service AI performance',
    purpose: 'evaluation',
    collectionIds: ['c1', 'c3'],
    adminUsers: ['admin1'],
    permissionLevels: {
      'admin1': 'full',
      'supervisor1': 'read'
    }
  },
  'g2': {
    id: 'g2',
    name: 'Technical Support Analysis',
    description: 'Group for analyzing technical support conversations',
    purpose: 'efficiency',
    collectionIds: ['c2'],
    adminUsers: ['admin1', 'supervisor2'],
    permissionLevels: {
      'admin1': 'full',
      'supervisor2': 'edit'
    }
  }
};

// Mock AI Agents
export const aiAgents: Record<string, AIAgent> = {
  'ai1': {
    id: 'ai1',
    name: 'Customer Service Bot',
    model: 'GPT-4-Turbo',
    status: 'active',
    conversationsProcessed: 1247,
    successRate: '94%',
    avgResponseTime: '1.2s',
    lastActive: '2m ago',
    capabilities: ['general-inquiries', 'account-management', 'product-information'],
    specializations: ['banking', 'finance']
  },
  'ai2': {
    id: 'ai2',
    name: 'Technical Support AI',
    model: 'Claude-3-Opus',
    status: 'active',
    conversationsProcessed: 856,
    successRate: '89%',
    avgResponseTime: '2.5s',
    lastActive: '5m ago',
    capabilities: ['troubleshooting', 'error-resolution', 'system-guidance'],
    specializations: ['mobile-app', 'web-platform']
  },
  'ai3': {
    id: 'ai3',
    name: 'Sales Assistant',
    model: 'GPT-4-Turbo',
    status: 'inactive',
    conversationsProcessed: 532,
    successRate: '91%',
    avgResponseTime: '1.8s',
    lastActive: '2h ago',
    capabilities: ['product-recommendations', 'upselling', 'promotions'],
    specializations: ['retail', 'e-commerce']
  }
};

// Mock Users
export const users: Record<string, User> = {
  'admin1': {
    id: 'admin1',
    name: 'Admin User',
    role: 'admin',
    permissions: ['full-access', 'manage-agents', 'manage-users']
  },
  'supervisor1': {
    id: 'supervisor1',
    name: 'Customer Service Supervisor',
    role: 'supervisor',
    permissions: ['view-conversations', 'manage-collections']
  },
  'supervisor2': {
    id: 'supervisor2',
    name: 'Technical Support Supervisor',
    role: 'supervisor',
    permissions: ['view-conversations', 'manage-collections']
  },
  'executive1': {
    id: 'executive1',
    name: 'Executive User',
    role: 'executive',
    permissions: ['view-analytics', 'view-reports']
  }
};
