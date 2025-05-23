# Agent Monitor Groups API Specification

This document provides a comprehensive specification of the API requirements for the Groups tab in the Agent Monitor application.

## Overview

The Groups tab allows users to create, view, and manage groups of collections. Groups help organize collections based on their purpose (evaluation, security, efficiency) and control access permissions for different users.

## Data Models

### Group

```typescript
interface Group {
  id: string;                            // Unique identifier
  name: string;                          // Group name
  description: string;                   // Group description
  purpose: 'evaluation' | 'security' | 'efficiency';  // Primary purpose of the group
  collection_ids: string[];              // IDs of collections in this group
  admin_ids: string[];                   // IDs of users with admin rights
  user_ids: string[];                    // IDs of users who can access this group
  created_at: string;                    // When group was created (ISO format)
  updated_at?: string;                   // When group was last updated (ISO format)
  metadata: Record<string, any>;         // Additional metadata
  is_private: boolean;                   // Whether the group is private
}
```

the fields collection_ids, admin_ids, user_ids, permission_levels are not used to transfer data. They are used at the client side to keep track of collections, admins, and users through the various API calls. 

### Collection (Referenced Model)

```typescript
interface Collection {
  id: string;                     // Unique identifier
  name: string;                   // Collection name
  description: string;            // Collection description
  created_at: string;             // When collection was created (ISO format)
  updated_at?: string;            // When collection was last updated (ISO format)
  owner_id: string;               // ID of the user who owns the collection
  creator: string;                // ID or name of the user who created the collection
  conversations: string[];        // Array of conversation thread_ids in this collection
  is_public: boolean;             // Whether the collection is publicly accessible
  tags: string[];                 // Tags associated with this collection
}
```

### User (Referenced Model)

```typescript
interface User {
  id: string;                     // Unique identifier
  name: string;                   // User's name
  username: string;               // User's username for login
  email: string;                  // User's email
  full_name: string;              // User's full name
  role: 'admin' | 'supervisor' | 'executive'; // User's role
  permissions: string[];          // Array of permission strings
  created_at: string;             // When user was created
  last_active: string;            // When user was last active
  is_active: boolean;             // Whether the user is active
}
```

`  permission_levels: Record<string, string>; // User permissions by user ID` 


## Required API Endpoints

### 1. List Groups

**Endpoint**: `GET /group`

**Purpose**: Retrieve a list of all groups with optional filtering.

**Query Parameters**:
- `ids` (optional): Comma-separated list of group IDs to retrieve specific groups

**Response Format**:
```json
{
  "items": [
    {
      "id": "group-123",
      "name": "Security Review Group",
      "description": "Group for reviewing security-related conversations",
      "purpose": "security",
      "created_at": "2023-01-01T12:00:00Z",
      "updated_at": "2023-01-15T09:30:00Z",
      "metadata": {
        "totalCollections": 3,
        "totalConversations": 42
      },
      "is_private": true
    }
    // More groups...
  ]
}
```

### 2. Get Group Details

**Endpoint**: `GET /group/{id}`

**Purpose**: Retrieve detailed information about a specific group.

**Response Format**:
```json
{
  "id": "group-123",
  "name": "Security Review Group",
  "description": "Group for reviewing security-related conversations",
  "purpose": "security",
  "created_at": "2023-01-01T12:00:00Z",
  "updated_at": "2023-01-15T09:30:00Z",
  "metadata": {
    "totalCollections": 3,
    "totalConversations": 42,
    "activeUsers": 5,
    "lastActivity": "2023-01-15T14:30:00Z"
  },
  "is_private": true
}
```

### 3. Create Group

**Endpoint**: `POST /group`

**Purpose**: Create a new group.

**Request Body**:
```json
{
  "name": "Efficiency Analysis Group",
  "description": "Group for analyzing agent efficiency",
  "purpose": "efficiency",
  "collection_ids": ["coll-4", "coll-5"],
  "admin_ids": ["user-123"],
  "user_ids": ["user-123", "user-789"],
  "is_private": true
}
```

