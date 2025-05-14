# Agent Monitor User API Specification

This document provides a comprehensive specification of the API requirements for user management in the Agent Monitor application.

## Overview

The User API supports authentication, user management, and access control for the Agent Monitor application. It allows the system to manage users with different roles and permissions, enabling proper access control for conversations, collections, groups, and AI agents.

## Data Models

### User

```typescript
interface User {
  id: string;                     // Unique identifier
  name: string;                   // User's display name
  username: string;               // User's username for login
  email: string;                  // User's email address
  fullName: string;               // User's full name
  role: 'admin' | 'supervisor' | 'executive'; // User's role
  permissions: string[];          // Array of permission strings
  createdAt: string;              // When user was created (ISO format)
  lastActive: string;             // When user was last active
  isActive: boolean;              // Whether the user is active
  department?: string;            // Optional department affiliation
  avatar?: string;                // Optional URL to user avatar image
  metadata?: Record<string, any>; // Additional metadata about the user
}
```

### Permission

```typescript
interface Permission {
  id: string;                     // Unique identifier
  name: string;                   // Permission name (e.g., "manage_users")
  description: string;            // Description of the permission
  category: string;               // Functional category (e.g., "user", "collection", "group")
}
```

### Role

```typescript
interface Role {
  id: string;                     // Unique identifier
  name: string;                   // Role name (e.g., "admin")
  description: string;            // Description of the role
  permissions: string[];          // Array of permission IDs
}
```

## Required API Endpoints

### 1. List Users

**Endpoint**: `GET /user`

**Purpose**: Retrieve a list of all users with optional filtering.

**Query Parameters**:
- `ids` (optional): Comma-separated list of user IDs to retrieve specific users
- `role` (optional): Filter by role ('admin', 'supervisor', 'executive')
- `isActive` (optional): Filter by active status (true, false)
- `search` (optional): Search by name, username, email
- `sort_by` (optional): Field to sort by (e.g., name, createdAt)
- `sort_order` (optional): Sort direction ('asc' or 'desc')
- `skip` (optional): Number of records to skip (for pagination)
- `limit` (optional): Maximum number of records to return (for pagination)
- `include_pagination` (optional): Whether to include pagination metadata

**Response Format**:
```json
{
  "items": [
    {
      "id": "user-123",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "fullName": "John Michael Doe",
      "role": "supervisor",
      "permissions": ["view_conversations", "manage_collections"],
      "createdAt": "2023-01-01T12:00:00Z",
      "lastActive": "2023-05-15T14:30:00Z",
      "isActive": true,
      "department": "Customer Support"
    }
    // More users...
  ],
  "page_info": {
    "total_items": 50,
    "limit": 20,
    "skip": 0
  }
}
```

### 2. Get User Details

**Endpoint**: `GET /user/{id}`

**Purpose**: Retrieve detailed information about a specific user.

**Response Format**:
```json
{
  "id": "user-123",
  "name": "John Doe",
  "username": "johndoe",
  "email": "john.doe@example.com",
  "fullName": "John Michael Doe",
  "role": "supervisor",
  "permissions": ["view_conversations", "manage_collections"],
  "createdAt": "2023-01-01T12:00:00Z",
  "lastActive": "2023-05-15T14:30:00Z",
  "isActive": true,
  "department": "Customer Support",
  "avatar": "https://example.com/avatars/johndoe.jpg",
  "metadata": {
    "preferredLanguage": "en",
    "timezone": "America/New_York",
    "notificationPreferences": {
      "email": true,
      "inApp": true
    }
  }
}
```

### 3. Create User

**Endpoint**: `POST /user`

**Purpose**: Create a new user.

**Request Body**:
```json
{
  "name": "Jane Smith",
  "username": "janesmith",
  "email": "jane.smith@example.com",
  "fullName": "Jane Elizabeth Smith",
  "role": "executive",
  "permissions": ["view_conversations", "view_analytics"],
  "department": "Executive",
  "isActive": true
}
```

