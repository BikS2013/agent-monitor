# Conversations API Update Summary

This document summarizes the changes made to align the Conversations API implementation with the official API specification.

## Endpoint Changes

### Base Path Update
- **Old**: `/conversations/` (plural)
- **New**: `/conversation` (singular)

### Updated Endpoints

1. **List Conversations**
   - Path: `GET /conversation`
   - Query params: `ids`, `skip`, `limit`, `sortBy`, `sortOrder`, `includePagination`, `includeMessages`

2. **Get Conversation**
   - Path: `GET /conversation/{thread_id}`
   - Query params: `includeMessages`

3. **Create Conversation**
   - Path: `POST /conversation`

4. **Update Conversation**
   - Path: `PUT /conversation/{thread_id}`

5. **Delete Conversation**
   - Path: `DELETE /conversation/{thread_id}`

6. **Filter Conversations**
   - Path: `POST /conversation/filter`

7. **Conversation Messages**
   - Get messages: `GET /conversation/{thread_id}/messages`
   - Add message: `POST /conversation/{thread_id}/messages`
   - Get specific message: `GET /conversation/{thread_id}/messages/{message_id}`
   - Update message: `PUT /conversation/{thread_id}/messages/{message_id}`
   - Delete message: `DELETE /conversation/{thread_id}/messages/{message_id}`

8. **Related Endpoints**
   - By AI Agent: `GET /aiagent/{id}/conversation`
   - By User: `GET /user/{id}/conversation`
   - By Collection: `GET /collection/{id}/conversation`

## Parameter Name Changes

### Query Parameters
- `sort_by` → `sortBy`
- `sort_order` → `sortOrder`
- `include_pagination` → `includePagination`
- `include_messages` → `includeMessages`

### Response Fields
The API supports both camelCase and snake_case field names for compatibility:
- `thread_id` / `threadId`
- `user_id` / `userId`
- `user_name` / `userName`
- `ai_agent_id` / `aiAgentId`
- `ai_agent_name` / `aiAgentName`
- `ai_agent_type` / `aiAgentType`
- `created_at` / `createdAt`
- `updated_at` / `updatedAt`
- `decoded_messages` / `decodedMessages`
- `message_count` / `messageCount`
- `resolution_notes` / `resolutionNotes`

## Response Format

### List Response
```json
{
  "items": [
    {
      "threadId": "conv-123",
      "userId": "user-456",
      "userName": "John Doe",
      "aiAgentId": "agent-789",
      "aiAgentName": "Support Bot",
      "status": "active",
      "conclusion": "uncertain",
      "createdAt": "2023-01-01T12:00:00Z",
      "tags": ["billing"],
      "confidence": "85"
    }
  ],
  "pageInfo": {
    "totalItems": 150,
    "limit": 20,
    "skip": 0
  }
}
```

### Detail Response with Messages
When `includeMessages=true`:
```json
{
  "threadId": "conv-123",
  "userId": "user-456",
  "userName": "John Doe",
  "aiAgentId": "agent-789",
  "aiAgentName": "Support Bot",
  "status": "active",
  "decodedMessages": [
    {
      "id": "msg-001",
      "content": "Hello, I need help",
      "sender": "user",
      "senderName": "John Doe"
    }
  ]
}
```

## Testing

A test script has been created at `src/tests/test-conversation-api.js` to verify the API endpoints:

```bash
# Run with default settings
node src/tests/test-conversation-api.js

# Run with custom API URL
API_BASE_URL=http://api.example.com node src/tests/test-conversation-api.js

# Run with authentication
AUTH_TOKEN=your-token node src/tests/test-conversation-api.js

# Run without authentication
NO_AUTH=true node src/tests/test-conversation-api.js
```

## Implementation Files Updated

1. **ApiClient.ts** - Updated all conversation-related endpoints
2. **ConversationsApiDataSource.ts** - Updated to handle new response formats and implement CRUD operations
3. **test-conversation-api.js** - Created for testing the API endpoints