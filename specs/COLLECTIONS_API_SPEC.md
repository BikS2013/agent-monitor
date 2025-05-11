# Agent Monitor Collections API Specification

This document provides a comprehensive specification of the API requirements for the Collections tab in the Agent Monitor application.

## Overview

The Collections tab allows users to create, view, and manage collections of conversations based on various filtering criteria. Collections provide a way to group related conversations for analysis and review.

## Data Models

### Collection

```typescript
interface Collection {
  id: string;                     // Unique identifier
  name: string;                   // Collection name
  description: string;            // Collection description
  filterCriteria: {               // Criteria used to filter conversations
    aiAgentBased?: string[];      // Filter by AI agent IDs
    timeBased?: {                 // Filter by time period
      startDate?: string;         // Start date for time range
      endDate?: string;           // End date for time range
      period?: string;            // Predefined period (today, week, month, quarter, year)
    };
    outcomeBased?: 'successful' | 'unsuccessful' | 'all'; // Filter by conversation outcome
    multiFactorFilters?: Array<{  // Complex filters combining multiple criteria
      agentIds?: string[];        // Filter by AI agent IDs
      agentId?: string;           // Single agent ID (backward compatibility)
      timeRange?: {               // Time range filter
        startDate?: string;
        endDate?: string;
        period?: string;
      };
      outcome?: 'successful' | 'unsuccessful' | 'all'; // Outcome filter
      priority?: 'low' | 'medium' | 'high';           // Priority filter
    }>;
  };
  creationTimestamp: string;      // When collection was created (ISO format)
  creator: string;                // ID or name of the user who created the collection
  accessPermissions: string[];    // IDs of users who can access this collection
  metadata: Record<string, any>;  // Additional metadata (statistics, etc.)
  conversations: string[];        // Array of conversation IDs in this collection
}
```

### Conversation (Referenced Model)

```typescript
interface Conversation {
  id: string;                       // Unique identifier
  userId: string;                   // ID of the user who initiated the conversation
  userName: string;                 // Display name of the user
  aiAgentId: string;                // ID of the AI agent
  aiAgentName: string;              // Display name of the AI agent
  aiAgentType: string;              // Type/model of the AI agent
  status: 'active' | 'closed';      // Current status
  conclusion: 'successful' | 'unsuccessful' | 'pending'; // Outcome status
  startTimestamp: string;           // When conversation started (ISO format)
  endTimestamp?: string;            // When conversation ended (ISO format)
  priority: 'low' | 'medium' | 'high'; // Priority level
  duration: string;                 // Duration of conversation
  confidence: string;               // AI confidence level (0-100%)
}
```

## Required API Endpoints

### 1. List Collections

**Endpoint**: `GET /collection`

**Purpose**: Retrieve a list of all collections with optional filtering.

**Query Parameters**:
- `ids` (optional): Comma-separated list of collection IDs to retrieve specific collections

**Response Format**:
```json
{
  "items": [
    {
      "id": "coll-123",
      "name": "High Priority Support Conversations",
      "description": "Collection of all high priority support conversations",
      "filterCriteria": {
        "multiFactorFilters": [
          {
            "agentIds": ["agent-456", "agent-789"],
            "priority": "high"
          }
        ]
      },
      "creationTimestamp": "2023-01-01T12:00:00Z",
      "creator": "John Doe",
      "accessPermissions": ["user-123"],
      "metadata": {
        "totalConversations": 25,
        "avgDuration": "15m",
        "successRate": "78%"
      },
      "conversations": ["conv-1", "conv-2", "conv-3"]
    }
    // More collections...
  ]
}
```

### 2. Get Collection Details

**Endpoint**: `GET /collection/{id}`

**Purpose**: Retrieve detailed information about a specific collection.

**Response Format**:
```json
{
  "id": "coll-123",
  "name": "High Priority Support Conversations",
  "description": "Collection of all high priority support conversations",
  "filterCriteria": {
    "multiFactorFilters": [
      {
        "agentIds": ["agent-456", "agent-789"],
        "priority": "high"
      }
    ]
  },
  "creationTimestamp": "2023-01-01T12:00:00Z",
  "creator": "John Doe",
  "accessPermissions": ["user-123"],
  "metadata": {
    "totalConversations": 25,
    "avgDuration": "15m",
    "successRate": "78%",
    "activeConversations": 8,
    "closedConversations": 17,
    "highPriorityCount": 25,
    "mediumPriorityCount": 0,
    "lowPriorityCount": 0,
    "lastUpdated": "2023-01-15T09:30:00Z"
  },
  "conversations": ["conv-1", "conv-2", "conv-3", "..."]
}
```

### 3. Create Collection

**Endpoint**: `POST /collection`

**Purpose**: Create a new collection.

**Request Body**:
```json
{
  "name": "Recent Unsuccessful Conversations",
  "description": "Collection of unsuccessful conversations from the past week",
  "filterCriteria": {
    "timeBased": {
      "period": "week"
    },
    "outcomeBased": "unsuccessful"
  },
  "accessPermissions": ["user-123"]
}
```

