# Agent Monitor Conversations API Specification

This document provides a comprehensive specification of the API requirements for the Conversations tab in the Agent Monitor application.

## Overview

The Conversations tab allows users to browse, filter, and view detailed conversation data between users and AI agents. It requires a set of API endpoints that provide access to conversations, messages, and related entities.

## Data Models

### Conversation

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
}
```

### Message

```typescript
interface Message {
  id: string;                       // Unique identifier
  content: string;                  // Message content
  sender: 'user' | 'ai';            // Who sent the message
  senderName: string;               // Display name of the sender
}
```

## Required API Endpoints

### 1. List Conversations

**Endpoint**: `GET /conversation`

**Purpose**: Retrieve a list of conversations with optional filtering and pagination.

**Query Parameters**:
- `ids` (optional): Comma-separated list of conversation IDs to retrieve specific conversations
- `skip` (optional): Number of records to skip (for pagination)
- `limit` (optional): Maximum number of records to return (for pagination)
- `sort_by` (optional): Field to sort by (e.g., startTimestamp, priority)
- `sort_order` (optional): Sort direction ('asc' or 'desc')
- `include_pagination` (optional): Whether to include pagination metadata in response
- `include_messages` (optional): Whether to include decoded messages in response

**Response Format**:
```json
{
  "items": [
    {
      "thread_id": "conv-123",
      "userId": "user-456",
      "userName": "John Doe",
      "aiAgentId": "agent-789",
      "aiAgentName": "Support Bot",
      "aiAgentType": "customer-support",
      "status": "active",
      "conclusion": "uncertain",
      "created_at": "2023-01-01T12:00:00Z",
      "updated_at": "2023-01-01T12:15:23Z",
      "tags": ["billing", "subscription"],
      "duration": "15m",
      "messageCount": 8,
      "confidence": "85"
    }
    // More conversations...
  ],
  "page_info": {
    "total_items": 150,
    "limit": 20,
    "skip": 0
  }
}
```

### 2. Get Conversation Details

**Endpoint**: `GET /conversation/{id}`

**Purpose**: Retrieve detailed information about a specific conversation.

**Query Parameters**:
- `include_messages` (optional): Whether to include decoded messages (default: false)

**Response Format**:
```json
{
  "thread_id": "conv-123",
  "userId": "user-456",
  "userName": "John Doe",
  "aiAgentId": "agent-789",
  "aiAgentName": "Support Bot",
  "aiAgentType": "customer-support",
  "status": "active",
  "conclusion": "uncertain",
  "created_at": "2023-01-01T12:00:00Z",
  "updated_at": "2023-01-01T12:15:23Z",
  "tags": ["billing", "subscription"],
  "resolutionNotes": "",
  "duration": "15m",
  "messageCount": 8,
  "confidence": "85",
  "decodedMessages": [
    {
      "id": "msg-001",
      "content": "Hello, I need help with my subscription",
      "sender": "user",
      "senderName": "John Doe"
    },
    {
      "id": "msg-002",
      "content": "I'd be happy to help with your subscription. What seems to be the issue?",
      "sender": "ai",
      "senderName": "Support Bot"
    }
    // More messages...
  ]
}
```

### 3. Get Messages by Conversation ID

**Endpoint**: `GET /conversation/{id}/messages`

**Purpose**: Retrieve messages for a specific conversation.

**Query Parameters**:
- `skip` (optional): Number of records to skip (for pagination)
- `limit` (optional): Maximum number of records to return (for pagination)
- `sort_by` (optional): Field to sort by (default: timestamp)
- `sort_order` (optional): Sort direction ('asc' or 'desc', default: 'asc')

**Response Format**:
```json
{
  "items": [
    {
      "id": "msg-001",
      "content": "Hello, I need help with my subscription",
      "sender": "user",
      "senderName": "John Doe"
    },
    {
      "id": "msg-002",
      "content": "I'd be happy to help with your subscription. What seems to be the issue?",
      "sender": "ai",
      "senderName": "Support Bot"
    }
    // More messages...
  ],
  "page_info": {
    "total_items": 8,
    "limit": 20,
    "skip": 0
  }
}
```

### 4. Get Conversations for an AI Agent

**Endpoint**: `GET /aiagent/{id}/conversation`

**Purpose**: Retrieve conversations handled by a specific AI agent.

**Query Parameters**:
- Same as the List Conversations endpoint

**Response Format**:
- Same as the List Conversations endpoint

### 5. Get Conversations for a User

**Endpoint**: `GET /user/{id}/conversation`

**Purpose**: Retrieve conversations initiated by a specific user.

**Query Parameters**:
- Same as the List Conversations endpoint

**Response Format**:
- Same as the List Conversations endpoint

### 6. Filter Conversations

**Endpoint**: `POST /conversation/filter`

**Purpose**: Apply complex filtering criteria to conversations.

**Request Body**:
```json
{
  "aiAgentIds": ["agent-789", "agent-101"],
  "timeRange": {
    "startDate": "2023-01-01T00:00:00Z",
    "endDate": "2023-01-31T23:59:59Z"
  },
  "status": "active",
  "conclusion": "successful",
  "search": "subscription"
}
```

**Response Format**:
```json
{
  "items": [
    // Conversations matching the criteria
  ],
  "page_info": {
    "total_items": 12,
    "limit": 20,
    "skip": 0
  }
}
```

## API Implementation Details

### Response Formats

1. **Naming Conventions**:
   - The API supports both camelCase and snake_case field names for compatibility
   - Use `decodedMessages` or `decoded_messages` for the message array in conversation responses

2. **Pagination**:
   - When `include_pagination` is true, include a `page_info` object with total_items, limit, and skip
   - Default limit should be 20 items per page if not specified

3. **Error Handling**:
   - Use standard HTTP status codes (200, 400, 401, 403, 404, 500)
   - Include an error object with a message describing the problem

### Critical Fields and Features

For the Conversations tab to function properly, these fields are critical:

1. **Conversation List View**:
   - `thread_id`: Unique conversation identifier
   - `userName`: For displaying who initiated the conversation
   - `aiAgentName`: For displaying which AI handled the conversation
   - `aiAgentType`: For displaying the model/type
   - `created_at`: For sorting and display
   - `updated_at`: For calculating status (active/closed)
   - `conclusion`: For status indicators (successful/unsuccessful/uncertain)
   - `confidence`: For displaying AI confidence level
   - `tags`: For filtering and display

2. **Conversation Detail View**:
   - All conversation fields above plus:
   - `messages` or `decodedMessages`: The actual message content
   - Each message must have:
     - `id`: Unique message identifier
     - `content`: The message text
     - `sender`: Who sent the message ('user' or 'ai')
     - `senderName`: Display name of the sender

### Filtering Capabilities

The API should support filtering conversations by:

1. **Status**: Active vs. closed conversations
2. **Conclusion**: Successful, unsuccessful, or uncertain outcomes
3. **AI Agent**: Specific AI agents that handled conversations
4. **Time Range**: Conversations within a specific date/time range
5. **Text Search**: Search in conversation content or tags

## Example API Usage Flow

1. **Load Conversations List**:
   ```
   GET /conversation?limit=20&skip=0&sort_by=created_at&sort_order=desc&include_pagination=true
   ```

2. **Apply Filters**:
   ```
   POST /conversation/filter
   {
     "aiAgentIds": ["agent-123"],
     "status": "active",
     "conclusion": "uncertain"
   }
   ```

3. **View Conversation Details**:
   ```
   GET /conversation/conv-123?include_messages=true
   ```

4. **Load More Messages** (if pagination is needed for long conversations):
   ```
   GET /conversation/conv-123/messages?skip=20&limit=20
   ```

## CORS Requirements

To allow the frontend to access the API from a different origin, the API server must implement proper CORS (Cross-Origin Resource Sharing) headers:

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-API-KEY, X-Client-ID
```

## Authentication Options

The API should support multiple authentication methods:

1. **JWT Token**: Via `Authorization: Bearer <token>` header
2. **API Key**: Via `X-API-KEY` header with optional `X-Client-ID`
3. **No Authentication**: For development and testing environments



## Appendix: Optional Fields

These fields enhance the user experience but are not critical for basic functionality:

1. **In Conversation List**:
   - `messageCount`: Number of messages exchanged
   - `duration`: How long the conversation lasted
   - `status`: Whether the conversation is active or closed

2. **In Conversation Details**:
   - `resolutionNotes`: Additional context about the outcome
   - `updated_at`: When the conversation was last updated