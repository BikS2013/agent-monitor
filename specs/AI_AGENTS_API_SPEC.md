# Agent Monitor AI Agents API Specification

This document provides a comprehensive specification of the API requirements for the AI Agents tab in the Agent Monitor application.

## Overview

The AI Agents tab allows users to view, create, and manage AI agents deployed in the system. It provides detailed information about each agent's performance, capabilities, and specializations, enabling effective monitoring and management of AI resources.

## Data Models

### AI Agent

```typescript
interface AIAgent {
  id: string;                                // Unique identifier
  name: string;                              // Agent name
  model: string;                             // AI model (e.g., GPT-4-Turbo, Claude-3-Opus)
  status: 'active' | 'inactive' | 'training'; // Current operational status
  conversationsProcessed: number;            // Total conversations handled
  successRate: string;                       // Success rate as percentage (e.g., "85%")
  avgResponseTime: string;                   // Average response time (e.g., "1.2s")
  lastActive: string;                        // When the agent was last active
  capabilities?: string[];                   // List of agent capabilities
  specializations?: string[];                // List of agent specializations
  metadata?: Record<string, any>;            // Additional metadata
  createdAt: string;                        // When agent was created (ISO format)
  updatedAt?: string;                       // When agent was last updated (ISO format)
  creatorId?: string;                       // ID of the user who created the agent
  ownerId?: string;                         // ID of the user who owns the agent
}
```

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

### 1. List AI Agents

**Endpoint**: `GET /aiagent`

**Purpose**: Retrieve a list of all AI agents with optional filtering.

**Query Parameters**:
- `ids` (optional): Comma-separated list of agent IDs to retrieve specific agents
- `status` (optional): Filter by status ('active', 'inactive', 'training')
- `model` (optional): Filter by model type
- `search` (optional): Search by name or model
- `sortBy` (optional): Field to sort by (e.g., name, successRate)
- `sortOrder` (optional): Sort direction ('asc' or 'desc')

**Response Format**:
```json
{
  "items": [
    {
      "id": "agent-123",
      "name": "Support Bot",
      "model": "GPT-4-Turbo",
      "status": "active",
      "conversationsProcessed": 1245,
      "successRate": "85%",
      "avgResponseTime": "1.2s",
      "lastActive": "2023-05-15T14:30:00Z",
      "capabilities": ["general-inquiries", "troubleshooting"],
      "specializations": ["customer-service", "technical-support"],
      "metadata": {
        "version": "1.2",
        "totalMessagesProcessed": 5892,
        "avgConfidenceScore": "92%"
      },
      "createdAt": "2023-01-15T10:00:00Z",
      "updatedAt": "2023-05-15T14:30:00Z",
      "creatorId": "user-123",
      "ownerId": "user-123"
    }
    // More agents...
  ],
  "total": 25,
  "page": 1,
  "pageSize": 20
}
```

### 2. Get AI Agent Details

**Endpoint**: `GET /aiagent/{id}`

**Purpose**: Retrieve detailed information about a specific AI agent.

**Response Format**:
```json
{
  "data": {
    "id": "agent-123",
    "name": "Support Bot",
    "model": "GPT-4-Turbo",
    "status": "active",
    "conversationsProcessed": 1245,
    "successRate": "85%",
    "avgResponseTime": "1.2s",
    "lastActive": "2023-05-15T14:30:00Z",
    "capabilities": ["general-inquiries", "troubleshooting"],
    "specializations": ["customer-service", "technical-support"],
    "metadata": {
      "version": "1.2",
      "totalMessagesProcessed": 5892,
      "avgConfidenceScore": "92%",
      "responseTimeDistribution": {
        "under1s": "65%",
        "1to3s": "25%",
        "over3s": "10%"
      },
      "topPerformingTasks": [
        "password-reset",
        "account-inquiries",
        "product-information"
      ]
    },
    "createdAt": "2023-01-15T10:00:00Z",
    "updatedAt": "2023-05-15T14:30:00Z",
    "creatorId": "user-123",
    "ownerId": "user-123"
  }
}
```

