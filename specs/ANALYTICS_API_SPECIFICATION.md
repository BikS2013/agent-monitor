# Analytics Tab API Specification

This document outlines the API requirements for the Analytics tab in the Agent Monitor dashboard application.

## Overview

The Analytics API provides in-depth metrics, trends, and performance insights to help users understand AI agent performance, conversation patterns, user satisfaction, and system efficiency. It focuses on data aggregation, statistical analysis, and time-series data presentation.

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

### 1. Get Analytics Overview

Retrieves a summary of key analytics metrics for the selected time period.

```
GET /analytics/overview
```

#### Query Parameters

| Parameter | Type   | Required | Description                                    |
|-----------|--------|----------|------------------------------------------------|
| timeframe | string | No       | Time period for analysis (default: "7d", options: "24h", "7d", "30d", "90d", "custom") |
| startDate | string | No       | Custom start date in ISO 8601 format (required if timeframe=custom) |
| endDate   | string | No       | Custom end date in ISO 8601 format (required if timeframe=custom) |
| timezone  | string | No       | Client timezone for accurate time-based calculations (e.g., "America/New_York") |

#### Response

```json
{
  "timeframe": {
    "period": "7d",
    "startDate": "2023-06-09T00:00:00Z",
    "endDate": "2023-06-16T23:59:59Z"
  },
  "summary": {
    "totalConversations": {
      "value": 3250,
      "change": 12,
      "changeType": "increase"
    },
    "successRate": {
      "value": 87,
      "change": 5,
      "changeType": "increase"
    },
    "avgResponseTime": {
      "value": "1.8s",
      "rawValue": 1.8,
      "change": -0.3,
      "changeType": "decrease"
    },
    "activeAIAgents": {
      "value": 12,
      "change": 0,
      "changeType": "unchanged"
    },
    "overallUserSatisfaction": {
      "value": 90,
      "change": 2,
      "changeType": "increase"
    }
  },
  "lastUpdated": "2023-06-16T15:45:00Z"
}
```

### 2. Get Conversation Trends

Retrieves time-series data for conversation volume trends.

```
GET /analytics/conversations/trends
```

#### Query Parameters

| Parameter  | Type   | Required | Description                                                                       |
|------------|--------|----------|-----------------------------------------------------------------------------------|
| timeframe  | string | No       | Time period for analysis (default: "7d", options: "24h", "7d", "30d", "90d", "custom") |
| startDate  | string | No       | Custom start date in ISO 8601 format (required if timeframe=custom)               |
| endDate    | string | No       | Custom end date in ISO 8601 format (required if timeframe=custom)                 |
| interval   | string | No       | Grouping interval (default: "day", options: "hour", "day", "week", "month")       |
| agentIds   | array  | No       | Filter by specific AI agent IDs                                                   |
| showOutcome| boolean| No       | Whether to break down by conversation outcome (default: true)                     |

#### Response

```json
{
  "timeframe": {
    "period": "7d",
    "startDate": "2023-06-09T00:00:00Z",
    "endDate": "2023-06-16T23:59:59Z",
    "interval": "day"
  },
  "trends": [
    {
      "timestamp": "2023-06-09T00:00:00Z",
      "total": 425,
      "successful": 361,
      "unsuccessful": 64
    },
    {
      "timestamp": "2023-06-10T00:00:00Z",
      "total": 448,
      "successful": 389,
      "unsuccessful": 59
    },
    {
      "timestamp": "2023-06-11T00:00:00Z",
      "total": 412,
      "successful": 365,
      "unsuccessful": 47
    },
    {
      "timestamp": "2023-06-12T00:00:00Z",
      "total": 478,
      "successful": 415,
      "unsuccessful": 63
    },
    {
      "timestamp": "2023-06-13T00:00:00Z",
      "total": 490,
      "successful": 431,
      "unsuccessful": 59
    },
    {
      "timestamp": "2023-06-14T00:00:00Z",
      "total": 508,
      "successful": 447,
      "unsuccessful": 61
    },
    {
      "timestamp": "2023-06-15T00:00:00Z",
      "total": 489,
      "successful": 433,
      "unsuccessful": 56
    }
  ],
  "totals": {
    "total": 3250,
    "successful": 2841,
    "unsuccessful": 409,
    "successRate": 87
  }
}
```

### 3. Get Conversation Outcomes

Retrieves detailed statistics about conversation outcomes.

```
GET /analytics/conversations/outcomes
```