**Response Format**:
```json
{
  "id": "user-456",
  "name": "Jane Smith",
  "username": "janesmith",
  "email": "jane.smith@example.com",
  "fullName": "Jane Elizabeth Smith",
  "role": "executive",
  "permissions": ["view_conversations", "view_analytics"],
  "createdAt": "2023-05-15T15:00:00Z",
  "lastActive": "2023-05-15T15:00:00Z",
  "isActive": true,
  "department": "Executive",
  "metadata": {}
}
```

### 4. Update User

**Endpoint**: `PUT /user/{id}`

**Purpose**: Update an existing user.

**Request Body**:
```json
{
  "name": "Jane Smith-Johnson",
  "email": "jane.smith-johnson@example.com",
  "role": "admin",
  "permissions": ["view_conversations", "view_analytics", "manage_users"],
  "isActive": true,
  "department": "Leadership"
}
```

**Response Format**:
```json
{
  "id": "user-456",
  "name": "Jane Smith-Johnson",
  "username": "janesmith",
  "email": "jane.smith-johnson@example.com",
  "fullName": "Jane Elizabeth Smith",
  "role": "admin",
  "permissions": ["view_conversations", "view_analytics", "manage_users"],
  "createdAt": "2023-05-15T15:00:00Z",
  "lastActive": "2023-05-15T15:30:00Z",
  "isActive": true,
  "department": "Leadership",
  "metadata": {}
}
```

### 5. Delete User

**Endpoint**: `DELETE /user/{id}`

**Purpose**: Delete or deactivate a user.

**Query Parameters**:
- `deactivate_only` (optional): If true, deactivate instead of delete (default: false)

**Response Format**:
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

### 6. Get User Activity

**Endpoint**: `GET /user/{id}/activity`

**Purpose**: Retrieve activity history for a specific user.

**Query Parameters**:
- `from_date` (optional): Start date for activity records
- `to_date` (optional): End date for activity records
- `skip` (optional): Number of records to skip (for pagination)
- `limit` (optional): Maximum number of records to return (for pagination)

**Response Format**:
```json
{
  "items": [
    {
      "id": "activity-123",
      "userId": "user-123",
      "actionType": "login",
      "timestamp": "2023-05-15T14:30:00Z",
      "details": {
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0..."
      }
    },
    {
      "id": "activity-124",
      "userId": "user-123",
      "actionType": "view_conversation",
      "timestamp": "2023-05-15T14:35:00Z",
      "details": {
        "conversationId": "conv-789"
      }
    }
    // More activity records...
  ],
  "page_info": {
    "total_items": 150,
    "limit": 20,
    "skip": 0
  }
}
```

### 7. Get User Conversations

**Endpoint**: `GET /user/{id}/conversation`

**Purpose**: Retrieve conversations initiated by a specific user.

**Query Parameters**:
- Same as the main Conversations API list endpoint

**Response Format**:
- Same as the Conversations API list endpoint response

### 8. Get User Collections

**Endpoint**: `GET /user/{id}/collection`

**Purpose**: Retrieve collections created by a specific user.

**Query Parameters**:
- Same as the main Collections API list endpoint

**Response Format**:
- Same as the Collections API list endpoint response

### 9. Get User Groups (Admin)

**Endpoint**: `GET /user/{id}/admin-group`

**Purpose**: Retrieve groups where the user is an admin.

**Query Parameters**:
- Same as the main Groups API list endpoint

**Response Format**:
- Same as the Groups API list endpoint response

### 10. Get User Groups (Member)

**Endpoint**: `GET /user/{id}/member-group`

**Purpose**: Retrieve groups where the user is a member.

**Query Parameters**:
- Same as the main Groups API list endpoint

**Response Format**:
- Same as the Groups API list endpoint response

### 11. Check User Permission

