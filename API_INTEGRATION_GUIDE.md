# Agent Monitor API Integration Guide

This guide explains how to integrate the Agent Monitor REST API with implementations of the `IDataSource` interface. The API has been designed to provide a complete and consistent interface for all data access operations defined in the `IDataSource` interface.

## Overview

The Agent Monitor API provides endpoints for all CRUD operations on the following entities:
- Messages
- Conversations
- Collections
- Groups
- AI Agents
- Users

Additionally, it provides system-level operations for initialization, data saving, and cache clearing.

## API Specification

The complete API specification is available in OpenAPI (Swagger) format in the `swagger-api-spec.yaml` file. You can view this specification using Swagger UI or any other OpenAPI-compatible tool.

## Data Source Implementation

When implementing the `IDataSource` interface for use with this API, you have two main options:

### Option 1: API Client Implementation

Create an implementation of `IDataSource` that acts as a client to this API. This allows your application to use the API as a data source.

Example:

```typescript
import axios from 'axios';
import { IDataSource } from './src/data/sources/IDataSource';
import { Message, Conversation, Collection, Group, AIAgent, User } from './src/data/types';

export class ApiDataSource implements IDataSource {
  private baseUrl: string;
  private authToken?: string;
  
  constructor(baseUrl: string, authToken?: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }
  
  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }
  
  async initialize(): Promise<void> {
    await axios.post(`${this.baseUrl}/system/initialize`, {}, {
      headers: this.getHeaders()
    });
  }
  
  async getMessageById(id: string): Promise<Message | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/messages/${id}`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  // Implement all other IDataSource methods, following the pattern above
  // ...
}
```

### Option 2: API Server Implementation

Implement the API server that uses an existing `IDataSource` implementation. This allows you to expose your data source implementation as an API.

See the `api-controller-example.ts` file for an example of how to implement controllers that connect the API endpoints to an `IDataSource` implementation.

## Authentication and Security

The API uses Bearer token authentication. When implementing or consuming the API, make sure to:

1. Validate JWT tokens on the server-side
2. Include a valid Bearer token in the Authorization header of all requests
3. Implement proper RBAC (Role-Based Access Control) based on user permissions

## Using the API

### Initialization

Before using the API, you must initialize the data source:

```
POST /api/v1/system/initialize
```

### Entity Operations

All entity types follow a consistent pattern for CRUD operations:

- Get all/multiple: `GET /{entity}`
- Get by ID: `GET /{entity}/{id}`
- Create: `POST /{entity}`
- Update: `PUT /{entity}/{id}`
- Delete: `DELETE /{entity}/{id}`

### Filtering

The API supports various filtering operations:

- Get by related entity: `GET /{related-entity}/{id}/{entity}`
  - Example: `GET /collections/{collectionId}/conversations`
- Filter conversations by complex criteria: `POST /conversations/filter`

### System Operations

- Initialize: `POST /system/initialize`
- Save data: `POST /system/save`
- Clear cache: `POST /system/cache/clear`

## Error Handling

The API uses standard HTTP status codes and returns error responses in the following format:

```json
{
  "code": 404,
  "message": "AI agent with ID 123 not found",
  "details": { ... }
}
```

## Implementation Notes

1. All ID parameters in URLs should be properly URL-encoded
2. Use appropriate HTTP status codes in responses
3. Validate all input data before processing
4. Implement proper error handling and logging
5. Consider implementing rate limiting for API endpoints
6. For large result sets, implement pagination

## Examples

### Creating a New AI Agent

Request:
```
POST /api/v1/aiagents
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Customer Support Assistant",
  "model": "gpt-4",
  "status": "active",
  "conversationsProcessed": 0,
  "successRate": "0%",
  "avgResponseTime": "0ms",
  "lastActive": "2023-05-01T12:00:00Z",
  "capabilities": ["text response", "knowledge search"],
  "specializations": ["product inquiries", "troubleshooting"]
}
```

Response:
```
201 Created
Content-Type: application/json

{
  "id": "ai123",
  "name": "Customer Support Assistant",
  "model": "gpt-4",
  "status": "active",
  "conversationsProcessed": 0,
  "successRate": "0%",
  "avgResponseTime": "0ms",
  "lastActive": "2023-05-01T12:00:00Z",
  "capabilities": ["text response", "knowledge search"],
  "specializations": ["product inquiries", "troubleshooting"]
}
```

### Filtering Conversations

Request:
```
POST /api/v1/conversations/filter
Content-Type: application/json
Authorization: Bearer <token>

{
  "aiAgentIds": ["ai123", "ai456"],
  "timeRange": {
    "startDate": "2023-05-01T00:00:00Z",
    "endDate": "2023-05-31T23:59:59Z"
  },
  "outcome": "successful",
  "priority": "high"
}
```

Response:
```
200 OK
Content-Type: application/json

["conv123", "conv456", "conv789"]
```