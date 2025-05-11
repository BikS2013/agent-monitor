# Dashboard Tab API Specification

This document outlines the API requirements for the Dashboard tab in the Agent Monitor dashboard application.

## Overview

The Dashboard API provides comprehensive system-wide metrics, real-time statistics, and summary data for AI agent performance monitoring. It serves as the central data hub for the dashboard view, offering aggregate data across conversations, agents, and user interactions.

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

### 1. Get Dashboard Overview

Retrieves consolidated statistics and metrics for the dashboard view.

```
GET /dashboard/overview
```

#### Query Parameters

| Parameter | Type   | Required | Description                                    |
|-----------|--------|----------|------------------------------------------------|
| timeframe | string | No       | Time period for statistics (default: "today", options: "today", "week", "month", "year") |
| timezone  | string | No       | Client timezone for accurate time-based calculations (e.g., "America/New_York") |

#### Response

```json
{
  "summary": {
    "totalConversations": 3250,
    "activeConversations": 85,
    "successRate": 87,
    "activeAIAgents": 12,
    "lastUpdated": "2023-06-16T15:30:45Z"
  },
  "conversationMetrics": {
    "successful": 2827,
    "unsuccessful": 423,
    "pending": 0,
    "avgDuration": "3m25s",
    "avgMessageCount": 12
  },
  "aiAgentPerformance": [
    {
      "id": "agent-123",
      "name": "Customer Support Bot",
      "model": "GPT-4-Turbo",
      "status": "active",
      "conversationsProcessed": 1250,
      "successRate": "85%",
      "avgResponseTime": "2.5s"
    },
    {
      "id": "agent-456",
      "name": "Technical Support Bot",
      "model": "Claude-3-Sonnet",
      "status": "active",
      "conversationsProcessed": 980,
      "successRate": "78%",
      "avgResponseTime": "3.1s"
    },
    // More agents...
  ],
  "recentConversations": [
    {
      "id": "conv-789",
      "userId": "user-456",
      "userName": "John Doe",
      "aiAgentId": "agent-123",
      "aiAgentName": "Customer Support Bot",
      "status": "closed",
      "conclusion": "successful",
      "startTimestamp": "2023-06-15T14:00:00Z",
      "endTimestamp": "2023-06-15T14:10:25Z",
      "tags": ["refund", "resolved"],
      "priority": "medium",
      "confidence": "high"
    },
    // More recent conversations (limited to ~5)...
  ],
  "popularTags": [
    {
      "name": "money-box",
      "count": 325,
      "percentage": 10
    },
    {
      "name": "quick-resolution",
      "count": 520,
      "percentage": 16
    },
    {
      "name": "technical-issue",
      "count": 480,
      "percentage": 15
    },
    {
      "name": "escalation",
      "count": 215,
      "percentage": 7
    },
    {
      "name": "account-inquiry",
      "count": 612,
      "percentage": 19
    },
    {
      "name": "password-reset",
      "count": 398,
      "percentage": 12
    }
  ]
}
```

### 2. Get Real-time Metrics

Retrieves real-time system metrics for active monitoring.

```
GET /dashboard/metrics/realtime
```

#### Response

```json
{
  "activeConversations": 85,
  "activeAgents": 12,
  "conversationsInLastHour": 112,
  "avgResponseTime": "2.8s",
  "currentSuccessRate": "89%",
  "systemLoad": 65,
  "timestamp": "2023-06-16T15:35:22Z"
}
```

### 3. Get Time-Series Metrics

Retrieves time-series data for metric trends visualization.

```
GET /dashboard/metrics/timeseries
```

#### Query Parameters

| Parameter | Type    | Required | Description                                     |
|-----------|---------|----------|-------------------------------------------------|
| metric    | string  | Yes      | The metric to retrieve time-series data for (options: "conversations", "successRate", "responseTime", "agentUtilization") |
| interval  | string  | No       | Time interval for data points (default: "hour", options: "minute", "hour", "day", "week") |
| startTime | string  | No       | Start time in ISO 8601 format (default: 24 hours ago) |
| endTime   | string  | No       | End time in ISO 8601 format (default: now) |
| limit     | integer | No       | Maximum number of data points to return (default: 100, max: 1000) |

#### Response

```json
{
  "metric": "conversations",
  "interval": "hour",
  "startTime": "2023-06-15T15:00:00Z",
  "endTime": "2023-06-16T15:00:00Z",
  "values": [
    {
      "timestamp": "2023-06-15T15:00:00Z",
      "value": 42,
      "metadata": {
        "successful": 36,
        "unsuccessful": 6
      }
    },
    {
      "timestamp": "2023-06-15T16:00:00Z",
      "value": 38,
      "metadata": {
        "successful": 33,
        "unsuccessful": 5
      }
    },
    // More time-series data points...
  ]
}
```