### 3. Create AI Agent

**Endpoint**: `POST /aiagent`

**Purpose**: Create a new AI agent.

**Request Body**:
```json
{
  "name": "Product Expert Bot",
  "model": "Claude-3-Opus",
  "status": "active",
  "capabilities": ["product-inquiries", "pricing-information"],
  "specializations": ["product-catalog", "pricing"]
}
```

**Response Format**:
```json
{
  "data": {
    "id": "agent-456",
    "name": "Product Expert Bot",
    "model": "Claude-3-Opus",
    "status": "active",
    "conversationsProcessed": 0,
    "successRate": "0%",
    "avgResponseTime": "0s",
    "lastActive": "2023-05-15T15:00:00Z",
    "capabilities": ["product-inquiries", "pricing-information"],
    "specializations": ["product-catalog", "pricing"],
    "metadata": {},
    "createdAt": "2023-01-15T10:00:00Z",
    "updatedAt": "2023-05-15T14:30:00Z",
    "creatorId": "user-123",
    "ownerId": "user-123"
  }
}
```

### 4. Update AI Agent

**Endpoint**: `PUT /aiagent/{id}`

**Purpose**: Update an existing AI agent.

**Request Body**:
```json
{
  "name": "Product Expert Bot (Updated)",
  "model": "Claude-3-Opus",
  "status": "active",
  "capabilities": ["product-inquiries", "pricing-information", "inventory-checks"],
  "specializations": ["product-catalog", "pricing", "inventory"]
}
```

**Response Format**:
```json
{
  "data": {
    "id": "agent-456",
    "name": "Product Expert Bot (Updated)",
    "model": "Claude-3-Opus",
    "status": "active",
    "conversationsProcessed": 0,
    "successRate": "0%",
    "avgResponseTime": "0s",
    "lastActive": "2023-05-15T15:00:00Z",
    "capabilities": ["product-inquiries", "pricing-information", "inventory-checks"],
    "specializations": ["product-catalog", "pricing", "inventory"],
    "metadata": {},
    "createdAt": "2023-01-15T10:00:00Z",
    "updatedAt": "2023-05-15T14:30:00Z",
    "creatorId": "user-123",
    "ownerId": "user-123"
  }
}
```

### 5. Delete AI Agent

**Endpoint**: `DELETE /aiagent/{id}`

**Purpose**: Delete an AI agent.

**Response Format**:
```json
{
  "success": true
}
```

### 6. Update AI Agent Status

**Endpoint**: `PATCH /aiagent/{id}/status`

**Purpose**: Update the status of an AI agent (activate, deactivate, set to training).

**Request Body**:
```json
{
  "status": "inactive"
}
```

**Response Format**:
```json
{
  "id": "agent-456",
  "name": "Product Expert Bot",
  "status": "inactive",
  "updatedAt": "2023-05-15T16:00:00Z"
}
```

### 7. Get AI Agent Conversations

**Endpoint**: `GET /aiagent/{id}/conversation`

**Purpose**: Retrieve conversations handled by a specific AI agent.

**Query Parameters**:
- `skip` (optional): Number of records to skip (for pagination)
- `limit` (optional): Maximum number of records to return (for pagination)
- `sortBy` (optional): Field to sort by (e.g., created_at, messageCount)
- `sortOrder` (optional): Sort direction ('asc' or 'desc')
- `status` (optional): Filter by conversation status ('active', 'closed')
- `conclusion` (optional): Filter by conclusion ('successful', 'unsuccessful', 'uncertain')
- `includePagination` (optional): Whether to include pagination metadata

**Response Format**:
```json
{
  "items": [
    {
      "thread_id": "conv-123",
      "userId": "user-456",
      "userName": "John Smith",
      "aiAgentId": "agent-123",
      "aiAgentName": "Support Bot",
      "aiAgentType": "customer-support",
      "status": "closed",
      "conclusion": "successful",
      "created_at": "2023-05-10T14:30:00Z",
      "updated_at": "2023-05-10T15:00:00Z",
      "tags": ["support", "account"],
      "duration": "30m",
      "messageCount": 3,
      "confidence": "95"
    }
    // More conversations...
  ],
  "pageInfo": {
    "totalItems": 1245,
    "limit": 20,
    "skip": 0
  }
}
```

