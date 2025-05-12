# AI Agent Monitor Data Model Documentation

## Overview

The AI Agent Monitor is designed to track, manage, and analyze AI-driven customer service interactions using a hierarchical data model. The system organizes data in increasing levels of aggregation:

**Messages → Conversations → Collections → Groups**

This document provides a comprehensive overview of the data model, including entity types, relationships, and usage patterns.

## Core Entities

### 1. Message

Messages represent the atomic unit of communication between users and AI agents.

```typescript
interface Message {
  id: string;                       // Unique identifier
  content: string;                  // Message content
  sender: 'user' | 'ai';            // Who sent the message
  senderName: string;               // Display name of the sender
}
```

**Usage**: Messages are typically not accessed directly but through their parent Conversation.

### 2. Conversation

Conversations aggregate messages exchanged between a user and an AI agent.

```typescript
interface Conversation {
  thread_id: string;                 // Unique identifier
  userId: string;                   // ID of the user who initiated the conversation
  userName: string;                 // Display name of the user
  aiAgentId: string;                // ID of the AI agent
  aiAgentName: string;              // Display name of the AI agent
  aiAgentType: string;              // Type/model of the AI agent
  status: 'active' | 'closed';      // Current status
  conclusion: 'successful' | 'unsuccessful' | 'uncertain'; // Outcome status (default: 'uncertain')
  created_at: string;               // When conversation was created (ISO format)
  updated_at?: string;              // When conversation was last updated (ISO format)
  messages: string[];               // Array of message IDs
  tags: string[];                   // Tags/labels for categorization
  resolutionNotes?: string;         // Notes about resolution
  duration: string;                 // Duration of conversation
  messageCount: number;             // Number of messages
  confidence: string;               // AI confidence level (0-100%)

  // Virtual/calculated properties (not stored directly)
  conversationTimestamp?: string;       // Timestamp of first message in conversation

  // Methods
  getOrderedMessages?: () => Message[]; // Returns all messages in chronological order
}
```

**Usage**: Conversations are the primary unit for tracking customer interactions and are organized into Collections based on filtering criteria.

### 3. Collection

Collections group related conversations based on specified filter criteria.

```typescript
interface Collection {
  id: string;                           // Unique identifier
  name: string;                         // Display name
  description: string;                  // Purpose description
  filterCriteria: {                     // Criteria for including conversations
    aiAgentBased?: string[];            // Filter by AI agent IDs
    timeBased?: {                       // Filter by time period
      startDate?: string;
      endDate?: string;
      period?: string;                  // 'today', 'week', 'month', 'quarter', 'year'
    };
    outcomeBased?: 'successful' | 'unsuccessful' | 'uncertain' | 'all'; // Filter by outcome
    multiFactorFilters?: any[];         // Combined criteria filters
  };
  creationTimestamp: string;            // When collection was created
  creator: string;                      // User who created the collection
  accessPermissions: string[];          // Users with access
  metadata: Record<string, any>;        // Additional data (total conversations, avg duration)
  conversations: string[];              // Array of conversation IDs

  // Methods
  getConversations?: () => Conversation[]; // Returns conversations based on filter criteria
  refreshConversations?: () => void;     // Re-evaluates all conversations against filter criteria
}
```

**Usage**: Collections provide a way to organize conversations for analysis, reporting, and management. They can be created manually by users or automatically based on filtering rules.

### 4. Group

Groups organize collections into higher-level categories for specific purposes.

```typescript
interface Group {
  id: string;                           // Unique identifier
  name: string;                         // Display name
  description: string;                  // Purpose description
  purpose: 'evaluation' | 'security' | 'efficiency'; // Primary purpose
  collectionIds: string[];              // Array of collection IDs
  adminUsers: string[];                 // Users with admin access
  permissionLevels: Record<string, string>; // User role permissions
  analyticsData?: any;                  // Analytics information
}
```

**Usage**: Groups provide organizational structure for collections serving similar purposes, with shared access controls and analytics.

### 5. AIAgent

AIAgents represent the AI systems that handle customer conversations.

```typescript
interface AIAgent {
  id: string;                           // Unique identifier
  name: string;                         // Display name
  model: string;                        // Model identifier
  status: 'active' | 'inactive' | 'training'; // Current status
  conversationsProcessed: number;       // Count of handled conversations
  successRate: string;                  // Success percentage (e.g., "87%")
  avgResponseTime: string;              // Average response time
  lastActive: string;                   // When agent was last active
  capabilities?: string[];              // Agent capabilities
  specializations?: string[];           // Agent specializations
}
```

**Usage**: AIAgents are assigned to handle conversations and are monitored for performance metrics.

### 6. User

Users represent human actors in the system with various roles and permissions.

```typescript
interface User {
  id: string;                           // Unique identifier
  name: string;                         // Display name
  role: 'admin' | 'supervisor' | 'executive'; // System role
  permissions: string[];                // Specific permissions
}
```

**Usage**: Users interact with the system to manage conversations, collections, and groups based on their assigned roles and permissions.

## Entity Relationships

The data model uses a hierarchical relationship structure:

1. **Messages ↔ Conversations**: One-to-many relationship
   - A conversation contains multiple messages
   - Messages belong to exactly one conversation
   - Referenced by `conversation.messages` array containing message IDs

2. **Conversations ↔ Collections**: Many-to-many relationship
   - A collection contains multiple conversations based on filter criteria
   - A conversation can belong to multiple collections
   - Referenced by `collection.conversations` array containing conversation IDs

