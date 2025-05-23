# Agent Monitor Conversations API Specification

This document provides a comprehensive specification of the API requirements for the Conversations tab in the Agent Monitor application.

## Overview

The Conversations tab allows users to browse, filter, and view detailed conversation data between users and AI agents. It requires a set of API endpoints that provide access to conversations, messages, and related entities.

## Data Models

### Conversation

```typescript
interface Conversation {
  threadId: string;                 // Unique identifier
  userId: string;                   // ID of the user who initiated the conversation
  userName: string;                 // Display name of the user
  aiAgentId: string;                // ID of the AI agent
  aiAgentName: string;              // Display name of the AI agent
  aiAgentType: string;              // Type/model of the AI agent
  status: 'active' | 'closed';      // Current status
  conclusion: 'successful' | 'unsuccessful' | 'uncertain'; // Outcome status (default: 'uncertain')
  createdAt: string;                // When conversation was created (ISO format)
  updatedAt?: string;               // When conversation was last updated (ISO format)
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
- `sortBy` (optional): Field to sort by (e.g., startTimestamp, priority)
- `sortOrder` (optional): Sort direction ('asc' or 'desc')
- `includePagination` (optional): Whether to include pagination metadata in response
- `includeMessages` (optional): Whether to include decoded messages in response

**Response Format**:
```json
{
  "items": [
    {
      "threadId": "conv-123",
      "userId": "user-456",
      "userName": "John Doe",
      "aiAgentId": "agent-789",
      "aiAgentName": "Support Bot",
      "aiAgentType": "customer-support",
      "status": "active",
      "conclusion": "uncertain",
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-01T12:15:23Z",
      "tags": ["billing", "subscription"],
      "duration": "15m",
      "messageCount": 8,
      "confidence": "85"
    }
    // More conversations...
  ],
  "pageInfo": {
    "totalItems": 150,
    "limit": 20,
    "skip": 0
  }
}
```

### 2. Get Conversation Details

**Endpoint**: `GET /conversation/{thread_id}`

**Purpose**: Retrieve detailed information about a specific conversation.

**Query Parameters**:
- `includeMessages` (optional): Whether to include decoded messages (default: false)

**Response Format**:
```json
{
  "threadId": "conv-123",
  "userId": "user-456",
  "userName": "John Doe",
  "aiAgentId": "agent-789",
  "aiAgentName": "Support Bot",
  "aiAgentType": "customer-support",
  "status": "active",
  "conclusion": "uncertain",
  "createdAt": "2023-01-01T12:00:00Z",
  "updatedAt": "2023-01-01T12:15:23Z",
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

**Endpoint**: `GET /conversation/{thread_id}/messages`

**Purpose**: Retrieve messages for a specific conversation.

**Query Parameters**:
- `skip` (optional): Number of records to skip (for pagination)
- `limit` (optional): Maximum number of records to return (for pagination)
- `sortBy` (optional): Field to sort by (default: timestamp)
- `sortOrder` (optional): Sort direction ('asc' or 'desc', default: 'asc')

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
  "pageInfo": {
    "totalItems": 8,
    "limit": 20,
    "skip": 0
  }
}
```

### 4. Create Conversation

**Endpoint**: `POST /conversation`

**Purpose**: Create a new conversation.

**Request Body**:
```json
{
  "userId": "user-456",
  "userName": "John Doe",
  "aiAgentId": "agent-789",
  "aiAgentName": "Support Bot",
  "aiAgentType": "customer-support",
  "tags": ["billing", "subscription"],
  "initialMessage": "Hello, I need help with my subscription",
  "confidence": "75"
}
```

**Response Format**:
```json
{
  "threadId": "conv-123",
  "userId": "user-456",
  "userName": "John Doe",
  "aiAgentId": "agent-789",
  "aiAgentName": "Support Bot",
  "aiAgentType": "customer-support",
  "status": "active",
  "conclusion": "uncertain",
  "createdAt": "2023-01-01T12:00:00Z",
  "tags": ["billing", "subscription"],
  "duration": "00:00:00",
  "messageCount": 1,
  "confidence": "75"
}
```

### 5. Update Conversation

**Endpoint**: `PUT /conversation/{thread_id}`

**Purpose**: Update an existing conversation.

**Request Body**:
```json
{
  "status": "closed",
  "conclusion": "successful",
  "tags": ["billing", "subscription", "resolved"],
  "resolutionNotes": "Issue resolved successfully"
}
```

**Response Format**:
```json
{
  "threadId": "conv-123",
  "userId": "user-456",
  "userName": "John Doe",
  "aiAgentId": "agent-789",
  "aiAgentName": "Support Bot",
  "aiAgentType": "customer-support",
  "status": "closed",
  "conclusion": "successful",
  "createdAt": "2023-01-01T12:00:00Z",
  "updatedAt": "2023-01-01T12:30:00Z",
  "tags": ["billing", "subscription", "resolved"],
  "resolutionNotes": "Issue resolved successfully",
  "duration": "00:30:00",
  "messageCount": 8,
  "confidence": "85"
}
```

### 6. Delete Conversation

**Endpoint**: `DELETE /conversation/{thread_id}`

**Purpose**: Delete a conversation.

**Response**: 204 No Content

### 7. Add Message to Conversation

**Endpoint**: `POST /conversation/{thread_id}/messages`

**Purpose**: Add a new message to a conversation.

**Request Body**:
```json
{
  "content": "Thank you for your help!",
  "sender": "user",
  "senderName": "John Doe"
}
```

**Response Format**:
```json
{
  "id": "msg-003",
  "content": "Thank you for your help!",
  "sender": "user",
  "senderName": "John Doe"
}
```

### 8. Get Specific Message

**Endpoint**: `GET /conversation/{thread_id}/messages/{message_id}`

**Purpose**: Retrieve a specific message from a conversation.

**Response Format**:
```json
{
  "id": "msg-001",
  "content": "Hello, I need help with my subscription",
  "sender": "user",
  "senderName": "John Doe"
}
```

### 9. Update Message

**Endpoint**: `PUT /conversation/{thread_id}/messages/{message_id}`

**Purpose**: Update a message in a conversation.

**Request Body**:
```json
{
  "content": "Hello, I need help with my subscription billing"
}
```

**Response Format**:
```json
{
  "id": "msg-001",
  "content": "Hello, I need help with my subscription billing",
  "sender": "user",
  "senderName": "John Doe"
}
```

### 10. Delete Message

**Endpoint**: `DELETE /conversation/{thread_id}/messages/{message_id}`

**Purpose**: Delete a message from a conversation.

**Response**: 204 No Content

### 11. Get Conversations for an AI Agent

**Endpoint**: `GET /aiagent/{id}/conversation`

**Purpose**: Retrieve conversations handled by a specific AI agent.

**Query Parameters**:
- Same as the List Conversations endpoint

**Response Format**:
- Same as the List Conversations endpoint

### 12. Get Conversations for a User

**Endpoint**: `GET /user/{id}/conversation`

**Purpose**: Retrieve conversations initiated by a specific user.

**Query Parameters**:
- Same as the List Conversations endpoint

**Response Format**:
- Same as the List Conversations endpoint

### 13. Filter Conversations

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
  "pageInfo": {
    "totalItems": 12,
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
   - `threadId`: Unique conversation identifier
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
   GET /conversation?limit=20&skip=0&sortBy=created_at&sortOrder=desc&includePagination=true
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
   GET /conversation/conv-123?includeMessages=true
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

The API supports configurable authentication that can be adjusted per environment. See the main Authentication documentation for full details on the three authentication modes: **required**, **optional** (default), and **disabled**.

### Quick Configuration

```bash
# Production - authentication required
AUTH_MODE=required

# Development - authentication optional (default)
AUTH_MODE=optional

# Testing - authentication disabled
AUTH_MODE=disabled
```

### Conversation Access Control

When authentication is enabled:
- Users can access conversations they initiated
- AI agent owners can access conversations handled by their agents
- Admin users can access all conversations



## Appendix: Optional Fields

These fields enhance the user experience but are not critical for basic functionality:

1. **In Conversation List**:
   - `messageCount`: Number of messages exchanged
   - `duration`: How long the conversation lasted
   - `status`: Whether the conversation is active or closed

2. **In Conversation Details**:
   - `resolutionNotes`: Additional context about the outcome
   - `updated_at`: When the conversation was last updated