**Response Format**:
```json
{
  "id": "group-456",
  "name": "Efficiency Analysis Group",
  "description": "Group for analyzing agent efficiency",
  "purpose": "efficiency",
  "collection_ids": ["coll-4", "coll-5"],
  "admin_ids": ["user-123"],
  "user_ids": ["user-123", "user-789"],
  "permission_levels": {
    "user-123": "full",
    "user-789": "read"
  },
  "created_at": "2023-01-20T10:00:00Z",
  "updated_at": "2023-01-20T10:00:00Z",
  "metadata": {
    "totalCollections": 2,
    "totalConversations": 18
  },
  "is_private": true
}
```

### 4. Update Group

**Endpoint**: `PUT /group/{id}`

**Purpose**: Update an existing group.

**Request Body**:
```json
{
  "name": "Efficiency Analysis Group (Updated)",
  "description": "Updated description",
  "purpose": "efficiency",
  "collectionIds": ["coll-4", "coll-5", "coll-6"]
}
```

**Response Format**:
```json
{
  "id": "group-456",
  "name": "Efficiency Analysis Group (Updated)",
  "description": "Updated description",
  "purpose": "efficiency",
  "collectionIds": ["coll-4", "coll-5", "coll-6"],
  "adminIds": ["user-123"],
  "userIds": ["user-123", "user-789"],
  "permission_levels": {
    "user-123": "full",
    "user-789": "read"
  },
  "created_at": "2023-01-20T10:00:00Z",
  "updated_at": "2023-01-20T11:30:00Z",
  "metadata": {
    "totalCollections": 3,
    "totalConversations": 28
  },
  "is_private": true
}
```

### 5. Delete Group

**Endpoint**: `DELETE /group/{id}`

**Purpose**: Delete a group.

**Response Format**:
```json
{
  "success": true
}
```

### 6. Get Collections in Group

**Endpoint**: `GET /group/{id}/collection`

**Purpose**: Retrieve the collections in a specific group.

**Query Parameters**:
- `skip` (optional): Number of records to skip (for pagination)
- `limit` (optional): Maximum number of records to return (for pagination)
- `sortBy` (optional): Field to sort by (e.g., name, created_at)
- `sortOrder` (optional): Sort direction ('asc' or 'desc')
- `includePagination` (optional): Whether to include pagination metadata

**Response Format**:
```json
{
  "items": [
    {
      "id": "coll-4",
      "name": "High Efficiency Conversations",
      "description": "Collection of conversations with high efficiency scores",
      "created_at": "2023-01-10T09:00:00Z",
      "updated_at": "2023-01-15T09:30:00Z",
      "owner_id": "user-123",
      "creator": "John Doe",
      "is_public": false,
      "tags": ["efficiency", "high-score"]
    },
    // More collections...
  ],
  "pageInfo": {
    "totalItems": 3,
    "limit": 20,
    "skip": 0
  }
}
```

### 7. Add Collection to Group

**Endpoint**: `POST /group/{id}/collection`

**Purpose**: Add a collection to a group.

**Request Body**:
```json
{
  "collectionId": "coll-7"
}
```

**Response Format**:
```json
{
  "success": true,
  "group": {
    "id": "group-456",
    "name": "Efficiency Analysis Group",
    "collectionIds": ["coll-4", "coll-5", "coll-6", "coll-7"]
  }
}
```

### 8. Remove Collection from Group

**Endpoint**: `DELETE /group/{id}/collection/{collectionId}`

**Purpose**: Remove a collection from a group.

**Response Format**:
```json
{
  "success": true,
  "group": {
    "id": "group-456",
    "name": "Efficiency Analysis Group",
    "collectionIds": ["coll-4", "coll-5", "coll-7"]
  }
}
```

### 9. Get Groups by Admin User

**Endpoint**: `GET /user/{id}/admin-group`

**Purpose**: Retrieve groups where a user is an admin.

