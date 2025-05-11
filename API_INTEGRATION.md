# Agent Monitor API Integration Guide

This document provides a comprehensive guide for integrating the Agent Monitor front-end application with the Agent Monitor API.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Configuration](#configuration)
4. [Authentication](#authentication)
5. [Data Mapping](#data-mapping)
6. [Error Handling](#error-handling)
7. [Implementation Details](#implementation-details)
8. [Known Limitations](#known-limitations)
9. [Troubleshooting](#troubleshooting)

## Overview

The Agent Monitor application has been designed with a pluggable data source architecture that can work with both local JSON data and a remote API backend. This guide explains how the application integrates with the Agent Monitor API as described in `specs/client.py`.

The integration allows the application to:

- Authenticate with the API using JWT tokens or API keys
- Retrieve and manage conversations, collections, groups, and AI agents
- Handle errors and edge cases gracefully
- Provide a seamless user experience when switching between local and API data sources

## Architecture

The API integration follows a layered architecture:

1. **API Client Layer** (`ApiClient.ts`): Direct interface with the API, handling HTTP requests, authentication, and error formatting
2. **Data Source Layer** (`ApiDataSource.ts`): Implements the `IDataSource` interface, transforming API data to application models
3. **Repository Layer** (Various repository implementations): Business logic layer that interacts with the data source
4. **UI Layer**: React components that use the repositories via context providers

This separation of concerns allows for easy maintenance and future enhancements.

## Configuration

API settings can be configured in several ways:

### Environment Variables

The application supports the following environment variables:

- `ENV_API_ENABLED`: Enable/disable API integration (true/false)
- `ENV_API_BASE_URL`: API base URL
- `ENV_API_AUTH_METHOD`: Authentication method ('none', 'token', or 'api-key')
- `ENV_API_TOKEN`: JWT token (for 'token' auth method)
- `ENV_API_CLIENT_SECRET`: Client secret (for 'api-key' auth method)
- `ENV_API_CLIENT_ID`: Client ID (for 'api-key' auth method)

### Configuration File

Edit the `src/config.ts` file to modify default API settings:

```typescript
const defaultConfig: Config = {
  // ...
  api: {
    enabled: false,  // Set to true to enable API by default
    baseUrl: 'http://localhost:8000',
    authMethod: 'none',
  },
  // ...
};
```

### Local Storage

The application persists API settings in local storage, which takes precedence over environment variables and the configuration file when `preferLocalStorage` is set to `true`.

## Authentication

The application supports two authentication methods:

### JWT Token Authentication

JWT authentication uses username/password credentials to obtain a token:

1. User enters credentials in the login form
2. Application calls `/system/token` endpoint with credentials
3. Server returns JWT token and expiry information
4. Token is stored in local storage and used for subsequent requests

### API Key Authentication

API key authentication uses a client secret (and optionally a client ID):

1. User enters API key in the settings
2. Application includes key in `X-API-KEY` header for all requests
3. If provided, client ID is included in `X-Client-ID` header

### Authentication Flow

The `AuthService` class manages the authentication flow:

- Handles login/logout operations
- Stores tokens securely in local storage
- Manages token expiry
- Refreshes tokens when needed

## Data Mapping

The API data format doesn't always match the application's internal data model. The `ApiDataSource` class handles the necessary transformations:

### Key Transformation Areas

1. **Message Handling**: Messages are stored within conversation values in the API but are separate entities in the app
2. **Field Naming**: The API uses snake_case while the app uses camelCase
3. **IDs and References**: The app maintains relationships through ID references
4. **Timestamps**: Format standardization between API and app

### Transformation Methods

The ApiDataSource implements several transformation methods:

- `transformApiMessage`: Converts API message format to app message model
- `transformApiConversation`: Maps API conversation to app conversation model
- `transformApiCollection`: Converts API collection to app collection model
- Similar transforms for groups, AI agents, and users

## Error Handling

The application includes a robust error handling system:

1. **ApiError Class**: Standardizes error format across the application
2. **Error Context**: Provides global error handling and notification
3. **Error Notification Component**: Displays user-friendly error messages
4. **Safe API Call Helper**: Utility function to handle API calls with automatic error handling

### Error Types

The system handles several types of errors:

- **Network Errors**: When the API is unreachable
- **Authentication Errors**: For invalid or expired credentials
- **Validation Errors**: When request data doesn't meet API requirements
- **Resource Errors**: When requested resources don't exist
- **Server Errors**: For internal API errors

## Implementation Details

### Key Files

- `src/data/api/ApiClient.ts`: Core API client implementation
- `src/data/api/AuthService.ts`: Authentication service
- `src/data/api/ApiError.ts`: Error handling utilities
- `src/data/sources/ApiDataSource.ts`: Implementation of IDataSource interface for API
- `src/context/RepositoryContext.tsx`: Context provider for repositories
- `src/components/login/LoginForm.tsx`: Authentication UI
- `src/components/settings/ApiSettings.tsx`: API configuration UI
- `src/components/common/ErrorNotification.tsx`: Error display component

### API Endpoints

The application integrates with the following API endpoints:

- **Authentication**: `/system/token` and `/system/auth/status`
- **System Operations**: `/system/initialize`, `/system/save`, and `/system/cache/clear`
- **Conversations**: Various endpoints under `/conversation/`
- **Collections**: Various endpoints under `/collection/`
- **Groups**: Various endpoints under `/group/`
- **AI Agents**: Various endpoints under `/aiagent/`
- **Users**: Various endpoints under `/user/`

## Known Limitations

### Message Handling

The Python API client doesn't provide direct message manipulation endpoints. Messages are stored within the conversation's values field. This creates some limitations:

1. Individual message creation/update/deletion isn't supported
2. Message retrieval requires fetching the entire conversation

### Relationship Handling

Some relationship operations may require multiple API calls:

1. Adding a conversation to a collection requires updating the conversation entity
2. Message relationships must be maintained manually

### Pagination Differences

The API pagination model differs slightly from the application's expectations:

- API returns paginated data with `items` and `page_info` fields
- Application expects direct arrays or objects with IDs as keys

The `ApiDataSource` handles these differences but it's important to be aware of them.

## Troubleshooting

### Authentication Issues

If you experience authentication problems:

1. Check that the API server is running and accessible
2. Verify credentials are correct
3. Ensure token hasn't expired
4. Try clearing browser local storage and logging in again

### Data Retrieval Issues

If data isn't loading correctly:

1. Check browser console for specific error messages
2. Verify API URL is correct
3. Confirm authentication is working
4. Check network requests in browser dev tools for detailed error information

### API Format Issues

If data appears malformed:

1. The transformation functions in `ApiDataSource.ts` may need updates
2. Check for changes in the API response format
3. Update the mapping functions accordingly

---

For additional information about the API itself, please refer to:

- `specs/client.py`: Python client reference implementation
- `API_USAGE_GUIDE.md`: Detailed guide for using the API directly
- `swagger-api-spec.yaml`: OpenAPI specification for the API

For questions or issues, please contact the development team.