**Endpoint**: `GET /user/{id}/permission`

**Purpose**: Check if a user has a specific permission.

**Query Parameters**:
- `permission`: Permission to check (e.g., 'manage_users', 'view_conversations')

**Response Format**:
```json
{
  "hasPermission": true
}
```

### 12. Add User Permission

**Endpoint**: `POST /user/{id}/permission`

**Purpose**: Add a permission to a user.

**Request Body**:
```json
{
  "permission": "manage_collections"
}
```

**Response Format**:
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "permissions": ["view_conversations", "manage_collections"]
  }
}
```

### 13. Remove User Permission

**Endpoint**: `DELETE /user/{id}/permission/{permission}`

**Purpose**: Remove a permission from a user.

**Response Format**:
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "permissions": ["view_conversations"]
  }
}
```

### 14. Get Current User

**Endpoint**: `GET /user/current`

**Purpose**: Get the currently authenticated user.

**Response Format**:
```json
{
  "id": "user-123",
  "name": "John Doe",
  "username": "johndoe",
  "email": "john.doe@example.com",
  "fullName": "John Michael Doe",
  "role": "supervisor",
  "permissions": ["view_conversations", "manage_collections"],
  "createdAt": "2023-01-01T12:00:00Z",
  "lastActive": "2023-05-15T14:30:00Z",
  "isActive": true,
  "department": "Customer Support"
}
```

### 15. List Roles

**Endpoint**: `GET /role`

**Purpose**: Retrieve a list of all available roles.

**Response Format**:
```json
{
  "items": [
    {
      "id": "role-1",
      "name": "admin",
      "description": "Full system administrator",
      "permissions": ["manage_users", "manage_collections", "manage_groups", "view_conversations", "view_analytics"]
    },
    {
      "id": "role-2",
      "name": "supervisor",
      "description": "Team supervisor",
      "permissions": ["view_conversations", "manage_collections", "view_analytics"]
    },
    {
      "id": "role-3",
      "name": "executive",
      "description": "Executive user",
      "permissions": ["view_conversations", "view_analytics"]
    }
  ]
}
```

### 16. List Permissions

**Endpoint**: `GET /permission`

**Purpose**: Retrieve a list of all available permissions.

**Response Format**:
```json
{
  "items": [
    {
      "id": "perm-1",
      "name": "manage_users",
      "description": "Create, update, and delete users",
      "category": "user"
    },
    {
      "id": "perm-2",
      "name": "manage_collections",
      "description": "Create, update, and delete collections",
      "category": "collection"
    }
    // More permissions...
  ]
}
```

## Authentication Endpoints

### 1. Login

**Endpoint**: `POST /auth/login`

**Purpose**: Authenticate a user and get access token.

**Request Body**:
```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response Format**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "name": "John Doe",
    "role": "supervisor"
  },
  "expiresIn": 3600
}
```

### 2. Refresh Token

**Endpoint**: `POST /auth/refresh`

**Purpose**: Get a new access token using a refresh token.

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Format**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

### 3. Logout

**Endpoint**: `POST /auth/logout`

**Purpose**: Invalidate the current session.

**Request Body**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Format**:
```json
{
  "success": true
}
```

### 4. Reset Password

**Endpoint**: `POST /auth/reset-password`

**Purpose**: Request a password reset.

**Request Body**:
```json
{
  "email": "john.doe@example.com"
}
```

**Response Format**:
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### 5. Change Password

**Endpoint**: `POST /auth/change-password`

**Purpose**: Change the password for the authenticated user.

**Request Body**:
```json
{
  "currentPassword": "oldsecurepassword123",
  "newPassword": "newsecurepassword456"
}
```

**Response Format**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

## API Implementation Details

### User Roles

The system supports the following user roles:

1. **admin**: Full system administrator with all permissions
2. **supervisor**: Team supervisor with collection and analytics permissions
3. **executive**: Executive user with read-only access to conversations and analytics