**Response Format**:
```json
{
  "items": [
    {
      "id": "group-123",
      "name": "Security Review Group",
      "description": "Group for reviewing security-related conversations",
      "purpose": "security",
      "collectionIds": ["coll-1", "coll-2", "coll-3"],
      "adminIds": ["user-123"],
      "userIds": ["user-123", "user-456"],
      "permission_levels": {
        "user-123": "full",
        "user-456": "read"
      },
      "created_at": "2023-01-01T12:00:00Z",
      "updated_at": "2023-01-15T09:30:00Z",
      "is_private": true
    }
    // More groups...
  ]
}
```

### 10. Check User Permission

**Endpoint**: `GET /group/{id}/user/{userId}/permission`

**Purpose**: Check if a user has a specific permission for a group.

**Query Parameters**:
- `permission`: Permission to check (e.g., 'read', 'write', 'full')

**Response Format**:
```json
{
  "hasPermission": true,
  "permissionLevel": "full"
}
```

## API Implementation Details

### Group Purpose

Groups are categorized by their purpose, which affects how they're displayed in the UI:

1. **Evaluation**: Groups focused on evaluating AI agent performance
2. **Security**: Groups focused on security review and monitoring
3. **Efficiency**: Groups focused on analyzing and improving efficiency

### Permission Levels

The API supports the following permission levels:

1. **full**: Full access to group, including adding/removing collections and users
2. **write**: Can modify collections but not group membership
3. **read**: Read-only access to group collections

### Response Format

The API supports both single-object and collection responses:

1. **Single Object Responses**:
   - Return the object directly: `{ id: "group-123", name: "Group 1", ... }`

2. **Collection Responses**:
   - Return an array of objects in an `items` property
   - Optionally include pagination metadata when `includePagination=true`

### CORS Requirements