#### Query Parameters

| Parameter | Type   | Required | Description                                                                       |
|-----------|--------|----------|-----------------------------------------------------------------------------------|
| timeframe | string | No       | Time period for analysis (default: "7d", options: "24h", "7d", "30d", "90d", "custom") |
| startDate | string | No       | Custom start date in ISO 8601 format (required if timeframe=custom)               |
| endDate   | string | No       | Custom end date in ISO 8601 format (required if timeframe=custom)                 |
| agentIds  | array  | No       | Filter by specific AI agent IDs                                                   |

#### Response

```json
{
  "timeframe": {
    "period": "7d",
    "startDate": "2023-06-09T00:00:00Z",
    "endDate": "2023-06-16T23:59:59Z"
  },
  "outcomes": {
    "successful": {
      "count": 2841,
      "percentage": 87,
      "change": 5,
      "avgDuration": "2m45s",
      "avgMessageCount": 8
    },
    "unsuccessful": {
      "count": 409,
      "percentage": 13,
      "change": -5,
      "avgDuration": "5m18s",
      "avgMessageCount": 14
    }
  },
  "failureReasons": [
    {
      "reason": "complex-query",
      "count": 185,
      "percentage": 45
    },
    {
      "reason": "missing-information",
      "count": 124,
      "percentage": 30
    },
    {
      "reason": "user-disconnect",
      "count": 62,
      "percentage": 15
    },
    {
      "reason": "system-error",
      "count": 38,
      "percentage": 10
    }
  ],
  "successFactors": [
    {
      "factor": "clear-user-intent",
      "percentage": 68
    },
    {
      "factor": "follow-up-questions",
      "percentage": 52
    },
    {
      "factor": "previous-context",
      "percentage": 43
    }
  ]
}
```

### 4. Get AI Agent Performance

Retrieves detailed performance metrics for AI agents.

```
GET /analytics/agents/performance
```

#### Query Parameters

| Parameter  | Type    | Required | Description                                                                       |
|------------|---------|----------|-----------------------------------------------------------------------------------|
| timeframe  | string  | No       | Time period for analysis (default: "7d", options: "24h", "7d", "30d", "90d", "custom") |
| startDate  | string  | No       | Custom start date in ISO 8601 format (required if timeframe=custom)               |
| endDate    | string  | No       | Custom end date in ISO 8601 format (required if timeframe=custom)                 |
| agentIds   | array   | No       | Filter by specific AI agent IDs                                                   |
| sortBy     | string  | No       | Sort field (default: "successRate", options: "successRate", "conversationsProcessed", "avgResponseTime") |
| sortOrder  | string  | No       | Sort order (default: "desc", options: "asc", "desc")                              |
| limit      | integer | No       | Maximum number of agents to return (default: 10, max: 100)                        |

#### Response

```json
{
  "timeframe": {
    "period": "7d",
    "startDate": "2023-06-09T00:00:00Z",
    "endDate": "2023-06-16T23:59:59Z"
  },
  "agents": [
    {
      "id": "agent-789",
      "name": "Sales Assistant",
      "model": "GPT-3.5-Turbo",
      "status": "active",
      "conversationsProcessed": 1520,
      "successRate": "92%",
      "rawSuccessRate": 92,
      "avgResponseTime": "1.8s",
      "rawResponseTime": 1.8,
      "performance": {
        "trend": "improving",
        "changeInSuccessRate": 3.2,
        "changeInResponseTime": -0.2
      }
    },
    {
      "id": "agent-123",
      "name": "Customer Support Bot",
      "model": "GPT-4-Turbo",
      "status": "active",
      "conversationsProcessed": 1250,
      "successRate": "85%",
      "rawSuccessRate": 85,
      "avgResponseTime": "2.5s",
      "rawResponseTime": 2.5,
      "performance": {
        "trend": "stable",
        "changeInSuccessRate": 0.8,
        "changeInResponseTime": -0.1
      }
    },
    {
      "id": "agent-456",
      "name": "Technical Support Bot",
      "model": "Claude-3-Sonnet",
      "status": "active",
      "conversationsProcessed": 980,
      "successRate": "78%",
      "rawSuccessRate": 78,
      "avgResponseTime": "3.1s",
      "rawResponseTime": 3.1,
      "performance": {
        "trend": "declining",
        "changeInSuccessRate": -2.5,
        "changeInResponseTime": 0.4
      }
    }
  ],
  "benchmarks": {
    "averageSuccessRate": 85,
    "averageResponseTime": 2.47,
    "medianSuccessRate": 85,
    "medianResponseTime": 2.5
  }
}
```

