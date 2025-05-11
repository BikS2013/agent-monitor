# Settings Tab API Specification

This document outlines the API requirements for the Settings tab in the Agent Monitor dashboard application.

## Overview

The Settings API provides endpoints for managing user profiles, notification preferences, security settings, data source configuration, data management policies, and AI system configuration parameters. It enables complete customization and administration of the Agent Monitor platform.

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

### 1. Get User Profile

Retrieves the current user's profile information.

```
GET /settings/user/profile
```

#### Response

```json
{
  "id": "user-123",
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin",
  "permissions": ["read:all", "write:all", "admin:settings"],
  "preferences": {
    "language": "English",
    "timezone": "America/New_York",
    "theme": "light"
  },
  "lastLogin": "2023-06-16T08:30:15Z",
  "created": "2023-01-10T14:22:30Z"
}
```

### 2. Update User Profile

Updates the current user's profile information.

```
PUT /settings/user/profile
```

#### Request Body

```json
{
  "email": "admin@example.com",
  "preferences": {
    "language": "Greek",
    "timezone": "Europe/Athens"
  }
}
```

| Field                | Type   | Required | Description                                  |
|----------------------|--------|----------|----------------------------------------------|
| email                | string | No       | User's email address                         |
| preferences          | object | No       | User preferences                             |
| preferences.language | string | No       | Preferred language                           |
| preferences.timezone | string | No       | Preferred timezone                           |
| preferences.theme    | string | No       | UI theme preference (light or dark)          |

#### Response

```json
{
  "id": "user-123",
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin",
  "permissions": ["read:all", "write:all", "admin:settings"],
  "preferences": {
    "language": "Greek",
    "timezone": "Europe/Athens",
    "theme": "light"
  },
  "lastLogin": "2023-06-16T08:30:15Z",
  "created": "2023-01-10T14:22:30Z"
}
```

### 3. Get Notification Settings

Retrieves the current user's notification settings.

```
GET /settings/notifications
```

#### Response

```json
{
  "emailNotifications": true,
  "aiFailureAlerts": true,
  "weeklyReports": false,
  "notificationChannels": {
    "email": true,
    "inApp": true,
    "slack": false
  },
  "priorityThreshold": "medium",
  "digestFrequency": "daily",
  "mutedCategories": ["low-priority-updates"],
  "customNotifications": [
    {
      "id": "custom-1",
      "name": "New AI Agent Deployment",
      "enabled": true,
      "channels": ["email", "inApp"]
    }
  ]
}
```

### 4. Update Notification Settings

Updates the current user's notification settings.

```
PUT /settings/notifications
```

#### Request Body

```json
{
  "emailNotifications": true,
  "aiFailureAlerts": true,
  "weeklyReports": true,
  "notificationChannels": {
    "email": true,
    "inApp": true,
    "slack": false
  },
  "priorityThreshold": "medium",
  "digestFrequency": "daily",
  "mutedCategories": ["low-priority-updates"]
}
```

| Field               | Type     | Required | Description                               |
|---------------------|----------|----------|-------------------------------------------|
| emailNotifications  | boolean  | No       | Enable/disable email notifications        |
| aiFailureAlerts     | boolean  | No       | Enable/disable AI failure alerts          |
| weeklyReports       | boolean  | No       | Enable/disable weekly report emails       |
| notificationChannels| object   | No       | Channel-specific settings                 |
| priorityThreshold   | string   | No       | Minimum priority for notifications        |
| digestFrequency     | string   | No       | Frequency of digest notifications         |
| mutedCategories     | string[] | No       | Categories to mute notifications for      |

#### Response

```json
{
  "emailNotifications": true,
  "aiFailureAlerts": true,
  "weeklyReports": true,
  "notificationChannels": {
    "email": true,
    "inApp": true,
    "slack": false
  },
  "priorityThreshold": "medium",
  "digestFrequency": "daily",
  "mutedCategories": ["low-priority-updates"],
  "customNotifications": [
    {
      "id": "custom-1",
      "name": "New AI Agent Deployment",
      "enabled": true,
      "channels": ["email", "inApp"]
    }
  ]
}
```

