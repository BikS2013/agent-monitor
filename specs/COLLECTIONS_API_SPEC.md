# Agent Monitor Collections API Specification

This document provides a comprehensive specification of the API requirements for the Collections tab in the Agent Monitor application.

## Overview

The Collections tab allows users to create, view, and manage collections of conversations based on various filtering criteria. Collections provide a way to group related conversations for analysis and review.

## Data Models

### Filter Criteria

```typescript
interface FilterElement {
  aiAgentIds?: string[];        // Filter by AI agent IDs
  timeRange?: {                  // Time period for filtering
    startDate?: string;       // Start date for time range
    endDate?: string;         // End date for time range
    period?: string;        // Predefined period (today, week, month, quarter, year)
  };
  outcome?: 'successful' | 'unsuccessful' | 'uncertain' | 'all'; // Filter by conversation outcome
}
``` 

### Collection

```typescript
interface Collection {
  id: string;                     // Unique identifier
  name: string;                   // Collection name
  description: string;            // Collection description
  filter: FilterElement[];        // Collection will include conversations that meet any of the filter elements.
  createdAt: string;              // When collection was created (ISO format)
  updatedAt?: string;             // When collection was last updated (ISO format)
  creator: string;                // ID or name of the user who created the collection
  ownerId: string;                // ID of the user who owns the collection
  accessPermissions: string[];    // IDs of users who can access this collection
  metadata: Record<string, any>;  // Additional metadata (statistics, etc.)
  conversations: string[];        // Array of conversation thread_ids in this collection
  isPublic: boolean;              // Whether the collection is publicly accessible
  tags: string[];                 // Tags associated with this collection
}
```
The conversations field is not used to transfer data. It is used at the client side to keep conversations retrieved by the collection through the GET /collection/{id}/conversation API call.

### Conversation (Referenced Model)

```typescript
interface Conversation {
  thread_id: string;                // Unique identifier
  userId: string;                   // ID of the user who initiated the conversation
  userName: string;                 // Display name of the user
  aiAgentId: string;                // ID of the AI agent
  aiAgentName: string;              // Display name of the AI agent
  aiAgentType: string;              // Type/model of the AI agent
  status: 'active' | 'closed';      // Current status
  conclusion: 'successful' | 'unsuccessful' | 'uncertain'; // Outcome status
  created_at: string;               // When conversation started (ISO format)
  updated_at?: string;              // When conversation was last updated (ISO format)
  messages: string[];               // Message IDs
  tags: string[];                   // Tags associated with the conversation
  resolutionNotes?: string;         // Notes about the resolution
  duration: string;                 // Duration of conversation
  messageCount: number;             // Number of messages in the conversation
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
      "filter": [
        {
          "aiAgentIds": ["agent-456", "agent-789"]
        }
      ],
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-15T09:30:00Z",
      "ownerId": "user-123",
      "creator": "John Doe",
      "accessPermissions": ["user-123"],
      "metadata": {
        "totalConversations": 25,
        "avgDuration": "15m",
        "successRate": "78%"
      },
      "isPublic": false,
      "tags": ["support", "high-priority"]
    }
    // More collections...
  ]
}
```
GET /collection doesn't return conversations. Conversations return as results from GET /collection/{id}/conversation only.

### 2. Get Collection Details

**Endpoint**: `GET /collection/{id}`

**Purpose**: Retrieve detailed information about a specific collection.

**Response Format**:
```json
{
  "id": "coll-123",
  "name": "High Priority Support Conversations",
  "description": "Collection of all high priority support conversations",
  "filter": [
    {
      "aiAgentIds": ["agent-456", "agent-789"]
    }
  ],
  "createdAt": "2023-01-01T12:00:00Z",
  "updatedAt": "2023-01-15T09:30:00Z",
  "ownerId": "user-123",
  "creator": "John Doe",
  "accessPermissions": ["user-123"],
  "metadata": {
    "totalConversations": 25,
    "avgDuration": "15m",
    "successRate": "78%",
    "activeConversations": 8,
    "closedConversations": 17,
    "highPriorityCount": 0,
    "mediumPriorityCount": 0,
    "lowPriorityCount": 0,
    "lastUpdated": "2023-01-15T09:30:00Z"
  },
  "isPublic": false,
  "tags": ["support", "high-priority"]
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
  "filter": [
    {
      "timeRange": {
        "period": "week"
      },
      "outcome": "unsuccessful"
    }
  ],
  "accessPermissions": ["user-123"],
  "ownerId": "user-123",
  "isPublic": false,
  "tags": ["unsuccessful", "recent"]
}
```

