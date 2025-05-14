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
  collectionIds: string[];               // IDs of collections in this group
  adminIds: string[];                    // IDs of users with admin rights
  userIds: string[];                     // IDs of users who can access this group
  createdAt: string;                     // When group was created (ISO format)
  updatedAt?: string;                    // When group was last updated (ISO format)
  metadata: Record<string, any>;         // Additional metadata
  isPrivate: boolean;                    // Whether the group is private
}
```

the fields collectionIds, adminIds, userIds, permissionLevels are not used to transfer data. They are used at the client side to keep track of collections, admins, and users through the various API calls. 

### Collection (Referenced Model)

```typescript
interface Collection {
  id: string;                     // Unique identifier
  name: string;                   // Collection name
  description: string;            // Collection description
  createdAt: string;              // When collection was created (ISO format)
  updatedAt?: string;             // When collection was last updated (ISO format)
  ownerId: string;                // ID of the user who owns the collection
  creator: string;                // ID or name of the user who created the collection
  conversations: string[];        // Array of conversation thread_ids in this collection
  isPublic: boolean;              // Whether the collection is publicly accessible
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
  fullName: string;               // User's full name
  role: 'admin' | 'supervisor' | 'executive'; // User's role
  permissions: string[];          // Array of permission strings
  createdAt: string;              // When user was created
  lastActive: string;             // When user was last active
  isActive: boolean;              // Whether the user is active
}
```

`  permissionLevels: Record<string, string>; // User permissions by user ID` 


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
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-15T09:30:00Z",
      "metadata": {
        "totalCollections": 3,
        "totalConversations": 42
      },
      "isPrivate": true
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
  "createdAt": "2023-01-01T12:00:00Z",
  "updatedAt": "2023-01-15T09:30:00Z",
  "metadata": {
    "totalCollections": 3,
    "totalConversations": 42,
    "activeUsers": 5,
    "lastActivity": "2023-01-15T14:30:00Z"
  },
  "isPrivate": true
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
  "collectionIds": ["coll-4", "coll-5"],
  "adminIds": ["user-123"],
  "userIds": ["user-123", "user-789"],
  "isPrivate": true
}
```

**Response Format**:
```json
{
  "id": "group-456",
  "name": "Efficiency Analysis Group",
  "description": "Group for analyzing agent efficiency",
  "purpose": "efficiency",
  "collectionIds": ["coll-4", "coll-5"],
  "adminIds": ["user-123"],
  "userIds": ["user-123", "user-789"],
  "permissionLevels": {
    "user-123": "full",
    "user-789": "read"
  },
  "createdAt": "2023-01-20T10:00:00Z",
  "updatedAt": "2023-01-20T10:00:00Z",
  "metadata": {
    "totalCollections": 2,
    "totalConversations": 18
  },
  "isPrivate": true
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
  "permissionLevels": {
    "user-123": "full",
    "user-789": "read"
  },
  "createdAt": "2023-01-20T10:00:00Z",
  "updatedAt": "2023-01-20T11:30:00Z",
  "metadata": {
    "totalCollections": 3,
    "totalConversations": 28
  },
  "isPrivate": true
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
- `sort_by` (optional): Field to sort by (e.g., name, createdAt)
- `sort_order` (optional): Sort direction ('asc' or 'desc')
- `include_pagination` (optional): Whether to include pagination metadata

**Response Format**:
```json
{
  "items": [
    {
      "id": "coll-4",
      "name": "High Efficiency Conversations",
      "description": "Collection of conversations with high efficiency scores",
      "createdAt": "2023-01-10T09:00:00Z",
      "updatedAt": "2023-01-15T09:30:00Z",
      "ownerId": "user-123",
      "creator": "John Doe",
      "isPublic": false,
      "tags": ["efficiency", "high-score"]
    },
    // More collections...
  ],
  "page_info": {
    "total_items": 3,
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
      "permissionLevels": {
        "user-123": "full",
        "user-456": "read"
      },
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-15T09:30:00Z",
      "isPrivate": true
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
   - Optionally include pagination metadata when `include_pagination=true`

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
     "isPrivate": true
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
   - `collectionIds`: Count of collections for display
   - `adminIds`: Count of admins for display
   - `isPrivate`: Whether the group is private

2. **Group Detail View**:
   - All fields from the list view plus:
   - `collectionIds`: IDs of collections in this group
   - Access to the actual collection objects
   
3. **Group Creation/Editing**:
   - Support for all group fields
   - Ability to select collections to include
   - Ability to set group purpose
   - Setting privacy via `isPrivate`

4. **User Permissions**:
   - `adminIds`: List of users with admin rights
   - `userIds`: List of users who can access the group
   - `permissionLevels`: Permissions for each user

## Authentication Options

The API supports multiple authentication methods:

1. **JWT Token**: Via `Authorization: Bearer <token>` header
2. **API Key**: Via `X-API-KEY` header with optional `X-Client-ID`
3. **No Authentication**: For development and testing environments as described in NOAUTH_IMPLEMENTATION.md

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
  "permissionLevels": {
    "user-123": "full"
  }
}
```

### Read-Only Access

```json
{
  "permissionLevels": {
    "user-456": "read"
  }
}
```

### Mixed Access Levels

```json
{
  "permissionLevels": {
    "user-123": "full",
    "user-456": "read",
    "user-789": "write"
  }
}
```