### 5. Get Security Settings

Retrieves the current user's security settings.

```
GET /settings/security
```

#### Response

```json
{
  "twoFactorAuthentication": {
    "enabled": false,
    "type": null,
    "lastVerified": null
  },
  "sessionTimeout": 60,
  "lastPasswordChange": "2023-03-15T10:22:45Z",
  "passwordExpiresAt": "2023-09-15T10:22:45Z",
  "loginHistory": [
    {
      "timestamp": "2023-06-16T08:30:15Z",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "successful": true
    },
    {
      "timestamp": "2023-06-15T14:22:10Z",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "successful": true
    }
  ],
  "apiKeys": [
    {
      "id": "key-123",
      "name": "Development API Key",
      "created": "2023-04-10T09:15:30Z",
      "lastUsed": "2023-06-15T16:42:12Z",
      "permissions": ["read:conversations", "read:agents"]
    }
  ]
}
```

### 6. Enable Two-Factor Authentication

Enables two-factor authentication for the current user.

```
POST /settings/security/2fa/enable
```

#### Request Body

```json
{
  "type": "totp"
}
```

| Field   | Type   | Required | Description                                        |
|---------|--------|----------|----------------------------------------------------|
| type    | string | Yes      | Type of 2FA (options: "totp", "sms", "email")      |

#### Response

```json
{
  "setupRequired": true,
  "setupInfo": {
    "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoA...",
    "manualEntryKey": "JBSWY3DPEHPK3PXP",
    "verificationRequired": true
  },
  "backupCodes": [
    "12345-67890",
    "abcde-fghij",
    "klmno-pqrst",
    "uvwxy-zabcd",
    "efghi-jklmn"
  ]
}
```

### 7. Verify Two-Factor Authentication

Verifies the setup of two-factor authentication.

```
POST /settings/security/2fa/verify
```

#### Request Body

```json
{
  "verificationCode": "123456"
}
```

| Field            | Type   | Required | Description                               |
|------------------|--------|----------|-------------------------------------------|
| verificationCode | string | Yes      | Verification code from authenticator app   |

#### Response

```json
{
  "success": true,
  "enabled": true,
  "recoveryCodes": [
    "12345-67890",
    "abcde-fghij",
    "klmno-pqrst",
    "uvwxy-zabcd",
    "efghi-jklmn"
  ]
}
```

### 8. Disable Two-Factor Authentication

Disables two-factor authentication for the current user.

```
POST /settings/security/2fa/disable
```

#### Request Body

```json
{
  "verificationCode": "123456"
}
```

| Field            | Type   | Required | Description                                |
|------------------|--------|----------|--------------------------------------------|
| verificationCode | string | Yes      | Verification code from authenticator app    |

#### Response

```json
{
  "success": true,
  "enabled": false
}
```

### 9. Change Password

Changes the current user's password.

```
POST /settings/security/password
```

#### Request Body

```json
{
  "currentPassword": "current-password-123",
  "newPassword": "new-password-456",
  "confirmPassword": "new-password-456"
}
```

| Field           | Type   | Required | Description                                |
|-----------------|--------|----------|--------------------------------------------|
| currentPassword | string | Yes      | Current password                           |
| newPassword     | string | Yes      | New password                               |
| confirmPassword | string | Yes      | Confirmation of new password               |

#### Response

```json
{
  "success": true,
  "lastPasswordChange": "2023-06-16T15:30:00Z",
  "passwordExpiresAt": "2023-12-16T15:30:00Z"
}
```

### 10. Get Data Source Settings

Retrieves data source configuration settings.

```
GET /settings/data-source
```

#### Response

