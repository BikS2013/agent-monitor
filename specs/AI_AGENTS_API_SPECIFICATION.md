# AI Agents Tab API Specification

This document outlines the API requirements for the AI Agents tab in the Agent Monitor dashboard application.

## Overview

The AI Agents API enables management and monitoring of AI agents within the platform. It provides endpoints for creating, retrieving, updating, and deleting AI agents, as well as retrieving performance statistics and comparing agents.

## Base URL

```
https://api.agent-monitor.example/v1
```

## Authentication

All API requests require authentication using Bearer token:

```
Authorization: Bearer {token}
```

## Endpoints

### 1. List AI Agents

Retrieves a list of all AI agents with pagination and filtering options.

```
GET /ai-agents
```

#### Query Parameters

| Parameter | Type   | Required | Description                                       |
|-----------|--------|----------|---------------------------------------------------|
| page      | number | No       | Page number (defaults to 1)                       |
| limit     | number | No       | Number of items per page (defaults to 20, max 100)|
| status    | string | No       | Filter by agent status (active, inactive, training, all) |
| model     | string | No       | Filter by AI model name                           |
| search    | string | No       | Search text to filter agents by name or model     |

#### Response

```json
{
  "data": [
    {
      "id": "agent-123",
      "name": "Customer Support Bot",
      "model": "GPT-4-Turbo",
      "status": "active",
      "conversationsProcessed": 1250,
      "successRate": "85%",
      "avgResponseTime": "2.5s",
      "lastActive": "2023-06-15T14:30:45Z",
      "capabilities": ["general-inquiries", "order-tracking"],
      "specializations": ["customer-service", "e-commerce"]
    },
    // ...more agents
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 45,
    "totalPages": 3
  }
}
```

### 2. Create AI Agent

Creates a new AI agent with the provided details.

```
POST /ai-agents
```

#### Request Body

```json
{
  "name": "Technical Support Bot",
  "model": "Claude-3-Sonnet",
  "status": "active",
  "capabilities": ["technical-support", "troubleshooting"],
  "specializations": ["software", "hardware"]
}
```

| Field           | Type     | Required | Description                                 |
|-----------------|----------|----------|---------------------------------------------|
| name            | string   | Yes      | Name of the AI agent                        |
| model           | string   | Yes      | AI model used by the agent                  |
| status          | string   | No       | Initial status (defaults to "active")       |
| capabilities    | string[] | No       | List of agent capabilities                  |
| specializations | string[] | No       | List of agent specializations               |

#### Response

```json
{
  "id": "agent-456",
  "name": "Technical Support Bot",
  "model": "Claude-3-Sonnet",
  "status": "active",
  "conversationsProcessed": 0,
  "successRate": "0%",
  "avgResponseTime": "0s",
  "lastActive": "2023-06-16T10:15:30Z",
  "capabilities": ["technical-support", "troubleshooting"],
  "specializations": ["software", "hardware"]
}
```

### 3. Get AI Agent by ID

Retrieves detailed information about a specific AI agent.

```
GET /ai-agents/{id}
```

#### Path Parameters

| Parameter | Type   | Required | Description             |
|-----------|--------|----------|-------------------------|
| id        | string | Yes      | ID of the AI agent      |

#### Response

```json
{
  "id": "agent-123",
  "name": "Customer Support Bot",
  "model": "GPT-4-Turbo",
  "status": "active",
  "conversationsProcessed": 1250,
  "successRate": "85%",
  "avgResponseTime": "2.5s",
  "lastActive": "2023-06-15T14:30:45Z",
  "capabilities": ["general-inquiries", "order-tracking"],
  "specializations": ["customer-service", "e-commerce"]
}
```

### 4. Update AI Agent

Updates an existing AI agent with the provided details.

```
PUT /ai-agents/{id}
```

#### Path Parameters

| Parameter | Type   | Required | Description             |
|-----------|--------|----------|-------------------------|
| id        | string | Yes      | ID of the AI agent      |

#### Request Body

```json
{
  "name": "Premium Customer Support Bot",
  "model": "GPT-4-Turbo",
  "status": "active",
  "capabilities": ["general-inquiries", "order-tracking", "premium-support"],
  "specializations": ["customer-service", "e-commerce", "vip-clients"]
}
```

| Field           | Type     | Required | Description                                 |
|-----------------|----------|----------|---------------------------------------------|
| name            | string   | No       | Name of the AI agent                        |
| model           | string   | No       | AI model used by the agent                  |
| status          | string   | No       | Agent status                                |
| capabilities    | string[] | No       | List of agent capabilities                  |
| specializations | string[] | No       | List of agent specializations               |

#### Response