### 8. Get AI Agent Performance Metrics

**Endpoint**: `GET /aiagent/{id}/metrics`

**Purpose**: Retrieve detailed performance metrics for a specific AI agent.

**Query Parameters**:
- `period` (optional): Time period for metrics ('day', 'week', 'month', 'year')
- `fromDate` (optional): Start date for custom time period
- `toDate` (optional): End date for custom time period

**Response Format**:
```json
{
  "conversationsProcessed": 1245,
  "successRate": "85%",
  "avgResponseTime": "1.2s",
  "totalMessages": 5892,
  "avgMessagesPerConversation": 4.7,
  "avgConversationDuration": "15m",
  "timeDistribution": {
    "morning": "35%",
    "afternoon": "45%",
    "evening": "15%",
    "night": "5%"
  },
  "statusDistribution": {
    "active": 12,
    "closed": 1233
  },
  "conclusionDistribution": {
    "successful": 1058,
    "unsuccessful": 112,
    "uncertain": 75
  },
  "responseTimeDistribution": {
    "under1s": "65%",
    "1to3s": "25%",
    "over3s": "10%"
  },
  "dailyConversations": [
    {"date": "2023-05-01", "count": 42},
    {"date": "2023-05-02", "count": 38},
    // More daily counts...
  ]
}
```

### 9. Get AI Models

**Endpoint**: `GET /aimodel`

**Purpose**: Retrieve a list of available AI models for creating or updating agents.

**Response Format**:
```json
{
  "items": [
    {
      "id": "gpt-4-turbo",
      "name": "GPT-4-Turbo",
      "vendor": "OpenAI",
      "capabilities": ["general-purpose", "code-generation", "multilingual"],
      "description": "Advanced language model optimized for speed and performance"
    },
    {
      "id": "claude-3-opus",
      "name": "Claude-3-Opus",
      "vendor": "Anthropic",
      "capabilities": ["general-purpose", "reasoning", "safety"],
      "description": "High-performance model with enhanced reasoning capabilities"
    }
    // More models...
  ]
}
```

### 10. Get AI Agent by User

**Endpoint**: `GET /user/{id}/ai-agent`

**Purpose**: Retrieve AI agents created by a specific user.

**Response Format**:
```json
{
  "items": [
    {
      "id": "agent-123",
      "name": "Support Bot",
      "model": "GPT-4-Turbo",
      "status": "active",
      "conversationsProcessed": 1245,
      "successRate": "85%",
      "avgResponseTime": "1.2s",
      "lastActive": "2023-05-15T14:30:00Z",
      "createdAt": "2023-01-15T10:00:00Z",
      "updatedAt": "2023-05-15T14:30:00Z"
    }
    // More agents...
  ]
}
```

## API Implementation Details

### AI Agent Status

AI agents can have one of three status values:

1. **active**: Agent is operational and available for conversations
2. **inactive**: Agent is not currently accepting conversations
3. **training**: Agent is in a training/learning phase

### Response Format

The API consistently uses structured response formats:

1. **Single Object Responses**:
   - Return the object wrapped in a `data` field: `{ "data": { id: "agent-123", name: "Support Bot", ... } }`
   - Used for: GET /aiagent/{id}, POST /aiagent, PUT /aiagent/{id}

2. **Collection Responses**:
   - Return an array of objects wrapped in an `items` property: `{ "items": [...] }`
   - Used for: GET /aiagent, GET /aiagent/{id}/conversation, GET /user/{id}/ai-agent
   - Optionally include pagination metadata when `includePagination=true` as `pageInfo`

3. **Special Responses**:
   - DELETE operations return: `{ "success": true }`
   - Status update endpoint returns object with specific fields: `{ "id", "name", "status", "updatedAt" }`