### 5. Get Conversation Time Distribution

Retrieves the distribution of conversations by time of day.

```
GET /analytics/conversations/time-distribution
```

#### Query Parameters

| Parameter | Type   | Required | Description                                                                       |
|-----------|--------|----------|-----------------------------------------------------------------------------------|
| timeframe | string | No       | Time period for analysis (default: "7d", options: "24h", "7d", "30d", "90d", "custom") |
| startDate | string | No       | Custom start date in ISO 8601 format (required if timeframe=custom)               |
| endDate   | string | No       | Custom end date in ISO 8601 format (required if timeframe=custom)                 |
| agentIds  | array  | No       | Filter by specific AI agent IDs                                                   |
| groupBy   | string | No       | Group by time unit (default: "hour", options: "hour", "day", "weekday")           |

#### Response

```json
{
  "timeframe": {
    "period": "7d",
    "startDate": "2023-06-09T00:00:00Z",
    "endDate": "2023-06-16T23:59:59Z"
  },
  "groupBy": "hour",
  "distribution": [
    {
      "hour": 0,
      "displayLabel": "12 AM",
      "count": 42,
      "percentage": 1.3
    },
    {
      "hour": 1,
      "displayLabel": "1 AM",
      "count": 38,
      "percentage": 1.2
    },
    // Hours 2-7 omitted for brevity
    {
      "hour": 8,
      "displayLabel": "8 AM",
      "count": 187,
      "percentage": 5.8
    },
    {
      "hour": 9,
      "displayLabel": "9 AM",
      "count": 245,
      "percentage": 7.5
    },
    // Hours 10-22 omitted for brevity
    {
      "hour": 23,
      "displayLabel": "11 PM",
      "count": 68,
      "percentage": 2.1
    }
  ],
  "peakHours": [
    {
      "hour": 14,
      "displayLabel": "2 PM",
      "count": 325,
      "percentage": 10
    },
    {
      "hour": 15,
      "displayLabel": "3 PM",
      "count": 312,
      "percentage": 9.6
    },
    {
      "hour": 13,
      "displayLabel": "1 PM",
      "count": 298,
      "percentage": 9.2
    }
  ],
  "quietHours": [
    {
      "hour": 4,
      "displayLabel": "4 AM",
      "count": 15,
      "percentage": 0.5
    },
    {
      "hour": 3,
      "displayLabel": "3 AM",
      "count": 18,
      "percentage": 0.6
    },
    {
      "hour": 5,
      "displayLabel": "5 AM",
      "count": 22,
      "percentage": 0.7
    }
  ]
}
```

### 6. Get User Satisfaction Metrics

Retrieves user satisfaction metrics based on feedback and interaction patterns.

```
GET /analytics/users/satisfaction
```

#### Query Parameters

| Parameter | Type   | Required | Description                                                                       |
|-----------|--------|----------|-----------------------------------------------------------------------------------|
| timeframe | string | No       | Time period for analysis (default: "7d", options: "24h", "7d", "30d", "90d", "custom") |
| startDate | string | No       | Custom start date in ISO 8601 format (required if timeframe=custom)               |
| endDate   | string | No       | Custom end date in ISO 8601 format (required if timeframe=custom)                 |
| agentIds  | array  | No       | Filter by specific AI agent IDs                                                   |

#### Response

```json
{
  "timeframe": {
    "period": "7d",
    "startDate": "2023-06-09T00:00:00Z",
    "endDate": "2023-06-16T23:59:59Z"
  },
  "overallSatisfaction": {
    "score": 90,
    "change": 2,
    "changeType": "increase"
  },
  "categories": {
    "verySatisfied": {
      "percentage": 68,
      "count": 2210,
      "change": 3,
      "changeType": "increase"
    },
    "satisfied": {
      "percentage": 22,
      "count": 715,
      "change": -1,
      "changeType": "decrease"
    },
    "neutral": {
      "percentage": 7,
      "count": 228,
      "change": -1,
      "changeType": "decrease"
    },
    "unsatisfied": {
      "percentage": 3,
      "count": 97,
      "change": -1,
      "changeType": "decrease"
    }
  },
  "satisfactionByAgentType": [
    {
      "agentType": "customer-service",
      "satisfaction": 94
    },
    {
      "agentType": "technical-support",
      "satisfaction": 87
    },
    {
      "agentType": "sales",
      "satisfaction": 92
    }
  ],
  "satisfactionByModel": [
    {
      "model": "GPT-4-Turbo",
      "satisfaction": 93
    },
    {
      "model": "Claude-3-Opus",
      "satisfaction": 95
    },
    {
      "model": "Claude-3-Sonnet",
      "satisfaction": 91
    },
    {
      "model": "GPT-3.5-Turbo",
      "satisfaction": 88
    }
  ],
  "feedbackHighlights": {
    "positive": [
      "Quick response time",
      "Clear explanations",
      "Helpful suggestions"
    ],
    "negative": [
      "Didn't understand my question",
      "Too many follow-up questions",
      "Provided incorrect information"
    ]
  }
}
```