```json
{
  "id": "agent-123",
  "name": "Premium Customer Support Bot",
  "model": "GPT-4-Turbo",
  "status": "active",
  "conversationsProcessed": 1250,
  "successRate": "85%",
  "avgResponseTime": "2.5s",
  "lastActive": "2023-06-15T14:30:45Z",
  "capabilities": ["general-inquiries", "order-tracking", "premium-support"],
  "specializations": ["customer-service", "e-commerce", "vip-clients"]
}
```

### 5. Delete AI Agent

Deletes an existing AI agent.

```
DELETE /ai-agents/{id}
```

#### Path Parameters

| Parameter | Type   | Required | Description             |
|-----------|--------|----------|-------------------------|
| id        | string | Yes      | ID of the AI agent      |

#### Response

```
204 No Content
```

### 6. Update AI Agent Status

Updates the status of an existing AI agent.

```
PUT /ai-agents/{id}/status
```

#### Path Parameters

| Parameter | Type   | Required | Description             |
|-----------|--------|----------|-------------------------|
| id        | string | Yes      | ID of the AI agent      |

#### Request Body

```json
{
  "status": "inactive"
}
```

| Field  | Type   | Required | Description                                  |
|--------|--------|----------|----------------------------------------------|
| status | string | Yes      | New status (active, inactive, or training)   |

#### Response

```json
{
  "id": "agent-123",
  "name": "Customer Support Bot",
  "model": "GPT-4-Turbo",
  "status": "inactive",
  "conversationsProcessed": 1250,
  "successRate": "85%",
  "avgResponseTime": "2.5s",
  "lastActive": "2023-06-15T14:30:45Z",
  "capabilities": ["general-inquiries", "order-tracking"],
  "specializations": ["customer-service", "e-commerce"]
}
```

### 7. Get AI Agent Statistics

Retrieves performance statistics for a specific AI agent.

```
GET /ai-agents/{id}/statistics
```

#### Path Parameters

| Parameter | Type   | Required | Description        |
|-----------|--------|----------|--------------------|
| id        | string | Yes      | ID of the AI agent |

#### Response

```json
{
  "id": "agent-123",
  "conversationsProcessed": 1250,
  "successRate": "85%",
  "avgResponseTime": "2.5s",
  "lastActive": "2023-06-15T14:30:45Z",
  "userSatisfaction": "92%",
  "timePeriodsStats": {
    "daily": [
      {
        "period": "2023-06-15",
        "conversationsProcessed": 42,
        "successRate": "88%",
        "avgResponseTime": "2.3s"
      },
      // ...more daily stats
    ],
    "weekly": [
      {
        "period": "2023-W24",
        "conversationsProcessed": 284,
        "successRate": "86%",
        "avgResponseTime": "2.4s"
      },
      // ...more weekly stats
    ],
    "monthly": [
      {
        "period": "2023-06",
        "conversationsProcessed": 1150,
        "successRate": "85%",
        "avgResponseTime": "2.5s"
      },
      // ...more monthly stats
    ]
  }
}
```

### 8. Update AI Agent Statistics

Calculates and updates performance statistics for a specific AI agent.

```
POST /ai-agents/{id}/statistics
```

#### Path Parameters

| Parameter | Type   | Required | Description        |
|-----------|--------|----------|--------------------|
| id        | string | Yes      | ID of the AI agent |

#### Response

```json
{
  "id": "agent-123",
  "conversationsProcessed": 1255,
  "successRate": "85.2%",
  "avgResponseTime": "2.48s",
  "lastActive": "2023-06-16T09:45:30Z",
  "userSatisfaction": "92%",
  "timePeriodsStats": {
    "daily": [
      {
        "period": "2023-06-16",
        "conversationsProcessed": 5,
        "successRate": "100%",
        "avgResponseTime": "2.1s"
      },
      // ...more daily stats
    ],
    "weekly": [
      {
        "period": "2023-W24",
        "conversationsProcessed": 289,
        "successRate": "86.2%",
        "avgResponseTime": "2.39s"
      },
      // ...more weekly stats
    ],
    "monthly": [
      {
        "period": "2023-06",
        "conversationsProcessed": 1155,
        "successRate": "85.2%",
        "avgResponseTime": "2.48s"
      },
      // ...more monthly stats
    ]
  }
}
```

### 9. Get Conversations for an AI Agent

Retrieves conversations handled by a specific AI agent.

```
GET /ai-agents/{id}/conversations
```

#### Path Parameters

| Parameter | Type   | Required | Description        |
|-----------|--------|----------|--------------------|
| id        | string | Yes      | ID of the AI agent |

#### Query Parameters

