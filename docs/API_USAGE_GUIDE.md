# Agent Monitor API - Usage Guide

This document provides a comprehensive guide on how to use the Agent Monitor API, including authentication, data models, endpoints, and best practices.

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [API Client Setup](#api-client-setup)
4. [Core Resources](#core-resources)
5. [Common Operations](#common-operations)
6. [Pagination & Filtering](#pagination--filtering)
7. [Data Management](#data-management)
8. [Error Handling](#error-handling)
9. [Considerations & Gaps](#considerations--gaps)
10. [Code Examples](#code-examples)

## Introduction

The Agent Monitor API allows applications to interact with the Agent Monitor system, providing access to conversation data, AI agents, collections, groups, and user management. This API follows RESTful principles and uses JSON for data interchange.

## Authentication

The API supports multiple authentication methods:

### JWT Token Authentication

```python
# Get token through login
token_info = client.login(username="admin", password="password")
# Token is automatically set for future requests
```

### API Key Authentication

```python
# Initialize with API key
client = AgentMonitorClient(
    base_url="http://localhost:8000",
    client_secret="your-api-key",
    client_id="your-client-id"  # Optional
)
```

### Authentication Status

You can check the current authentication status:

```python
auth_status = client.get_auth_status()
```

## API Client Setup

### Installation Requirements

The client requires the following Python packages:
- `requests`
- `python-dotenv` (for loading environment variables)

### Configuration Options

The client can be configured in multiple ways:

1. **Direct parameter configuration**:
   ```python
   client = AgentMonitorClient(
       base_url="http://localhost:8000",
       token="your-jwt-token"  # Optional
   )
   ```

2. **Environment variable configuration**:
   ```
   # .env file
   AGENT_MONITOR_API_HOST=localhost
   AGENT_MONITOR_API_PORT=8000
   ```

   ```python
   # Load from environment variables
   client = AgentMonitorClient()
   ```

## Core Resources

The API is organized around the following core resources:

### Conversations

Conversations represent interactions between users and AI agents. They include metadata and message content.

```python
# Get all conversations
conversations = client.get_conversations()

# Get a specific conversation
conversation = client.get_conversation("conversation-id")

# Create a new conversation
new_conversation = client.create_conversation({
    "threadId": "unique-thread-id",
    "userId": "user-id",
    "aiAgentId": "agent-id",
    "startTimestamp": "2023-05-01T12:00:00Z"
})

# Update a conversation
updated_conversation = client.update_conversation("conversation-id", {
    "endTimestamp": "2023-05-01T12:30:00Z",
    "status": "completed"
})

# Delete a conversation
success = client.delete_conversation("conversation-id")
```

### Collections

Collections are groups of conversations, typically organized by theme, project, or purpose.

```python
# Get all collections
collections = client.get_collections()

# Get a specific collection
collection = client.get_collection("collection-id")

# Create a new collection
new_collection = client.create_collection({
    "name": "Customer Support Conversations",
    "description": "Collection of customer support interactions",
    "ownerId": "user-id"
})

# Update a collection
updated_collection = client.update_collection("collection-id", {
    "description": "Updated description"
})

# Delete a collection
success = client.delete_collection("collection-id")
```

### Groups

Groups organize collections and control access permissions.

```python
# Get all groups
groups = client.get_groups()

# Get a specific group
group = client.get_group("group-id")

# Create a new group
new_group = client.create_group({
    "name": "Analytics Team",
    "description": "Team responsible for conversation analytics",
    "purpose": "analysis"
})

# Update a group
updated_group = client.update_group("group-id", {
    "description": "Updated description"
})

# Delete a group
success = client.delete_group("group-id")
```

### AI Agents

AI Agents represent the AI systems interacting with users in conversations.

```python
# Get all AI agents
agents = client.get_ai_agents()

# Get a specific AI agent
agent = client.get_ai_agent("agent-id")

# Create a new AI agent
new_agent = client.create_ai_agent({
    "name": "Customer Support Bot",
    "description": "AI assistant for customer inquiries",
    "status": "active",
    "modelName": "GPT-4",
    "version": "1.0"
})

# Update an AI agent
updated_agent = client.update_ai_agent("agent-id", {
    "status": "inactive"
})

# Delete an AI agent
success = client.delete_ai_agent("agent-id")
```

### Users

Users represent individuals who interact with the system and have varying permissions.

```python
# Get all users
users = client.get_users()

# Get the current authenticated user
current_user = client.get_current_user()

# Get a specific user
user = client.get_user("user-id")

# Create a new user
new_user = client.create_user({
    "username": "john.doe",
    "email": "john.doe@example.com",
    "role": "analyst"
})

# Update a user
updated_user = client.update_user("user-id", {
    "role": "admin"
})

# Delete a user
success = client.delete_user("user-id")
```

## Common Operations

### Relationship Operations

The API supports various operations to manage relationships between resources:

#### Group Memberships

```python
# Add a user to a group
client.add_user_to_group("group-id", "user-id", "viewer")

# Remove a user from a group
client.remove_user_from_group("group-id", "user-id")

# Add an admin to a group
client.add_admin_to_group("group-id", "user-id")
```

#### Collection Management

```python
# Add a collection to a group
client.add_collection_to_group("group-id", "collection-id")

# Remove a collection from a group
client.remove_collection_from_group("group-id", "collection-id")
```

#### Permission Management

```python
# Get a user's permission level in a group
permission = client.get_user_permission_level("group-id", "user-id")

# Get all users with a specific permission level in a group
users = client.get_users_with_permission_level("group-id", "editor")
```

### Resource Listing by Relationships

The API offers endpoints to list resources based on their relationships:

```python
# Get conversations by collection
conversations = client.get_conversations_by_collection("collection-id")

# Get conversations by AI agent
conversations = client.get_conversations_by_ai_agent("agent-id")

# Get conversations by user
conversations = client.get_conversations_by_user("user-id")

# Get collections by group
collections = client.get_collections_by_group("group-id")

# Get collections by creator
collections = client.get_collections_by_creator("user-id")

# Get groups by admin user
groups = client.get_groups_by_admin_user("user-id")

# Get groups that a user belongs to
groups = client.get_groups_by_user("user-id")

# Get groups by purpose
groups = client.get_groups_by_purpose("evaluation")

# Get AI agents by status
agents = client.get_ai_agents_by_status("active")

# Get users by role
users = client.get_users_by_role("admin")
```

## Pagination & Filtering

### Pagination

Most list endpoints support pagination to efficiently retrieve large datasets:

```python
# Get conversations with pagination
paginated_conversations = client.get_conversations(
    skip=0,
    limit=10,
    include_pagination=True
)

# Access pagination metadata
total_items = paginated_conversations["page_info"]["total_items"]
has_next = paginated_conversations["page_info"]["has_next"]

# Access the items
conversations = paginated_conversations["items"]
```

### Sorting

Many endpoints support sorting by various fields:

```python
# Sort conversations by creation time in descending order
sorted_conversations = client.get_conversations(
    sort_by="createdAt",
    sort_order="desc"
)
```

### Filtering

The API provides several filtering mechanisms:

#### Direct ID Filtering

```python
# Get specific conversations by ID
specific_conversations = client.get_conversations(
    ids=["conversation1", "conversation2"]
)
```

#### Complex Filtering

For more complex filtering, use the dedicated filter endpoint:

```python
# Filter conversations by complex criteria
matching_conversation_ids = client.filter_conversations({
    "dateRange": {
        "start": "2023-01-01T00:00:00Z",
        "end": "2023-01-31T23:59:59Z"
    },
    "userIds": ["user1", "user2"],
    "agentIds": ["agent1"],
    "keywords": ["error", "support"],
    "statuses": ["completed"],
    "minMessages": 5
})
```

## Data Management

### Message Handling

The API stores messages within the conversation's `values` field. To retrieve decoded messages:

```python
# Get a conversation with decoded messages
conversation = client.get_conversation("conversation-id", include_messages=True)

# Access decoded messages
if "decodedMessages" in conversation:
    messages = conversation["decodedMessages"]
    for message in messages:
        print(f"Message from {message['type']}: {message['content']}")
```

### System Operations

The API provides several system-level operations for data management:

```python
# Initialize the data source
client.initialize_system()

# Save data to persistent storage
client.save_data()

# Clear cache
client.clear_cache()
```

### Sample Data Generation

The API includes utilities for generating and managing sample data:

```python
# Generate sample data
client.generate_sample_data(size="medium")  # size can be "small", "medium", or "large"

# Check sample data status
status = client.get_sample_data_status()

# Generate static sample data sets
client.generate_static_sample_data()

# Load static sample data
client.load_static_sample_data(size="medium")

# Save current data as static sample
client.save_current_as_static(size="large")
```

## Error Handling

The client automatically raises exceptions for HTTP errors. For proper error handling:

```python
try:
    result = client.get_conversation("non-existent-id")
except requests.exceptions.HTTPError as e:
    if e.response.status_code == 404:
        print("Conversation not found")
    elif e.response.status_code == 401:
        print("Authentication failed")
    else:
        print(f"API error: {e}")
```

## Considerations & Gaps

### Current Limitations

1. **Message Handling**: Messages are stored within the conversation's `values` field and need special handling to decode.
   - Use `include_messages=True` parameter when fetching conversations to automatically decode messages.
   - The field name for decoded messages might be `decodedMessages` or `decoded_messages`.

2. **Authentication Refresh**: There's no built-in token refresh mechanism. Applications need to handle token expiration and re-authentication.

3. **Bulk Operations**: The API doesn't provide explicit endpoints for bulk creation/deletion of resources. Multiple operations need to be performed sequentially.

4. **Rate Limiting**: The API documentation doesn't specify rate limits. Applications should implement reasonable throttling to avoid overloading the server.

5. **Websocket/Real-time Updates**: The current API doesn't include websocket endpoints for real-time updates. Polling is required to get fresh data.

### Best Practices

1. **Environment Variables**: Store sensitive information like API keys and tokens in environment variables, not directly in the code.

2. **Pagination for Large Data Sets**: Always use pagination when retrieving potentially large datasets.

3. **Error Handling**: Implement comprehensive error handling to gracefully manage API failures.

4. **Resource Cleanup**: Properly manage resources by deleting unused conversations, collections, or groups.

5. **Authentication**: Prefer API key authentication for server-to-server communication and JWT tokens for user-based applications.

## Code Examples

### Complete User Authentication Flow

```python
from dotenv import load_dotenv
import os
import requests
from agent_monitor_client import AgentMonitorClient

# Load environment variables
load_dotenv()

# Initialize client
client = AgentMonitorClient()

# Authenticate
try:
    token_info = client.login(
        username=os.environ.get("AGENT_MONITOR_USERNAME"),
        password=os.environ.get("AGENT_MONITOR_PASSWORD")
    )
    print(f"Authentication successful. Token expires in {token_info.get('expires_in')} seconds.")
    
    # Get current user information
    current_user = client.get_current_user()
    print(f"Logged in as: {current_user.get('username')} (Role: {current_user.get('role')})")
    
except requests.exceptions.HTTPError as e:
    print(f"Authentication failed: {e}")
```

### Creating and Managing a Collection

```python
# Create a new collection
new_collection = client.create_collection({
    "name": "Customer Support Q2 2023",
    "description": "Customer support conversations from Q2 2023",
    "tags": ["support", "q2", "2023"]
})
collection_id = new_collection.get("id")

# Create a new group
new_group = client.create_group({
    "name": "Support Analysis Team",
    "description": "Team analyzing support conversations",
    "purpose": "analysis"
})
group_id = new_group.get("id")

# Add collection to group
client.add_collection_to_group(group_id, collection_id)

# Add users to group
client.add_user_to_group(group_id, "user1-id", "editor")
client.add_user_to_group(group_id, "user2-id", "viewer")

# Fetch all conversations for a specific agent and add them to the collection
support_agent_id = "support-agent-id"
conversations = client.get_conversations_by_ai_agent(support_agent_id)

# Add each conversation to the collection
for conversation in conversations:
    conversation_id = conversation.get("id") or conversation.get("threadId")
    if conversation_id:
        # Update conversation to include collection ID
        client.update_conversation(conversation_id, {
            "collectionIds": [collection_id]
        })

print(f"Collection setup complete. {len(conversations)} conversations added to collection.")
```

### Advanced Filtering Example

```python
# Find conversations with errors or exceptions mentioned
error_conversations = client.filter_conversations({
    "keywords": ["error", "exception", "failed", "crash"],
    "dateRange": {
        "start": "2023-04-01T00:00:00Z",
        "end": "2023-04-30T23:59:59Z" 
    },
    "statuses": ["completed", "error"],
    "minMessages": 3
})

print(f"Found {len(error_conversations)} conversations with potential errors.")

# Get full details for each conversation with errors
for conversation_id in error_conversations:
    conversation = client.get_conversation(conversation_id, include_messages=True)
    
    # Look for error messages
    if "decodedMessages" in conversation:
        messages = conversation["decodedMessages"]
        for message in messages:
            content = message.get("content", "")
            if any(keyword in content.lower() for keyword in ["error", "exception", "failed"]):
                print(f"Error found in conversation {conversation_id}:")
                print(f"  Message: {content[:100]}...")
```

### Sample Data Management

```python
# Check if sample data exists
status = client.get_sample_data_status()

if not status.get("has_data"):
    print("Generating sample data...")
    # Generate medium-sized sample data
    result = client.generate_sample_data(size="medium")
    print(f"Sample data generated: {result.get('message')}")
    
    # Save current state as static sample
    client.save_current_as_static(size="medium")
    print("Current data saved as static sample.")
else:
    print("Sample data already exists.")

# Load static sample data
client.load_static_sample_data(size="small")
print("Small static sample data loaded.")
```