### 7. Get Analytics Metrics Comparison

Retrieves comparative analytics metrics between two time periods.

```
GET /analytics/comparison
```

#### Query Parameters

| Parameter       | Type   | Required | Description                                                                        |
|-----------------|--------|----------|------------------------------------------------------------------------------------|
| metricType      | string | Yes      | Type of metric to compare (options: "conversations", "successRate", "responseTime", "userSatisfaction") |
| currentPeriod   | string | No       | Current period for comparison (default: "7d", options: "24h", "7d", "30d", "90d", "custom") |
| previousPeriod  | string | No       | Previous period for comparison (default: "previous", options: "previous", "custom") |
| currentStartDate| string | No       | Custom current period start date (required if currentPeriod=custom)                |
| currentEndDate  | string | No       | Custom current period end date (required if currentPeriod=custom)                  |
| previousStartDate| string| No       | Custom previous period start date (required if previousPeriod=custom)              |
| previousEndDate | string | No       | Custom previous period end date (required if previousPeriod=custom)                |
| agentIds        | array  | No       | Filter by specific AI agent IDs                                                    |
| interval        | string | No       | Grouping interval (default based on period length, options: "hour", "day", "week", "month") |

#### Response

```json
{
  "metricType": "conversations",
  "currentPeriod": {
    "label": "Last 7 days",
    "startDate": "2023-06-09T00:00:00Z",
    "endDate": "2023-06-16T23:59:59Z",
    "value": 3250,
    "aggregatedValues": [
      {"timestamp": "2023-06-09T00:00:00Z", "value": 425},
      {"timestamp": "2023-06-10T00:00:00Z", "value": 448},
      {"timestamp": "2023-06-11T00:00:00Z", "value": 412},
      {"timestamp": "2023-06-12T00:00:00Z", "value": 478},
      {"timestamp": "2023-06-13T00:00:00Z", "value": 490},
      {"timestamp": "2023-06-14T00:00:00Z", "value": 508},
      {"timestamp": "2023-06-15T00:00:00Z", "value": 489}
    ]
  },
  "previousPeriod": {
    "label": "Previous 7 days",
    "startDate": "2023-06-02T00:00:00Z",
    "endDate": "2023-06-08T23:59:59Z",
    "value": 2900,
    "aggregatedValues": [
      {"timestamp": "2023-06-02T00:00:00Z", "value": 385},
      {"timestamp": "2023-06-03T00:00:00Z", "value": 402},
      {"timestamp": "2023-06-04T00:00:00Z", "value": 390},
      {"timestamp": "2023-06-05T00:00:00Z", "value": 415},
      {"timestamp": "2023-06-06T00:00:00Z", "value": 432},
      {"timestamp": "2023-06-07T00:00:00Z", "value": 441},
      {"timestamp": "2023-06-08T00:00:00Z", "value": 435}
    ]
  },
  "comparison": {
    "absoluteChange": 350,
    "percentageChange": 12.1,
    "trend": "increasing"
  }
}
```

### 8. Get Analytics Report

Generates a comprehensive analytics report for the specified time period.

```
GET /analytics/report
```

#### Query Parameters

| Parameter  | Type   | Required | Description                                                                       |
|------------|--------|----------|-----------------------------------------------------------------------------------|
| timeframe  | string | No       | Time period for report (default: "7d", options: "24h", "7d", "30d", "90d", "custom") |
| startDate  | string | No       | Custom start date in ISO 8601 format (required if timeframe=custom)               |
| endDate    | string | No       | Custom end date in ISO 8601 format (required if timeframe=custom)                 |
| sections   | array  | No       | Specific sections to include in the report (default: all sections)                |
| format     | string | No       | Report format (default: "json", options: "json", "csv", "pdf")                    |