3. **Collections ↔ Groups**: Many-to-many relationship
   - A group contains multiple collections
   - A collection can belong to multiple groups
   - Referenced by `group.collectionIds` array containing collection IDs

4. **AIAgents ↔ Conversations**: One-to-many relationship
   - An AI agent handles multiple conversations
   - A conversation is handled by exactly one AI agent
   - Referenced by `conversation.aiAgentId`

5. **Users ↔ Conversations**: One-to-many relationship
   - A user participates in multiple conversations
   - A conversation involves exactly one user
   - Referenced by `conversation.userId`

6. **Users ↔ Collections**: One-to-many relationship
   - A user creates multiple collections
   - A collection is created by exactly one user
   - Referenced by `collection.creator`

7. **Users ↔ Groups**: Many-to-many relationship
   - Users can administer multiple groups
   - A group can have multiple admin users
   - Referenced by `group.adminUsers` array

## Data Storage and Access Patterns

The application uses a normalized data structure with record-based storage:

```typescript
// Data is stored in normalized records with ID keys
messages: Record<string, Message>
conversations: Record<string, Conversation>
collections: Record<string, Collection>
groups: Record<string, Group>
aiAgents: Record<string, AIAgent>
users: Record<string, User>
```

### Access Patterns

The system provides helper functions for common access patterns:

1. **Get messages in a conversation**:
   ```typescript
   getMessagesByConversationId(conversationId: string): Message[]
   ```

2. **Get conversations in a collection**:
   ```typescript
   getConversationsByCollectionId(collectionId: string): Conversation[]
   ```

3. **Get collections in a group**:
   ```typescript
   getCollectionsByGroupId(groupId: string): Collection[]
   ```

4. **Get conversation timestamp** (virtual property implementation):
   ```typescript
   // Implementation of the conversationTimestamp virtual property
   conversation.conversationTimestamp = msgs.length > 0
     ? msgs[0].timestamp
     : conversation.created_at;
   ```

5. **Get ordered messages** (method implementation):
   ```typescript
   // Implementation of the getOrderedMessages method
   conversation.getOrderedMessages = () => {
     return getMessagesByConversationId(conversationId);
   };
   ```

6. **Get conversations from collection** (method implementation):
   ```typescript
   // Implementation of the getConversations method
   collection.getConversations = () => {
     return getConversationsByCollectionId(collectionId);
   };
   ```

7. **Refresh collection conversations** (method implementation):
   ```typescript
   // Implementation of the refreshConversations method
   collection.refreshConversations = () => {
     // Re-evaluates ALL conversations against the filter criteria
     collection.conversations = filterConversationsByCollectionCriteria(
       conversations, // This is the global conversations object with ALL conversations
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
   ```

### Data Filtering

Collections use filtering criteria to dynamically include conversations:

1. **AI Agent-based filtering**: Include conversations handled by specific AI agents
2. **Time-based filtering**: Include conversations within a specific time period
3. **Outcome-based filtering**: Include conversations with specific outcomes
4. **Multi-factor filtering**: Combine multiple criteria for more specific filtering

The filtering logic is implemented in `filterConversationsByCollectionCriteria()` which returns conversation IDs matching the criteria.

## Data Creation and Modification

The system provides functions for creating new entities:

1. **Create Collection**:
   ```typescript
   createCollection(collectionData: Omit<Collection, 'id'> & { id?: string }): Collection
   ```
   - Applies filter criteria to find matching conversations
   - Calculates metadata like total conversations and average duration
   - Creates a new collection ID if not provided
   - Attaches getConversations and refreshConversations methods to the collection

2. **Create Group**:
   ```typescript
   createGroup(groupData: Omit<Group, 'id'>): Group
   ```
   - Creates a new group with specified properties
   - Generates a new ID

3. **Create AI Agent**:
   ```typescript
   createAIAgent(agentData: Omit<AIAgent, 'id'>): AIAgent
   ```
   - Creates a new AI agent with specified properties
   - Generates a new ID

## Data Context Management

The application uses React Context API to provide access to data throughout the component tree:

```typescript
const DataContext = createContext<DataContextType | undefined>(undefined);
```

The `DataProvider` component initializes state for all entity types and provides data access functions:

```tsx
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Record<string, Message>>(getMessages());
  const [conversations, setConversations] = useState<Record<string, Conversation>>(getConversations());
  // ... more state initialization

  // Helper functions for data access and modification
  const value = {
    messages,
    conversations,
    // ... other data
    getMessagesByConversationId,
    // ... other helper functions
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
```

The `useData` hook provides convenient access to the data context in components:

```typescript
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
```

## Use Cases

The data model supports several key application use cases:

1. **AI Agent Performance Monitoring**: Track success rates, response times, and conversation outcomes for AI agents.

2. **Conversation Analysis**: Categorize and filter conversations to identify patterns and improvement opportunities.

3. **Collection Creation and Management**: Organize conversations into meaningful groups based on various criteria.

4. **Group-level Analytics**: Aggregate data across collections for higher-level insights and reporting.

5. **User-Based Access Control**: Control access to conversations, collections, and groups based on user roles and permissions.

## Summary

The AI Agent Monitor data model provides a flexible and hierarchical approach to organizing and analyzing AI-driven customer interactions. The model scales from individual messages to high-level groups, with comprehensive filtering, access patterns, and relationship structures to support the application's monitoring, analysis, and management requirements.