### Permission System

The API implements a fine-grained permission system:

1. **Role-Based**: Default permissions assigned based on user role
2. **Permission-Based**: Individual permissions can be granted to or revoked from users regardless of role
3. **Hierarchical**: Some permissions imply others (e.g., 'manage_users' implies 'view_users')

Standard permissions include:
- `view_conversations`: Access to view conversation data
- `manage_collections`: Create/edit/delete collections
- `manage_groups`: Create/edit/delete groups
- `manage_users`: Create/edit/delete users
- `view_analytics`: Access to analytics dashboards

### Response Format

The API supports both single-object and collection responses:

1. **Single Object Responses**:
   - Return the object directly: `{ id: "user-123", name: "John Doe", ... }`

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

1. **User Authentication**:
   ```
   POST /auth/login
   {
     "username": "johndoe",
     "password": "securepassword123"
   }
   ```

2. **Get Current User Details**:
   ```
   GET /user/current
   ```

3. **View Users List**:
   ```
   GET /user?role=supervisor&limit=20
   ```

4. **Create a New User**:
   ```
   POST /user
   {
     "name": "Jane Smith",
     "username": "janesmith",
     "email": "jane.smith@example.com",
     "fullName": "Jane Elizabeth Smith",
     "role": "executive",
     "permissions": ["view_conversations", "view_analytics"],
     "department": "Executive",
     "isActive": true
   }
   ```

5. **Update User Role and Permissions**:
   ```
   PUT /user/user-456
   {
     "role": "supervisor",
     "permissions": ["view_conversations", "view_analytics", "manage_collections"]
   }
   ```

6. **Check User Permission**:
   ```
   GET /user/user-456/permission?permission=manage_collections
   ```

## Critical Fields and Features

For the User Management system to function properly, these fields are critical:

1. **User Authentication**:
   - `username`: For login identification
   - `password`: For authentication (never returned in API responses)
   - `role`: For determining default permissions
   - `permissions`: For access control

2. **User Identity**:
   - `id`: Unique user identifier
   - `name`: Display name
   - `email`: For notifications and password reset

3. **User Status**:
   - `isActive`: Whether the user account is active
   - `lastActive`: When the user was last active

4. **Access Control**:
   - The relationship between roles and permissions
   - Permission checking for all protected operations

## Authentication Options

The API supports multiple authentication methods:

1. **JWT Token**: Via `Authorization: Bearer <token>` header (primary method)
   - Standard JWT with user ID, role, and permissions encoded
   - Short expiry time (1 hour) with refresh token support

2. **API Key**: Via `X-API-KEY` header with optional `X-CLIENT-ID`
   - For service-to-service or automated access
   - Longer expiry and limited to specific endpoints

3. **No Authentication**: For development and testing environments as described in NOAUTH_IMPLEMENTATION.md

## Relationships with Other Entities

### Users and Conversations

Users initiate conversations with AI agents. A user is related to conversations through:
- The `userId` field in the Conversation entity
- Through the `/user/{id}/conversation` endpoint that retrieves conversations initiated by a user

### Users and Collections

Users create and own collections. This relationship is established through:
- The `ownerId` and `creator` fields in the Collection entity
- The `accessPermissions` array in the Collection entity which lists users with access
- Through the `/user/{id}/collection` endpoint that retrieves collections created by a user

### Users and Groups

Users can be administrators or members of groups. This relationship is established through:
- The `adminIds` array in the Group entity which lists administrator users
- The `userIds` array in the Group entity which lists member users
- The `permissionLevels` map in the Group entity which defines access levels for each user
- Through the `/user/{id}/admin-group` and `/user/{id}/member-group` endpoints

## Database Support Requirements

### Schema Requirements

To implement the User API, the following database schema considerations are required:

