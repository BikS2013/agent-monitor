# No-Auth API Access Implementation

This document explains how the no-auth API access option was implemented to allow accessing the API without authentication (neither JWT tokens nor API keys).

## Overview

The implementation allows the application to connect to the API without sending authentication credentials in request headers. This is useful for:

1. Public API endpoints that don't require authentication
2. Development and testing environments
3. Publicly accessible data that doesn't need protection
4. Services that handle authentication through other means (e.g., IP restrictions)

## Implementation Details

### 1. ApiClient.ts

Added a new `noAuth` parameter to the `ApiClient` constructor:

```typescript
constructor(
  baseUrl: string = 'http://localhost:8000',
  authToken?: string,
  private clientSecret?: string,
  private clientId?: string,
  private noAuth: boolean = false
) {
  // ...
}
```

Updated the request interceptor to skip adding authentication headers when `noAuth` is true:

```typescript
this.apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    config.headers = config.headers || {};

    // Skip authentication if noAuth is true
    if (!this.noAuth) {
      // Add authentication headers...
    }

    return config;
  },
  // ...
);
```

### 2. ApiDataSource.ts

Updated the constructor to accept and pass the `noAuth` parameter to the ApiClient:

```typescript
constructor(
  baseUrl: string = 'http://localhost:8000',
  authToken?: string,
  clientSecret?: string,
  clientId?: string,
  noAuth: boolean = false
) {
  this.apiClient = new ApiClient(baseUrl, authToken, clientSecret, clientId, noAuth);
}
```

### 3. RepositoryContext.tsx

Updated the repository initialization to determine if no-auth mode should be used based on the config:

```typescript
// Determine if we're using no authentication
const useNoAuth = config.api.authMethod === 'none';

// Create API data source with the appropriate configuration
effectiveDataSource = new ApiDataSource(
  config.api.baseUrl,
  config.api.authMethod === 'token' ? config.api.token : undefined,
  config.api.authMethod === 'api-key' ? config.api.clientSecret : undefined,
  config.api.authMethod === 'api-key' ? config.api.clientId : undefined,
  useNoAuth
);
```

### 4. Documentation

Updated the `API_INTEGRATION_GUIDE.md` to document the three authentication methods:
- JWT Token Authentication
- API Key Authentication
- No Authentication

## Testing

Created a simple test script at `src/tests/api-no-auth-test.ts` to verify the no-auth API client works correctly.

## Usage

To use the API without authentication:

1. Set the API configuration in the application:
   ```typescript
   {
     enabled: true,
     baseUrl: 'http://your-api-url',
     authMethod: 'none'
   }
   ```

2. The application will initialize the API data source with the `noAuth` flag set to `true`.

3. All API requests will be sent without authentication headers.

## Security Considerations

- Only use no-auth mode for non-sensitive data and operations
- Consider implementing IP restrictions on the server for public endpoints
- Ensure proper access controls are still enforced on the server side
- Consider rate limiting to prevent abuse
- Monitor API usage to detect unusual patterns

## Future Improvements

- Add support for API endpoint-specific authentication requirements
- Implement different authentication strategies for different data types
- Add user interface controls to easily switch between auth modes for testing