**Response Format**:
```json
{
  "id": "coll-456",
  "name": "Recent Unsuccessful Conversations",
  "description": "Collection of unsuccessful conversations from the past week",
  "filterCriteria": {
    "timeBased": {
      "period": "week"
    },
    "outcomeBased": "unsuccessful"
  },
  "creationTimestamp": "2023-01-15T10:00:00Z",
  "creator": "John Doe",
  "accessPermissions": ["user-123"],
  "metadata": {
    "totalConversations": 12,
    "avgDuration": "18m",
    "successRate": "0%"
  },
  "conversations": ["conv-7", "conv-12", "conv-18"]
}
```

### 4. Update Collection

**Endpoint**: `PUT /collection/{id}`

**Purpose**: Update an existing collection.

**Request Body**:
```json
{
  "name": "Recent Unsuccessful Conversations (Updated)",
  "description": "Updated description",
  "filterCriteria": {
    "timeBased": {
      "period": "month"
    },
    "outcomeBased": "unsuccessful"
  }
}
```

**Response Format**:
```json
{
  "id": "coll-456",
  "name": "Recent Unsuccessful Conversations (Updated)",
  "description": "Updated description",
  "filterCriteria": {
    "timeBased": {
      "period": "month"
    },
    "outcomeBased": "unsuccessful"
  },
  "creationTimestamp": "2023-01-15T10:00:00Z",
  "creator": "John Doe",
  "accessPermissions": ["user-123"],
  "metadata": {
    "totalConversations": 35,
    "avgDuration": "20m",
    "successRate": "0%"
  },
  "conversations": ["conv-7", "conv-12", "conv-18", "..."]
}
```

### 5. Delete Collection

**Endpoint**: `DELETE /collection/{id}`

**Purpose**: Delete a collection.

**Response Format**:
```json
{
  "success": true
}
```

### 6. Get Conversations in Collection

**Endpoint**: `GET /collection/{id}/conversation`

**Purpose**: Retrieve the conversations in a specific collection.

**Query Parameters**:
- `skip` (optional): Number of records to skip (for pagination)
- `limit` (optional): Maximum number of records to return (for pagination)
- `sort_by` (optional): Field to sort by (e.g., startTimestamp, priority)
- `sort_order` (optional): Sort direction ('asc' or 'desc')
- `include_pagination` (optional): Whether to include pagination metadata

**Response Format**:
```json
{
  "items": [
    {
      "id": "conv-7",
      "userId": "user-123",
      "userName": "John Smith",
      "aiAgentId": "agent-456",
      "aiAgentName": "Support Bot",
      "aiAgentType": "customer-support",
      "status": "closed",
      "conclusion": "unsuccessful",
      "startTimestamp": "2023-01-10T14:30:00Z",
      "endTimestamp": "2023-01-10T15:00:00Z",
      "priority": "high",
      "duration": "30m",
      "confidence": "65"
    },
    // More conversations...
  ],
  "page_info": {
    "total_items": 35,
    "limit": 20,
    "skip": 0
  }
}
```

### 7. Refresh Collection Conversations

**Endpoint**: `POST /collection/{id}/refresh`

**Purpose**: Re-evaluate the collection filter criteria against all conversations and update the collection's conversation list.

**Response Format**:
```json
{
  "success": true,
  "updated": {
    "added": 5,      // Number of conversations added to the collection
    "removed": 2,     // Number of conversations removed from the collection
    "totalConversations": 38
  }
}
```

### 8. Get Collections by Group

**Endpoint**: `GET /group/{id}/collection`

**Purpose**: Retrieve collections that belong to a specific group.

**Response Format**:
```json
{
  "items": [
    {
      "id": "coll-123",
      "name": "High Priority Support Conversations",
      "description": "Collection of all high priority support conversations",
      "filterCriteria": {
        "multiFactorFilters": [
          {
            "agentIds": ["agent-456", "agent-789"],
            "priority": "high"
          }
        ]
      },
      "creationTimestamp": "2023-01-01T12:00:00Z",
      "creator": "John Doe",
      "accessPermissions": ["user-123"],
      "metadata": {
        "totalConversations": 25,
        "avgDuration": "15m"
      },
      "conversations": ["conv-1", "conv-2", "conv-3"]
    }
    // More collections...
  ]
}
```

### 9. Get Collections by Creator

**Endpoint**: `GET /user/{id}/collection`

**Purpose**: Retrieve collections created by a specific user.

**Response Format**:
```json
{
  "items": [
    {
      "id": "coll-123",
      "name": "High Priority Support Conversations",
      "description": "Collection of all high priority support conversations",
      "filterCriteria": {
        "multiFactorFilters": [
          {
            "agentIds": ["agent-456", "agent-789"],
            "priority": "high"
          }
        ]
      },
      "creationTimestamp": "2023-01-01T12:00:00Z",
      "creator": "John Doe",
      "accessPermissions": ["user-123"],
      "metadata": {
        "totalConversations": 25,
        "avgDuration": "15m"
      },
      "conversations": ["conv-1", "conv-2", "conv-3"]
    }
    // More collections...
  ]
}
```