1. **Users Table**:
   - Primary key: `id` (string, UUID preferred)
   - Required fields: `name`, `username`, `email`, `role`, `createdAt`
   - JSON field: `metadata` should be stored as a JSON object to support additional properties
   - Indexed fields: `username`, `email`, `role`, `isActive` (for efficient querying)
   - Hashed password field: Never return this in API responses

2. **User Permissions Table**:
   - Many-to-many relationship between users and permissions
   - Fields: `user_id`, `permission_id`, `granted_at`
   - Indexed for efficient permission checking

3. **Roles Table**:
   - Defines available roles and their default permissions
   - Fields: `id`, `name`, `description`, `created_at`, `updated_at`

4. **Permissions Table**:
   - Defines available permissions
   - Fields: `id`, `name`, `description`, `category`, `created_at`

5. **User Activity Table**:
   - Tracks user actions for audit and analytics
   - Fields: `id`, `user_id`, `action_type`, `timestamp`, `details` (JSON)
   - Highly indexed for efficient querying

### Database Operations

The User API requires the following database operation capabilities:

1. **User Authentication**:
   - Efficient username lookup
   - Secure password comparison
   - Token generation and validation

2. **Permission Checking**:
   - Fast lookup of user permissions
   - Role-based permission resolution
   - Permission hierarchy evaluation

3. **Performance Considerations**:
   - Efficient querying for users with specific roles or permissions
   - Support for pagination when retrieving associated entities
   - Caching strategies for frequently accessed user data

### Recommended Database Types

Based on the requirements, the following database types are recommended:

1. **Relational Databases** (PostgreSQL, MySQL):
   - Strong support for complex relationships
   - Support for role and permission hierarchies
   - Efficient indexing and query optimization
   - Transaction support for data consistency
   - JSON support for metadata

2. **Document Databases** (MongoDB):
   - Flexible schema for user metadata
   - Good performance for read-heavy operations
   - May require additional indexing for relationship queries

### PostgreSQL Implementation Scripts

The following SQL scripts create the necessary database schema for implementing the User API in PostgreSQL:

```sql
-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY NOT NULL,
    username VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,  -- Hashed password
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    department VARCHAR(100),
    avatar VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for users table
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Roles Table
CREATE TABLE roles (
    id UUID PRIMARY KEY NOT NULL,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permissions Table
CREATE TABLE permissions (
    id UUID PRIMARY KEY NOT NULL,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Role Permissions Table (many-to-many)
CREATE TABLE role_permissions (
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);

-- User Permissions Table (many-to-many)
CREATE TABLE user_permissions (
    user_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, permission_id)
);

-- User Activity Table
CREATE TABLE user_activity (
    id UUID PRIMARY KEY NOT NULL,
    user_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    details JSONB DEFAULT '{}'
);

-- Create indexes for activity table
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_timestamp ON user_activity(timestamp);
CREATE INDEX idx_user_activity_action_type ON user_activity(action_type);

-- Authentication Tokens Table
CREATE TABLE auth_tokens (
    id UUID PRIMARY KEY NOT NULL,
    user_id UUID NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE
);

-- Create indexes for auth_tokens table
CREATE INDEX idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX idx_auth_tokens_refresh_token ON auth_tokens(refresh_token);
```

### Implementation Considerations

1. **Security Best Practices**:
   - Store passwords using strong cryptographic hashing (e.g., bcrypt)
   - Implement rate limiting for authentication endpoints
   - Use HTTPS for all communications
   - Implement proper token validation and expiration

2. **Caching Strategy**:
   - Cache user permission data to reduce database load
   - Implement an invalidation strategy when permissions change
   - Consider using a distributed cache for scalability

3. **Audit and Compliance**:
   - Log all significant user actions
   - Ensure compliance with privacy regulations (GDPR, CCPA, etc.)
   - Implement data retention policies for user activity

4. **User Provisioning**:
   - Support bulk user creation and updates
   - Consider integration with external identity providers (OIDC, SAML)
   - Implement management of user access lifecycle