### CORS Requirements

To allow the frontend to access the API from a different origin, the API server must implement proper CORS headers:

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-API-KEY, X-Client-ID
```

## Example API Usage Flow

1. **User Opens AI Agents Tab**:
   ```
   GET /aiagent
   ```

2. **User Views an Agent**:
   ```
   GET /aiagent/agent-123
   GET /aiagent/agent-123/metrics
   GET /aiagent/agent-123/conversation?limit=20
   ```

3. **User Creates a New Agent**:
   ```
   GET /aimodel
   POST /aiagent
   {
     "name": "New Support Bot",
     "model": "GPT-4-Turbo",
     "status": "active",
     "capabilities": ["general-inquiries"],
     "specializations": ["customer-service"]
   }
   ```

4. **User Updates Agent Status**:
   ```
   PATCH /aiagent/agent-123/status
   {
     "status": "inactive"
   }
   ```

5. **User Edits Agent Details**:
   ```
   PUT /aiagent/agent-123
   {
     "name": "Updated Support Bot",
     "model": "GPT-4-Turbo",
     "capabilities": ["general-inquiries", "troubleshooting"],
     "specializations": ["customer-service", "technical-support"]
   }
   ```

## Critical Fields and Features

For the AI Agents tab to function properly, these fields are critical:

1. **Agent List View**:
   - `id`: Unique agent identifier
   - `name`: For displaying the agent name
   - `model`: AI model type
   - `status`: Operational status
   - `conversationsProcessed`: Number of conversations handled
   - `successRate`: Success rate percentage
   - `avgResponseTime`: Average response time
   - `lastActive`: When the agent was last active

2. **Agent Detail View**:
   - All fields from the list view plus:
   - `capabilities`: List of agent capabilities
   - `specializations`: List of agent specializations
   - `metadata`: Additional performance metrics and data

3. **Agent Creation/Editing**:
   - Support for adding/removing capabilities and specializations
   - Setting operational status
   - Selecting from available AI models

4. **Metrics and Performance**:
   - Detailed conversation statistics
   - Success rate tracking
   - Response time monitoring
   - User satisfaction metrics

## Authentication Options

The API supports configurable authentication that can be adjusted per environment:

### Authentication Modes

The API can operate in different authentication modes controlled by the `AUTH_MODE` environment variable:

1. **Required Mode** (`AUTH_MODE=required`)
   - All protected endpoints require valid JWT authentication
   - Returns 401 Unauthorized for missing or invalid tokens
   - Suitable for production environments

2. **Optional Mode** (`AUTH_MODE=optional`) - **Default**
   - Authentication is validated if provided but not required
   - Invalid tokens return 401 only if `REQUIRE_AUTHENTICATION=true`
   - Allows unauthenticated access for development/testing
   - Suitable for development and staging environments

3. **Disabled Mode** (`AUTH_MODE=disabled`)
   - No authentication checks performed
   - All endpoints accessible without tokens
   - Only for local development or testing

### Authentication Methods

When authentication is enabled, the following methods are supported:

1. **JWT Token**: Via `Authorization: Bearer <token>` header (primary method)
   - Standard JWT with user ID, role, and permissions encoded
   - Use `/auth/login` to obtain tokens

2. **API Key**: Via `X-API-KEY` header with optional `X-CLIENT-ID`
   - For service-to-service or automated access

### Environment Configuration

```bash
# Production - authentication required
AUTH_MODE=required
REQUIRE_AUTHENTICATION=true

# Development - authentication optional  
AUTH_MODE=optional
REQUIRE_AUTHENTICATION=false