**Response Format**:
```json
{
  "id": "coll-456",
  "name": "Recent Unsuccessful Conversations",
  "description": "Collection of unsuccessful conversations from the past week",
  "filter": [
    {
      "timeRange": {
        "period": "week"
      },
      "outcome": "unsuccessful"
    }
  ],
  "createdAt": "2023-01-15T10:00:00Z",
  "updatedAt": "2023-01-15T10:00:00Z",
  "ownerId": "user-123",
  "creator": "John Doe",
  "accessPermissions": ["user-123"],
  "metadata": {
    "totalConversations": 12,
    "avgDuration": "18m",
    "successRate": "0%"
  },
  "isPublic": false,
  "tags": ["unsuccessful", "recent"]
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
  "filter": [
    {
      "timeRange": {
        "period": "week"
      },
      "outcome": "unsuccessful"
    }
  ],
  "tags": ["unsuccessful", "updated"]
}
```

**Response Format**:
```json
{
  "id": "coll-456",
  "name": "Recent Unsuccessful Conversations (Updated)",
  "description": "Updated description",
  "filter": [
    {
      "timeRange": {
        "period": "week"
      },
      "outcome": "unsuccessful"
    }
  ],
  "createdAt": "2023-01-15T10:00:00Z",
  "updatedAt": "2023-01-15T11:30:00Z",
  "ownerId": "user-123",
  "creator": "John Doe",
  "accessPermissions": ["user-123"],
  "metadata": {
    "totalConversations": 35,
    "avgDuration": "20m",
    "successRate": "0%",
    "activeConversations": 8,
    "closedConversations": 27,
    "highPriorityCount": 0,
    "mediumPriorityCount": 0,
    "lowPriorityCount": 0
  },
  "isPublic": false,
  "tags": ["unsuccessful", "updated"]
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
- `sort_by` (optional): Field to sort by (e.g., created_at, messageCount)
- `sort_order` (optional): Sort direction ('asc' or 'desc')
- `include_pagination` (optional): Whether to include pagination metadata

**Response Format**:
```json
{
  "items": [
    {
      "thread_id": "conv-7",
      "userId": "user-123",
      "userName": "John Smith",
      "aiAgentId": "agent-456",
      "aiAgentName": "Support Bot",
      "aiAgentType": "customer-support",
      "status": "closed",
      "conclusion": "unsuccessful",
      "created_at": "2023-01-10T14:30:00Z",
      "updated_at": "2023-01-10T15:00:00Z",
      "messages": ["msg-1", "msg-2", "msg-3"],
      "tags": ["support", "billing"],
      "duration": "30m",
      "messageCount": 3,
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
      "filter": [
        {
          "aiAgentIds": ["agent-456", "agent-789"]
        }
      ],
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-15T09:30:00Z",
      "ownerId": "user-123",
      "creator": "John Doe",
      "accessPermissions": ["user-123"],
      "metadata": {
        "totalConversations": 25,
        "avgDuration": "15m"
      },
      "isPublic": false,
      "tags": ["support", "high-priority"]
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
      "filter": [
        {
          "aiAgentIds": ["agent-456", "agent-789"]
        }
      ],
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-15T09:30:00Z",
      "ownerId": "user-123",
      "creator": "John Doe",
      "accessPermissions": ["user-123"],
      "metadata": {
        "totalConversations": 25,
        "avgDuration": "15m"
      },
      "isPublic": false,
      "tags": ["support", "high-priority"]
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
  "highPriorityCount": 0,
  "mediumPriorityCount": 0,
  "lowPriorityCount": 0,
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
   - Options: "successful", "unsuccessful", "uncertain", "all"

4. **Multi-Factor**:
   - Combines multiple criteria for complex filtering
   - Each filter in the array can include agent IDs, time range, outcome, and message count

### Response Format

The API supports both single-object and collection responses:

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
     "filter": [
       {
         "aiAgentIds": ["agent-456", "agent-789"]
       }
     ],
     "ownerId": "user-123",
     "isPublic": false,
     "tags": ["issues", "ai"]
   }
   ```

4. **User Updates Collection Filters**:
   ```
   PUT /collection/coll-123
   {
     "filter": [
       {
         "aiAgentIds": ["agent-456", "agent-789", "agent-802"]
       }
     ]
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
   - `createdAt`: When the collection was created
   - `ownerId`: ID of the user who owns the collection
   - `filter`: To display filter badges in the UI
   - `tags`: Tags associated with the collection

2. **Collection Detail View**:
   - All fields from the list view plus:
   - `conversations`: IDs of conversations in this collection
   - `metadata`: Statistics about the collection
   
3. **Collection Creation/Editing**:
   - Support for all filter types
   - Ability to preview matching conversations
   - Ability to combine multiple filter criteria
   - Setting public/private access via `isPublic`
   - Adding tags

4. **Collection Conversation Table**:
   - Each conversation must include:
     - `thread_id`: Unique conversation identifier (shown as ID in UI)
     - `userName`: For displaying who initiated the conversation
     - `aiAgentName`: For displaying which AI handled the conversation
     - `status`: Active or closed
     - `conclusion`: Successful, unsuccessful, or uncertain
     - `duration`: How long the conversation lasted
     - `confidence`: AI confidence level
     - `messageCount`: Number of messages in the conversation

## Authentication Options

The API supports multiple authentication methods:

1. **JWT Token**: Via `Authorization: Bearer <token>` header
2. **API Key**: Via `X-API-KEY` header with optional `X-Client-ID`
3. **No Authentication**: For development and testing environments as described in NOAUTH_IMPLEMENTATION.md

## Appendix: Filter Criteria Examples

### AI Agent Based Filter

```json
{
  "filter": {
    "aiAgentIds": ["agent-123", "agent-456"],
    "timeRange": {
      "period": "month"
    }
  }
}
```

### Time Based Filter

```json
{
  "filter": {
    "timeRange": {
      "period": "month"
    }
  }
}
```

### Custom Date Range Filter

```json
{
  "filter": {
    "timeRange": {
      "startDate": "2023-01-01T00:00:00Z",
      "endDate": "2023-01-31T23:59:59Z"
    }
  }
}
```

### Generic Filter

```json
{
  "filter": {
    "aiAgentIds": ["agent-123", "agent-456"],
    "timeRange": {
      "period": "month"
    },
    "outcome": "successful"
  }
}
```

## Database Support Requirements

### Schema Requirements

To implement the Collections API, the following database schema considerations are required:

1. **Collections Table**:
   - Primary key: `id` (string, UUID preferred)
   - Required fields: `name`, `description`, `filter`, `createdAt`, `ownerId`, `creator`
   - JSON field: `filter` should be stored as a JSON object to support the complex filtering structure
   - Indexed fields: `ownerId`, `createdAt`, `isPublic` (for efficient querying)
   - Text search fields: `name`, `description`, `tags` (for search functionality)

2. **Collection-Conversation Junction**:
  Conversations will be related to collections dynamically based on the filter criteria.

4. **Collection Access Permissions Table** (optional):
   - Fields: `collectionId`, `userId`, `permissionLevel`
   - For detailed access control beyond the `accessPermissions` array

### Database Operations

The Collections API requires the following database operation capabilities:

1. **Complex Filtering**:
   - Support for dynamic query generation based on the `filterCriteria`
   - Ability to filter conversations based on multiple criteria with OR logic
   - Support for date range queries and text search

2. **Transaction Support**:not required

3. **Performance Considerations**:
   - Efficient querying for collections with large numbers of conversations
   - Support for pagination when retrieving conversations in a collection
   - Ability to calculate statistics efficiently (possibly using aggregation functions)

### Recommended Database Types

Based on the requirements, the following database types are recommended:

1. **Relational Databases** (PostgreSQL, MySQL):
   - Strong support for complex relationships
   - JSONB support (especially PostgreSQL) for the `filter` field
   - Efficient indexing and query optimization

2. **Document Databases** (MongoDB):
   - Native JSON storage for `filter`
   - Flexible schema for evolving data models
   - Good performance for read-heavy operations
   - Aggregation framework for statistics calculations

3. **Hybrid Solutions**:
   - For high-scale deployments, consider using a relational database for collections data with a search engine (Elasticsearch) for efficient filtering

### Implementation Considerations

1. **Data Consistency**:
   - Implement database constraints to ensure referential integrity
   - Use triggers or application logic to update metadata when conversations change

2. **Caching Strategy**:
   - Cache collection metadata and statistics to reduce database load
   - Consider invalidation strategies when conversations are updated

3. **Search Optimization**:
   - Implement full-text search capabilities for finding collections by name, description, or tags
   - Consider specialized indexes for frequently used filter combinations

### PostgreSQL Implementation Scripts

The following SQL scripts create the necessary database schema for implementing the Collections API in PostgreSQL:

```sql
-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Collections Table
CREATE TABLE collections (
    id UUID PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    filter JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    creator VARCHAR(255) NOT NULL,
    owner_id VARCHAR(100) NOT NULL,
    access_permissions TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}'
);

-- Create indexes for collections table
CREATE INDEX idx_collections_owner_id ON collections(owner_id);
CREATE INDEX idx_collections_is_public ON collections(is_public);

-- Collection Access Permissions Table (for more granular control)
CREATE TABLE collection_permissions (
    collection_id UUID NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    permission_level VARCHAR(50) NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_id, user_id)
);

```

#### Usage Notes for Database Implementation

1. **JSON and Array Support**:
   - PostgreSQL's native JSONB type is used for complex filter criteria and metadata
   - Array types are used for tags and access permissions for simple implementations
   - The separate `collection_permissions` table provides a more structured approach for access control

2. **Performance Optimizations**:
   - GIN indexes are used for efficient queries on JSON and array fields
   - Full-text search is implemented using PostgreSQL's tsvector
   - Consider creating materialized views for frequently accessed collection statistics