To allow the frontend to access the API from a different origin, the API server must implement proper CORS headers:

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-API-KEY, X-Client-ID
```

## Example API Usage Flow

1. **User Opens Groups Tab**:
   ```
   GET /group
   ```

2. **User Views a Group**:
   ```
   GET /group/group-123
   GET /group/group-123/collection?limit=20
   ```

3. **User Creates a New Group**:
   ```
   POST /group
   {
     "name": "Evaluation Team Group",
     "description": "Group for the evaluation team",
     "purpose": "evaluation",
     "collectionIds": ["coll-1", "coll-2"],
     "adminIds": ["user-123"],
     "userIds": ["user-123", "user-456"],
     "is_private": true
   }
   ```

4. **User Adds a Collection to the Group**:
   ```
   POST /group/group-123/collection
   {
     "collectionId": "coll-3"
   }
   ```

5. **User Navigates to a Collection from the Group**:
   ```
   GET /collection/coll-3
   ```

## Critical Fields and Features

For the Groups tab to function properly, these fields are critical:

1. **Group List View**:
   - `id`: Unique group identifier
   - `name`: For displaying the group name
   - `description`: For displaying group description
   - `purpose`: To control the display style/icon
   - `collection_ids`: Count of collections for display
   - `admin_ids`: Count of admins for display
   - `is_private`: Whether the group is private

2. **Group Detail View**:
   - All fields from the list view plus:
   - `collection_ids`: IDs of collections in this group
   - Access to the actual collection objects
   
3. **Group Creation/Editing**:
   - Support for all group fields
   - Ability to select collections to include
   - Ability to set group purpose
   - Setting privacy via `is_private`

4. **User Permissions**:
   - `admin_ids`: List of users with admin rights
   - `user_ids`: List of users who can access the group
   - `permission_levels`: Permissions for each user

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

### Group Access Control

When authentication is enabled:
- Group admins have full access to their groups
- Group members have read access to their groups
- Private groups require membership for access
- Public groups can be viewed by any authenticated user

## Common API Patterns

### Collection References

Groups contain references to collections via their `collectionIds` array. The API should:

1. Support retrieving referenced collections via the `/group/{id}/collection` endpoint
2. Support adding/removing collections via dedicated endpoints
3. Validate collection IDs when they're added to a group

### User Permissions

Groups define permissions for users. The API should:

1. Support checking permissions via the `/group/{id}/user/{userId}/permission` endpoint
2. Enforce permissions for all group operations
3. Automatically add admin users to the permission levels map with 'full' permission

## Appendix: Permission Level Examples

### Full Access

```json
{
  "permission_levels": {
    "user-123": "full"
  }
}
```

### Read-Only Access

```json
{
  "permission_levels": {
    "user-456": "read"
  }
}
```

### Mixed Access Levels

```json
{
  "permission_levels": {
    "user-123": "full",
    "user-456": "read",
    "user-789": "write"
  }
}
```

## Database Support Requirements

### Schema Requirements

To implement the Groups API, the following database schema considerations are required:

1. **Group Table**:
   - Primary key: `id` (string, UUID preferred)
   - Required fields: `name`, `description`, `purpose`, `created_at`, `is_private`
   - JSON field: `metadata` should be stored as a JSON object to support additional properties
   - Indexed fields: `purpose`, `created_at`, `is_private` (for efficient querying)
   - Text search fields: `name`, `description` (for search functionality)

2. **Group-Collection Relationships Table**:
   - Many-to-many relationship between groups and collections
   - Fields: `group_id`, `collection_id`, `added_at`
   - Enforces referential integrity between groups and collections

3. **Group User Permissions Table**:
   - Maintains fine-grained access control for users
   - Fields: `group_id`, `user_id`, `permission_level`, `granted_at`
   - Supports the three permission levels (full, write, read)
   - Allows efficient querying of groups by user access

### Database Operations

The Groups API requires the following database operation capabilities:

1. **Relationship Management**:
   - Efficient adding/removing of collections to/from groups
   - Managing user permissions for groups
   - Querying groups by user access levels

2. **Transaction Support**:
   - For maintaining consistency when updating group memberships
   - For ensuring user permission changes are atomic

3. **Performance Considerations**:
   - Efficient querying for groups with large numbers of collections
   - Support for pagination when retrieving collections in a group
   - Fast retrieval of groups by purpose, creation date, or ownership

### Recommended Database Types

Based on the requirements, the following database types are recommended:

1. **Relational Databases** (PostgreSQL, MySQL):
   - Strong support for complex relationships
   - JSONB support (especially PostgreSQL) for the `metadata` field
   - Efficient indexing and query optimization
   - Transaction support for data consistency

2. **Document Databases** (MongoDB):
   - Native JSON storage for `metadata`
   - Flexible schema for evolving data models
   - Good performance for read-heavy operations

### PostgreSQL Implementation Scripts

The following SQL scripts create the necessary database schema for implementing the Groups API in PostgreSQL:

```sql
-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Groups Table
CREATE TABLE group (
    id UUID PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    purpose VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    is_private BOOLEAN DEFAULT TRUE
);

-- Create indexes for groups table
CREATE INDEX idx_groups_created_at ON group(created_at);
CREATE INDEX idx_groups_is_private ON group(is_private);
CREATE INDEX idx_groups_name_description ON group USING GIN (to_tsvector('english', name || ' ' || description));

-- Group-Collection relationship table
CREATE TABLE group_collections (
    group_id UUID NOT NULL,
    collection_id UUID NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, collection_id)
);

-- Group User Permissions table
CREATE TABLE group_user_permissions (
    group_id UUID NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    permission_level VARCHAR(20) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id)
);

-- Create indexes for permissions table
CREATE INDEX idx_group_permissions_user_id ON group_user_permissions(user_id);
CREATE INDEX idx_group_permissions_is_admin ON group_user_permissions(is_admin);
```

### Implementation Considerations

1. **Caching Strategy**:
   - Cache group metadata and permission information to reduce database load
   - Consider invalidation strategies when group memberships change

2. **Search Optimization**:
   - Implement full-text search capabilities for finding groups by name, description
   - Use specialized indexes for frequently used queries (e.g., groups by purpose)

3. **Migration Strategy**:
   - Plan for schema evolution as the Groups API matures
   - Consider using database migration tools for version control of schema changes