### 4. Get Agent Performance Rankings

Retrieves ranked AI agent performance data for comparative analysis.

```
GET /dashboard/agents/rankings
```

#### Query Parameters

| Parameter | Type   | Required | Description                                    |
|-----------|--------|----------|------------------------------------------------|
| metric    | string | No       | Ranking metric (default: "successRate", options: "successRate", "conversationsProcessed", "avgResponseTime", "userSatisfaction") |
| limit     | number | No       | Number of agents to include (default: 10)      |
| timeframe | string | No       | Time period for ranking (default: "week", options: "day", "week", "month", "year", "all") |

#### Response

```json
{
  "rankings": [
    {
      "rank": 1,
      "id": "agent-789",
      "name": "Sales Assistant",
      "model": "GPT-3.5-Turbo",
      "metric": "successRate",
      "value": "92%",
      "trend": "up",
      "previousRank": 2
    },
    {
      "rank": 2,
      "id": "agent-123",
      "name": "Customer Support Bot",
      "model": "GPT-4-Turbo",
      "metric": "successRate",
      "value": "85%",
      "trend": "stable",
      "previousRank": 2
    },
    {
      "rank": 3,
      "id": "agent-456",
      "name": "Technical Support Bot",
      "model": "Claude-3-Sonnet",
      "metric": "successRate",
      "value": "78%",
      "trend": "down",
      "previousRank": 1
    },
    // More ranked agents...
  ],
  "metadata": {
    "metric": "successRate",
    "timeframe": "week",
    "lastUpdated": "2023-06-16T15:30:00Z"
  }
}
```

### 5. Get System Health

Retrieves system health metrics and status information.

```
GET /dashboard/system/health
```

#### Response

```json
{
  "status": "healthy",
  "components": [
    {
      "name": "API Server",
      "status": "operational",
      "metrics": {
        "uptime": "15d 7h 22m",
        "responseTime": "45ms",
        "errorRate": "0.02%"
      }
    },
    {
      "name": "AI Processing Queue",
      "status": "operational",
      "metrics": {
        "queueDepth": 12,
        "processingRate": "45/minute",
        "averageWaitTime": "1.2s"
      }
    },
    {
      "name": "Database",
      "status": "operational",
      "metrics": {
        "connections": 32,
        "queryResponseTime": "68ms",
        "diskUsage": "42%"
      }
    },
    {
      "name": "Model Inference",
      "status": "operational",
      "metrics": {
        "activeModels": 8,
        "inferenceTime": "720ms",
        "requestRate": "210/minute"
      }
    }
  ],
  "alerts": [
    {
      "severity": "info",
      "message": "Scheduled maintenance in 2 days",
      "timestamp": "2023-06-16T12:00:00Z"
    }
  ],
  "lastUpdated": "2023-06-16T15:35:00Z"
}
```

### 6. Get Conversation Tag Metrics

Retrieves metrics for conversation tags to identify patterns and common topics.

```
GET /dashboard/conversations/tags
```

#### Query Parameters

| Parameter | Type   | Required | Description                                    |
|-----------|--------|----------|------------------------------------------------|
| limit     | number | No       | Maximum number of tags to return (default: 10, max: 50) |
| timeframe | string | No       | Time period for tag analysis (default: "month", options: "day", "week", "month", "year") |

#### Response

```json
{
  "totalConversations": 3250,
  "tags": [
    {
      "name": "account-inquiry",
      "count": 612,
      "percentage": 19,
      "trend": "up",
      "successRate": "92%",
      "avgDuration": "2m18s"
    },
    {
      "name": "quick-resolution",
      "count": 520,
      "percentage": 16,
      "trend": "stable",
      "successRate": "95%",
      "avgDuration": "1m45s"
    },
    {
      "name": "technical-issue",
      "count": 480,
      "percentage": 15,
      "trend": "up",
      "successRate": "78%",
      "avgDuration": "5m12s"
    },
    {
      "name": "password-reset",
      "count": 398,
      "percentage": 12,
      "trend": "down",
      "successRate": "96%",
      "avgDuration": "2m05s"
    },
    {
      "name": "money-box",
      "count": 325,
      "percentage": 10,
      "trend": "stable",
      "successRate": "85%",
      "avgDuration": "3m45s"
    },
    {
      "name": "escalation",
      "count": 215,
      "percentage": 7,
      "trend": "down",
      "successRate": "62%",
      "avgDuration": "8m30s"
    },
    // More tags...
  ],
  "timeframe": "month",
  "lastUpdated": "2023-06-16T15:30:00Z"
}
```

### 7. Get Performance Alerts

Retrieves system alerts and notifications related to performance issues or anomalies.

```
GET /dashboard/alerts
```

#### Query Parameters