### 10. Calculate Collection Statistics

**Endpoint**: `GET /collection/{id}/statistics`

**Purpose**: Calculate and return statistics for a collection.

**Response Format**:
```json
{
  "totalConversations": 25,
  "avgDuration": "15m",
  "successRate": "78%",
  "activeConversations": 8,
  "closedConversations": 17,
  "highPriorityCount": 15,
  "mediumPriorityCount": 8,
  "lowPriorityCount": 2,
  "lastUpdated": "2023-01-15T09:30:00Z"
}
```

## API Implementation Details

### Collection Filter Criteria

Collections can filter conversations using several types of criteria:

1. **AI Agent Based**:
   - Filter conversations by the AI agents involved
   - Uses the `aiAgentBased` property with an array of AI agent IDs

2. **Time Based**:
   - Filter conversations by time period 
   - Predefined periods: "today", "week", "month", "quarter", "year"
   - Custom date range with `startDate` and `endDate`

3. **Outcome Based**:
   - Filter conversations by conclusion status
   - Options: "successful", "unsuccessful", "all"

4. **Multi-Factor**:
   - Combines multiple criteria for complex filtering
   - Each filter in the array can include agent IDs, time range, outcome, and priority

### Response Format

The API should support both single-object and collection responses:

1. **Single Object Responses**:
   - Return the object directly: `{ id: "coll-123", name: "Collection 1", ... }`

2. **Collection Responses**:
   - Return an array of objects in an `items` property
   - Optionally include pagination metadata when `include_pagination=true`

### CORS Requirements

To allow the frontend to access the API from a different origin, the API server must implement proper CORS headers:

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-API-KEY, X-Client-ID
```

## Example API Usage Flow

1. **User Opens Collections Tab**:
   ```
   GET /collection
   ```

2. **User Views a Collection**:
   ```
   GET /collection/coll-123
   GET /collection/coll-123/conversation?limit=20
   ```

3. **User Creates a New Collection**:
   ```
   POST /collection
   {
     "name": "AI Issues Collection",
     "description": "Collects conversations with AI-related issues",
     "filterCriteria": {
       "aiAgentBased": ["agent-456", "agent-789"]
     }
   }
   ```

4. **User Updates Collection Filters**:
   ```
   PUT /collection/coll-123
   {
     "filterCriteria": {
       "multiFactorFilters": [
         {
           "agentIds": ["agent-456", "agent-789"],
           "priority": "high"
         }
       ]
     }
   }
   ```

5. **User Refreshes Collection**:
   ```
   POST /collection/coll-123/refresh
   ```

6. **User Navigates to a Conversation from the Collection**:
   ```
   GET /conversation/conv-7
   ```

## Critical Fields and Features

For the Collections tab to function properly, these fields are critical:

1. **Collection List View**:
   - `id`: Unique collection identifier
   - `name`: For displaying the collection name
   - `description`: For displaying collection description
   - `creator`: Who created the collection
   - `creationTimestamp`: When the collection was created
   - `filterCriteria`: To display filter badges in the UI

2. **Collection Detail View**:
   - All fields from the list view plus:
   - `conversations`: IDs of conversations in this collection
   - `metadata`: Statistics about the collection
   
3. **Collection Creation/Editing**:
   - Support for all filter types
   - Ability to preview matching conversations
   - Ability to combine multiple filter criteria

4. **Collection Conversation Table**:
   - Each conversation must include:
     - `id`: Unique conversation identifier
     - `userName`: For displaying who initiated the conversation
     - `aiAgentName`: For displaying which AI handled the conversation
     - `status`: Active or closed
     - `conclusion`: Successful, unsuccessful, or pending
     - `duration`: How long the conversation lasted
     - `confidence`: AI confidence level

## Authentication Options

The API should support multiple authentication methods:

1. **JWT Token**: Via `Authorization: Bearer <token>` header
2. **API Key**: Via `X-API-KEY` header with optional `X-Client-ID`
3. **No Authentication**: For development and testing environments

## Appendix: Filter Criteria Examples

### AI Agent Based Filter

```json
{
  "filterCriteria": {
    "aiAgentBased": ["agent-123", "agent-456"]
  }
}
```

### Time Based Filter

```json
{
  "filterCriteria": {
    "timeBased": {
      "period": "month"
    }
  }
}
```

### Custom Date Range Filter

```json
{
  "filterCriteria": {
    "timeBased": {
      "startDate": "2023-01-01T00:00:00Z",
      "endDate": "2023-01-31T23:59:59Z"
    }
  }
}
```

### Outcome Based Filter

```json
{
  "filterCriteria": {
    "outcomeBased": "successful"
  }
}
```

### Multi-Factor Filter

```json
{
  "filterCriteria": {
    "multiFactorFilters": [
      {
        "agentIds": ["agent-123"],
        "timeRange": {
          "period": "week"
        },
        "priority": "high"
      }
    ]
  }
}
```