#### Response

For format=json:
```json
{
  "reportMetadata": {
    "title": "Analytics Report",
    "timeframe": {
      "period": "7d",
      "startDate": "2023-06-09T00:00:00Z",
      "endDate": "2023-06-16T23:59:59Z"
    },
    "generatedAt": "2023-06-16T16:00:00Z"
  },
  "summary": {
    "conversationMetrics": {
      "totalConversations": 3250,
      "successRate": "87%",
      "avgResponseTime": "1.8s",
      "activeAgents": 12
    },
    "keyInsights": [
      "Conversation volume increased by 12% compared to previous period",
      "Success rate improved by 5 percentage points",
      "Response time decreased by 0.3 seconds on average",
      "Peak conversation hours are between 1 PM and 3 PM"
    ],
    "performanceOverview": {
      "bestPerformingAgent": {
        "id": "agent-789",
        "name": "Sales Assistant",
        "successRate": "92%"
      },
      "mostImprovedAgent": {
        "id": "agent-123",
        "name": "Customer Support Bot",
        "improvement": "+6.8%"
      }
    }
  },
  "detailedMetrics": {
    "conversationTrends": {
      // Conversation trend data (similar to /analytics/conversations/trends response)
    },
    "conversationOutcomes": {
      // Outcome data (similar to /analytics/conversations/outcomes response)
    },
    "agentPerformance": {
      // Agent performance data (similar to /analytics/agents/performance response)
    },
    "timeDistribution": {
      // Time distribution data (similar to /analytics/conversations/time-distribution response)
    },
    "userSatisfaction": {
      // Satisfaction data (similar to /analytics/users/satisfaction response)
    }
  },
  "recommendations": [
    {
      "title": "Optimize Technical Support Agent",
      "description": "Technical Support Bot is showing declining performance with a 2.5% drop in success rate. Consider reviewing and updating its knowledge base and response templates.",
      "priority": "high",
      "potentialImpact": "medium"
    },
    {
      "title": "Expand Customer Support Capacity",
      "description": "Conversation volume shows consistent growth at peak hours (1-3 PM). Consider deploying additional customer support agents during these hours.",
      "priority": "medium",
      "potentialImpact": "high"
    }
  ]
}
```

For format=csv or format=pdf, the response would be a downloadable file.

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
  "details": ["User does not have analytics access privileges"]
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

### Timeframe

| Field     | Type   | Description                         |
|-----------|--------|-------------------------------------|
| period    | string | Time period identifier              |
| startDate | string | Start date in ISO 8601 format       |
| endDate   | string | End date in ISO 8601 format         |
| interval  | string | Optional time grouping interval     |

### Metric with Change

| Field      | Type   | Description                         |
|------------|--------|-------------------------------------|
| value      | mixed  | Current value of the metric         |
| rawValue   | number | Raw numeric value (if applicable)   |
| change     | number | Change relative to previous period  |
| changeType | string | Direction of change                 |

### AgentPerformance

| Field               | Type     | Description                              |
|---------------------|----------|------------------------------------------|
| id                  | string   | Unique identifier for the AI agent       |
| name                | string   | Name of the AI agent                     |
| model               | string   | AI model used by the agent               |
| status              | string   | Current status of the AI agent           |
| conversationsProcessed | integer | Number of conversations processed       |
| successRate         | string   | Success rate as a percentage string      |
| rawSuccessRate      | number   | Raw success rate percentage              |
| avgResponseTime     | string   | Average response time as a string        |
| rawResponseTime     | number   | Raw response time in seconds             |
| performance         | object   | Performance trend information            |

### SatisfactionCategory

| Field       | Type    | Description                          |
|-------------|---------|--------------------------------------|
| percentage  | number  | Percentage of conversations          |
| count       | integer | Number of conversations              |
| change      | number  | Change from previous period          |
| changeType  | string  | Direction of change                  |

### TimePeriodComparison

| Field              | Type   | Description                      |
|--------------------|--------|----------------------------------|
| label              | string | Human-readable period label      |
| startDate          | string | Start date in ISO 8601 format    |
| endDate            | string | End date in ISO 8601 format      |
| value              | mixed  | Aggregate value for the period   |
| aggregatedValues   | array  | Time-series values in the period |