# Testing - authentication disabled
AUTH_MODE=disabled
```

## Relationships with Other Entities

### AI Agents and Conversations

Each conversation is associated with a single AI agent through the `aiAgentId` field. The AI agent's metrics (like `conversationsProcessed`, `successRate`, etc.) are calculated based on these associated conversations.

### AI Agents and Collections

Collections can filter conversations by AI agent using the `aiAgentIds` property in their filter criteria. This allows monitoring conversations handled by specific agents.

### AI Agents and Groups

AI agents are not directly associated with groups, but they are indirectly related through collections. Groups contain collections, which can filter by AI agents.

## Database Support Requirements

### Schema Requirements

To implement the AI Agents API, the following database schema considerations are required:

1. **AI Agents Table**:
   - Primary key: `id` (string, UUID preferred)
   - Required fields: `name`, `model`, `status`, `created_at`
   - JSON fields: `capabilities`, `specializations`, `metadata`
   - Indexed fields: `status`, `model`, `created_at` (for efficient querying)
   - Text search fields: `name`, `model` (for search functionality)

2. **AI Agent Metrics Table** (optional):
   - Can be used to store historical metrics for analytics
   - Fields: `agent_id`, `date`, `conversations_processed`, `success_rate`, etc.
   - Allows for historical trending and performance comparisons

### Database Operations

The AI Agents API requires the following database operation capabilities:

1. **Complex Queries**:
   - Filtering agents by multiple criteria
   - Calculating metrics based on related conversations
   - Full-text search on agent names and models

2. **Performance Considerations**:
   - Efficient querying for agents with large numbers of conversations
   - Support for pagination when retrieving conversations for an agent
   - Fast retrieval of agents by status, model, or creation date

### Recommended Database Types

Based on the requirements, the following database types are recommended:

1. **Relational Databases** (PostgreSQL, MySQL):
   - Strong support for relationships between agents and conversations
   - JSONB support (especially PostgreSQL) for `capabilities`, `specializations`, and `metadata`
   - Efficient indexing and query optimization
   - Transaction support for data consistency

2. **Document Databases** (MongoDB):
   - Native JSON storage for complex fields
   - Flexible schema for evolving data models
   - Good performance for read-heavy operations

### PostgreSQL Implementation Scripts

The following SQL scripts create the necessary database schema for implementing the AI Agents API in PostgreSQL:

```sql
-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- AI Agents Table
CREATE TABLE ai_agent (
    id UUID PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    conversations_processed INTEGER DEFAULT 0,
    success_rate VARCHAR(10) DEFAULT '0%',
    avg_response_time VARCHAR(10) DEFAULT '0s',
    last_active TIMESTAMP WITH TIME ZONE,
    capabilities JSONB DEFAULT '[]',
    specializations JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    creator_id VARCHAR(100),
    owner_id VARCHAR(100)
);

-- Create indexes for ai_agents table
CREATE INDEX idx_ai_agents_status ON ai_agent(status);
CREATE INDEX idx_ai_agents_model ON ai_agent(model);
CREATE INDEX idx_ai_agents_created_at ON ai_agent(created_at);
CREATE INDEX idx_ai_agents_name_model ON ai_agent USING GIN (to_tsvector('english', name || ' ' || model));

-- AI Agent Metrics Historical Table
CREATE TABLE ai_agent_metrics (
    agent_id UUID NOT NULL,
    date DATE NOT NULL,
    conversations_processed INTEGER DEFAULT 0,
    success_rate VARCHAR(10) DEFAULT '0%',
    avg_response_time VARCHAR(10) DEFAULT '0s',
    total_messages INTEGER DEFAULT 0,
    avg_messages_per_conversation NUMERIC(5,2) DEFAULT 0,
    avg_conversation_duration VARCHAR(10) DEFAULT '0s',
    PRIMARY KEY (agent_id, date)
);
```

### Implementation Considerations

1. **Caching Strategy**:
   - Cache agent list and details to reduce database load
   - Consider invalidation strategies when agent metrics change
   - Implement time-based cache for performance metrics

2. **Search Optimization**:
   - Implement full-text search capabilities for finding agents by name and model
   - Use specialized indexes for frequently used queries

3. **Metrics Calculation**:
   - Consider whether to calculate metrics in real-time or use scheduled jobs
   - For high-volume systems, use incremental metrics updates rather than full recalculation