| Parameter  | Type      | Required | Description                                        |
|------------|-----------|----------|----------------------------------------------------|
| page       | number    | No       | Page number (defaults to 1)                        |
| limit      | number    | No       | Number of items per page (defaults to 20, max 100) |
| status     | string    | No       | Filter by conversation status (active, closed, all)|
| conclusion | string    | No       | Filter by conversation conclusion                  |
| startDate  | datetime  | No       | Filter by start date (ISO 8601 format)             |
| endDate    | datetime  | No       | Filter by end date (ISO 8601 format)               |

#### Response

```json
{
  "data": [
    {
      "id": "conv-789",
      "userId": "user-456",
      "userName": "John Doe",
      "aiAgentId": "agent-123",
      "aiAgentName": "Customer Support Bot",
      "aiAgentType": "support",
      "status": "closed",
      "conclusion": "successful",
      "startTimestamp": "2023-06-15T14:00:00Z",
      "endTimestamp": "2023-06-15T14:10:25Z",
      "messages": ["msg-001", "msg-002", "msg-003"],
      "tags": ["refund", "resolved"],
      "resolutionNotes": "Customer was provided with refund information",
      "priority": "medium",
      "duration": "10m25s",
      "messageCount": 8,
      "confidence": "high"
    },
    // ...more conversations
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 1250,
    "totalPages": 63
  }
}
```

### 10. Compare AI Agent Performance

Compares performance metrics between multiple AI agents.

```
POST /ai-agents/compare
```

#### Request Body

```json
{
  "agentIds": ["agent-123", "agent-456", "agent-789"],
  "metrics": ["successRate", "avgResponseTime", "conversationsProcessed"]
}
```

| Field    | Type     | Required | Description                           |
|----------|----------|----------|---------------------------------------|
| agentIds | string[] | Yes      | List of AI agent IDs to compare       |
| metrics  | string[] | Yes      | List of metrics to compare            |

#### Response

```json
{
  "data": {
    "agent-123": {
      "name": "Customer Support Bot",
      "model": "GPT-4-Turbo",
      "successRate": "85%",
      "avgResponseTime": "2.5s",
      "conversationsProcessed": 1250
    },
    "agent-456": {
      "name": "Technical Support Bot",
      "model": "Claude-3-Sonnet",
      "successRate": "78%",
      "avgResponseTime": "3.1s",
      "conversationsProcessed": 980
    },
    "agent-789": {
      "name": "Sales Assistant",
      "model": "GPT-3.5-Turbo",
      "successRate": "92%",
      "avgResponseTime": "1.8s",
      "conversationsProcessed": 1520
    }
  }
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "message": "Invalid request parameters",
  "details": ["Status must be one of: active, inactive, training"]
}
```

### 401 Unauthorized

```json
{
  "message": "Authentication required"
}
```

### 404 Not Found

```json
{
  "message": "Resource not found",
  "details": ["AI agent with ID agent-999 not found"]
}
```

### 500 Internal Server Error

```json
{
  "message": "Internal server error",
  "details": ["An unexpected error occurred"]
}
```

## Data Models

### AI Agent

| Field                 | Type     | Description                                     |
|-----------------------|----------|-------------------------------------------------|
| id                    | string   | Unique identifier for the AI agent              |
| name                  | string   | Name of the AI agent                            |
| model                 | string   | AI model used by the agent                      |
| status                | string   | Current status of the AI agent                  |
| conversationsProcessed| number   | Number of conversations processed by the agent  |
| successRate           | string   | Success rate as a percentage string             |
| avgResponseTime       | string   | Average response time                           |
| lastActive            | string   | When the agent was last active                  |
| capabilities          | string[] | List of capabilities this agent has             |
| specializations       | string[] | List of specializations this agent has          |

### Conversation

| Field          | Type     | Description                                     |
|----------------|----------|-------------------------------------------------|
| id             | string   | Unique identifier for the conversation          |
| userId         | string   | ID of the user in the conversation              |
| userName       | string   | Name of the user                                |
| aiAgentId      | string   | ID of the AI agent in the conversation          |
| aiAgentName    | string   | Name of the AI agent                            |
| aiAgentType    | string   | Type of the AI agent                            |
| status         | string   | Current status of the conversation              |
| conclusion     | string   | Conclusion of the conversation                  |
| startTimestamp | string   | When the conversation started                   |
| endTimestamp   | string   | When the conversation ended (if closed)         |
| messages       | string[] | List of message IDs in the conversation         |
| tags           | string[] | List of tags for the conversation               |
| resolutionNotes| string   | Resolution notes for the conversation           |
| priority       | string   | Priority of the conversation                    |
| duration       | string   | Duration of the conversation                    |
| messageCount   | number   | Number of messages in the conversation          |
| confidence     | string   | Confidence score for the conversation           |