```json
{
  "currentSource": "api",
  "api": {
    "baseUrl": "https://api.agent-monitor.example/v1",
    "authMethod": "token",
    "connected": true,
    "status": "healthy",
    "lastSyncTime": "2023-06-16T14:45:22Z"
  },
  "local": {
    "available": true,
    "datasetSizes": [
      {
        "name": "small",
        "description": "~200 messages, ~100 conversations",
        "sizeInMb": 0.5
      },
      {
        "name": "medium",
        "description": "~5,000 messages, ~500 conversations",
        "sizeInMb": 2.3
      },
      {
        "name": "large",
        "description": "~20,000 messages, ~2,000 conversations",
        "sizeInMb": 8.7
      }
    ],
    "currentDatasetSize": "medium",
    "lastUpdated": "2023-06-15T00:00:00Z"
  },
  "allowDatasetChange": true,
  "preferLocalStorage": true,
  "connections": {
    "database": {
      "type": "postgresql",
      "status": "connected",
      "lastCheckTime": "2023-06-16T15:00:12Z"
    },
    "cache": {
      "type": "redis",
      "status": "connected",
      "lastCheckTime": "2023-06-16T15:00:12Z"
    }
  }
}
```

### 11. Update Data Source Settings

Updates data source configuration settings.

```
PUT /settings/data-source
```

#### Request Body

```json
{
  "currentSource": "local",
  "local": {
    "currentDatasetSize": "large"
  },
  "preferLocalStorage": true
}
```

| Field                | Type    | Required | Description                                    |
|----------------------|---------|----------|------------------------------------------------|
| currentSource        | string  | No       | Data source type ("api" or "local")            |
| local                | object  | No       | Local data source settings                     |
| local.currentDatasetSize | string | No   | Size of dataset to use                         |
| preferLocalStorage   | boolean | No       | Whether to prefer localStorage for settings    |

#### Response

```json
{
  "currentSource": "local",
  "api": {
    "baseUrl": "https://api.agent-monitor.example/v1",
    "authMethod": "token",
    "connected": false,
    "status": "disconnected",
    "lastSyncTime": "2023-06-16T14:45:22Z"
  },
  "local": {
    "available": true,
    "datasetSizes": [
      {
        "name": "small",
        "description": "~200 messages, ~100 conversations",
        "sizeInMb": 0.5
      },
      {
        "name": "medium",
        "description": "~5,000 messages, ~500 conversations",
        "sizeInMb": 2.3
      },
      {
        "name": "large",
        "description": "~20,000 messages, ~2,000 conversations",
        "sizeInMb": 8.7
      }
    ],
    "currentDatasetSize": "large",
    "lastUpdated": "2023-06-15T00:00:00Z"
  },
  "allowDatasetChange": true,
  "preferLocalStorage": true,
  "connections": {
    "database": {
      "type": "postgresql",
      "status": "connected",
      "lastCheckTime": "2023-06-16T15:00:12Z"
    },
    "cache": {
      "type": "redis",
      "status": "connected",
      "lastCheckTime": "2023-06-16T15:00:12Z"
    }
  }
}
```

### 12. Connect to API

Establishes a connection to the API with provided credentials.

```
POST /settings/data-source/api/connect
```

#### Request Body

```json
{
  "authMethod": "token",
  "credentials": {
    "username": "admin@example.com",
    "password": "password123"
  }
}
```

| Field         | Type   | Required | Description                                          |
|---------------|--------|----------|------------------------------------------------------|
| authMethod    | string | Yes      | Authentication method (options: "token", "api-key", "none") |
| credentials   | object | Depends  | Auth credentials (required unless authMethod is "none") |

For token auth:
```json
"credentials": {
  "username": "admin@example.com",
  "password": "password123"
}
```

For API key auth:
```json
"credentials": {
  "clientSecret": "abc123def456",
  "clientId": "client123"
}
```

#### Response