| Parameter | Type    | Required | Description                                    |
|-----------|---------|----------|------------------------------------------------|
| severity  | string  | No       | Filter by severity (options: "critical", "warning", "info", "all") |
| status    | string  | No       | Filter by status (options: "active", "resolved", "all") |
| limit     | integer | No       | Maximum number of alerts to return (default: 10, max: 100) |

#### Response

```json
{
  "alerts": [
    {
      "id": "alert-123",
      "severity": "warning",
      "type": "performance",
      "status": "active",
      "title": "Increased response time for Technical Support Bot",
      "description": "Average response time has increased by 35% in the last hour",
      "affectedEntity": {
        "type": "agent",
        "id": "agent-456",
        "name": "Technical Support Bot"
      },
      "metrics": {
        "currentValue": "3.1s",
        "normalValue": "2.3s",
        "threshold": "2.8s",
        "deviationPercentage": 35
      },
      "timestamp": "2023-06-16T14:25:12Z",
      "suggestedActions": [
        "Check model server load",
        "Verify database performance",
        "Inspect recent configuration changes"
      ]
    },
    {
      "id": "alert-124",
      "severity": "info",
      "type": "usage",
      "status": "active",
      "title": "Spike in conversation volume",
      "description": "Conversation volume is 25% higher than normal for this time of day",
      "affectedEntity": {
        "type": "system",
        "id": "global",
        "name": "Global System"
      },
      "metrics": {
        "currentValue": 125,
        "normalValue": 100,
        "threshold": 120,
        "deviationPercentage": 25
      },
      "timestamp": "2023-06-16T15:10:05Z",
      "suggestedActions": [
        "Monitor system resource utilization",
        "Be prepared to scale inference resources if trend continues"
      ]
    },
    // More alerts...
  ],
  "totalCount": 2,
  "lastUpdated": "2023-06-16T15:35:00Z"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "message": "Invalid request parameters",
  "details": ["Invalid time range specified"]
}
```

### 401 Unauthorized

```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "message": "Insufficient permissions",
  "details": ["User does not have dashboard access privileges"]
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

### Dashboard Overview Summary

| Field                | Type    | Description                                   |
|----------------------|---------|-----------------------------------------------|
| totalConversations   | integer | Total number of conversations in the system   |
| activeConversations  | integer | Number of currently active conversations      |
| successRate          | integer | Success rate as a percentage                  |
| activeAIAgents       | integer | Number of currently active AI agents          |
| lastUpdated          | string  | Timestamp of when the data was last updated   |

### AIAgent Performance Summary

| Field                 | Type     | Description                                  |
|-----------------------|----------|----------------------------------------------|
| id                    | string   | Unique identifier for the AI agent           |
| name                  | string   | Name of the AI agent                         |
| model                 | string   | AI model used by the agent                   |
| status                | string   | Current status of the AI agent               |
| conversationsProcessed| integer  | Number of conversations processed            |
| successRate           | string   | Success rate as a percentage string          |
| avgResponseTime       | string   | Average response time                        |

### Conversation Summary

| Field           | Type     | Description                                  |
|-----------------|----------|----------------------------------------------|
| id              | string   | Unique identifier for the conversation       |
| userId          | string   | ID of the user in the conversation           |
| userName        | string   | Name of the user                             |
| aiAgentId       | string   | ID of the AI agent in the conversation       |
| aiAgentName     | string   | Name of the AI agent                         |
| status          | string   | Current status of the conversation           |
| conclusion      | string   | Conclusion of the conversation               |
| startTimestamp  | string   | When the conversation started                |
| endTimestamp    | string   | When the conversation ended (if closed)      |
| tags            | string[] | List of tags for the conversation            |
| priority        | string   | Priority of the conversation                 |
| confidence      | string   | Confidence score for the conversation        |

### Tag Metrics

| Field           | Type     | Description                                  |
|-----------------|----------|----------------------------------------------|
| name            | string   | Tag name                                     |
| count           | integer  | Number of conversations with this tag        |
| percentage      | integer  | Percentage of total conversations            |
| trend           | string   | Trend direction (up, down, stable)           |
| successRate     | string   | Success rate for conversations with this tag |
| avgDuration     | string   | Average duration of conversations with tag   |

### Alert

| Field              | Type    | Description                                   |
|--------------------|---------|-----------------------------------------------|
| id                 | string  | Unique identifier for the alert               |
| severity           | string  | Alert severity level                          |
| type               | string  | Alert type category                           |
| status             | string  | Current status of the alert                   |
| title              | string  | Short alert title                             |
| description        | string  | Detailed alert description                    |
| affectedEntity     | object  | Entity affected by the alert                  |
| metrics            | object  | Relevant metrics for the alert                |
| timestamp          | string  | When the alert was generated                  |
| suggestedActions   | array   | Suggested actions to resolve the alert        |