```json
{
  "success": true,
  "connected": true,
  "connectionDetails": {
    "apiUrl": "https://api.agent-monitor.example/v1",
    "authMethod": "token",
    "user": {
      "username": "admin@example.com",
      "role": "admin"
    },
    "expiresAt": "2023-06-17T15:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 13. Disconnect from API

Disconnects from the API and reverts to local data source.

```
POST /settings/data-source/api/disconnect
```

#### Response

```json
{
  "success": true,
  "connected": false,
  "currentSource": "local"
}
```

### 14. Get Data Management Settings

Retrieves data management settings.

```
GET /settings/data-management
```

#### Response

```json
{
  "retentionPolicies": {
    "conversations": {
      "period": "90days",
      "enabled": true
    },
    "userSessions": {
      "period": "30days",
      "enabled": true
    },
    "systemLogs": {
      "period": "1year",
      "enabled": true
    }
  },
  "archiving": {
    "autoArchiveEnabled": true,
    "archiveAfterDays": 30,
    "storageLocation": "local",
    "compressionEnabled": true
  },
  "backup": {
    "autoBackupEnabled": true,
    "frequency": "daily",
    "lastBackupTime": "2023-06-16T00:05:12Z",
    "nextBackupTime": "2023-06-17T00:00:00Z",
    "storageLocations": ["local", "cloud"]
  },
  "dataExport": {
    "availableFormats": ["json", "csv", "xlsx"],
    "defaultFormat": "json",
    "encryptionEnabled": true
  },
  "dataCleaning": {
    "automaticCleanupEnabled": true,
    "cleanupFrequency": "weekly",
    "nextCleanupTime": "2023-06-18T00:00:00Z"
  }
}
```

### 15. Update Data Management Settings

Updates data management settings.

```
PUT /settings/data-management
```

#### Request Body

```json
{
  "retentionPolicies": {
    "conversations": {
      "period": "180days",
      "enabled": true
    }
  },
  "archiving": {
    "autoArchiveEnabled": true,
    "archiveAfterDays": 60
  }
}
```

| Field                             | Type    | Required | Description                               |
|-----------------------------------|---------|----------|-------------------------------------------|
| retentionPolicies                 | object  | No       | Data retention policy settings            |
| retentionPolicies.conversations   | object  | No       | Conversation retention settings          |
| retentionPolicies.conversations.period | string | No   | Retention period                        |
| retentionPolicies.conversations.enabled | boolean | No | Whether retention policy is enabled     |
| archiving                         | object  | No       | Archiving settings                       |
| archiving.autoArchiveEnabled      | boolean | No       | Enable auto-archiving                   |
| archiving.archiveAfterDays        | number  | No       | Days after which to archive             |

#### Response

```json
{
  "retentionPolicies": {
    "conversations": {
      "period": "180days",
      "enabled": true
    },
    "userSessions": {
      "period": "30days",
      "enabled": true
    },
    "systemLogs": {
      "period": "1year",
      "enabled": true
    }
  },
  "archiving": {
    "autoArchiveEnabled": true,
    "archiveAfterDays": 60,
    "storageLocation": "local",
    "compressionEnabled": true
  },
  "backup": {
    "autoBackupEnabled": true,
    "frequency": "daily",
    "lastBackupTime": "2023-06-16T00:05:12Z",
    "nextBackupTime": "2023-06-17T00:00:00Z",
    "storageLocations": ["local", "cloud"]
  },
  "dataExport": {
    "availableFormats": ["json", "csv", "xlsx"],
    "defaultFormat": "json",
    "encryptionEnabled": true
  },
  "dataCleaning": {
    "automaticCleanupEnabled": true,
    "cleanupFrequency": "weekly",
    "nextCleanupTime": "2023-06-18T00:00:00Z"
  }
}
```

### 16. Get AI Configuration Settings

Retrieves AI system configuration settings.

```
GET /settings/ai-configuration
```

#### Response

```json
{
  "responseThresholds": {
    "defaultTimeThreshold": 5,
    "minConfidenceThreshold": 75,
    "escalationTimeout": 15
  },
  "promptTemplates": [
    {
      "id": "template-1",
      "name": "Customer Support Standard",
      "template": "You are a customer support agent for our company...",
      "defaultForAgentType": "customer-support"
    },
    {
      "id": "template-2",
      "name": "Technical Support Standard",
      "template": "You are a technical support agent...",
      "defaultForAgentType": "technical-support"
    }
  ],
  "modelDefaults": {
    "temperatureSettings": {
      "customer-support": 0.7,
      "technical-support": 0.5,
      "sales": 0.8
    },
    "maxTokens": 1024,
    "stopSequences": ["\n\nUser:"],
    "topK": 40,
    "topP": 0.95
  },
  "priorityRouting": {
    "enabled": true,
    "rules": [
      {
        "priority": "high",
        "conditions": {
          "userTags": ["premium", "enterprise"],
          "keywords": ["urgent", "error", "critical"]
        }
      }
    ]
  },
  "trainingSchedule": {
    "enabled": true,
    "frequency": "weekly",
    "dayOfWeek": "sunday",
    "timeOfDay": "02:00",
    "lastTrainingRun": "2023-06-11T02:00:00Z",
    "nextTrainingRun": "2023-06-18T02:00:00Z"
  }
}
```

### 17. Update AI Configuration Settings

Updates AI system configuration settings.

```
PUT /settings/ai-configuration
```

#### Request Body

```json
{
  "responseThresholds": {
    "defaultTimeThreshold": 3,
    "minConfidenceThreshold": 80
  },
  "modelDefaults": {
    "temperatureSettings": {
      "customer-support": 0.8
    }
  }
}
```

| Field                            | Type    | Required | Description                                |
|----------------------------------|---------|----------|--------------------------------------------|
| responseThresholds               | object  | No       | Response threshold settings                |
| responseThresholds.defaultTimeThreshold | number | No | Default time threshold in seconds         |
| responseThresholds.minConfidenceThreshold | number | No | Minimum confidence threshold percentage |
| modelDefaults                    | object  | No       | Model default settings                     |
| modelDefaults.temperatureSettings | object | No      | Temperature settings by agent type         |

#### Response

```json
{
  "responseThresholds": {
    "defaultTimeThreshold": 3,
    "minConfidenceThreshold": 80,
    "escalationTimeout": 15
  },
  "promptTemplates": [
    {
      "id": "template-1",
      "name": "Customer Support Standard",
      "template": "You are a customer support agent for our company...",
      "defaultForAgentType": "customer-support"
    },
    {
      "id": "template-2",
      "name": "Technical Support Standard",
      "template": "You are a technical support agent...",
      "defaultForAgentType": "technical-support"
    }
  ],
  "modelDefaults": {
    "temperatureSettings": {
      "customer-support": 0.8,
      "technical-support": 0.5,
      "sales": 0.8
    },
    "maxTokens": 1024,
    "stopSequences": ["\n\nUser:"],
    "topK": 40,
    "topP": 0.95
  },
  "priorityRouting": {
    "enabled": true,
    "rules": [
      {
        "priority": "high",
        "conditions": {
          "userTags": ["premium", "enterprise"],
          "keywords": ["urgent", "error", "critical"]
        }
      }
    ]
  },
  "trainingSchedule": {
    "enabled": true,
    "frequency": "weekly",
    "dayOfWeek": "sunday",
    "timeOfDay": "02:00",
    "lastTrainingRun": "2023-06-11T02:00:00Z",
    "nextTrainingRun": "2023-06-18T02:00:00Z"
  }
}
```

### 18. Export Settings

Exports all settings as a configuration file.

```
GET /settings/export
```

#### Query Parameters

| Parameter | Type   | Required | Description                                    |
|-----------|--------|----------|------------------------------------------------|
| format    | string | No       | Export format (default: "json", options: "json", "yaml") |
| sections  | string | No       | Comma-separated list of sections to export (default: all sections) |

#### Response

```
Content-Type: application/json
Content-Disposition: attachment; filename=agent-monitor-settings.json
```

```json
{
  "version": "1.0",
  "exportDate": "2023-06-16T16:00:00Z",
  "settings": {
    "user": {
      "preferences": {
        "language": "English",
        "timezone": "America/New_York",
        "theme": "light"
      }
    },
    "notifications": {
      "emailNotifications": true,
      "aiFailureAlerts": true,
      "weeklyReports": true
    },
    "security": {
      "sessionTimeout": 60,
      "passwordPolicy": {
        "expiryDays": 180,
        "minLength": 12,
        "requireSpecialCharacters": true
      }
    },
    "dataSource": {
      "preferLocalStorage": true
    },
    "dataManagement": {
      "retentionPolicies": {
        "conversations": {
          "period": "180days",
          "enabled": true
        }
      }
    },
    "aiConfiguration": {
      "responseThresholds": {
        "defaultTimeThreshold": 3,
        "minConfidenceThreshold": 80
      }
    }
  }
}
```

### 19. Import Settings

Imports settings from a configuration file.

```
POST /settings/import
```

#### Request Body

```
Content-Type: multipart/form-data
```

| Field       | Type   | Required | Description                  |
|-------------|--------|----------|------------------------------|
| configFile  | file   | Yes      | Configuration file to import |
| overwrite   | boolean| No       | Whether to overwrite existing settings (default: false) |
| sections    | string | No       | Comma-separated list of sections to import (default: all sections) |

#### Response

```json
{
  "success": true,
  "importedSections": ["user", "notifications", "security", "dataManagement", "aiConfiguration"],
  "skippedSections": [],
  "warnings": [],
  "restartRequired": false
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "message": "Invalid request parameters",
  "details": ["Invalid time threshold value. Must be between 1 and 60 seconds."]
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
  "details": ["User does not have settings access privileges"]
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

### User Preferences

| Field     | Type   | Description                         |
|-----------|--------|-------------------------------------|
| language  | string | User's preferred language           |
| timezone  | string | User's preferred timezone           |
| theme     | string | UI theme preference (light or dark) |

### Authentication Method

| Value       | Description                                    |
|-------------|------------------------------------------------|
| token       | JWT token authentication (username/password)   |
| api-key     | API key authentication                         |
| none        | No authentication (public API access)          |

### Notification Settings

| Field              | Type     | Description                               |
|--------------------|----------|-------------------------------------------|
| emailNotifications | boolean  | Enable/disable email notifications        |
| aiFailureAlerts    | boolean  | Enable/disable AI failure alerts          |
| weeklyReports      | boolean  | Enable/disable weekly report emails       |
| notificationChannels | object | Channel-specific settings                 |
| priorityThreshold  | string   | Minimum priority for notifications        |
| digestFrequency    | string   | Frequency of digest notifications         |
| mutedCategories    | string[] | Categories to mute notifications for      |

### Data Source Settings

| Field               | Type     | Description                              |
|---------------------|----------|------------------------------------------|
| currentSource       | string   | Current data source (api or local)       |
| api                 | object   | API connection settings                  |
| local               | object   | Local data settings                      |
| allowDatasetChange  | boolean  | Whether dataset changes are allowed      |
| preferLocalStorage  | boolean  | Whether to prefer localStorage           |

### AI Configuration Settings

| Field             | Type     | Description                              |
|-------------------|----------|------------------------------------------|
| responseThresholds | object  | Response time/confidence thresholds     |
| promptTemplates    | array   | Available prompt templates              |
| modelDefaults      | object  | Default model parameters                |
| priorityRouting    | object  | Priority routing configuration          |
| trainingSchedule   | object  | Model training schedule                 |