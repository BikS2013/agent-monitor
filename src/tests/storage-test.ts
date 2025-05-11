/**
 * Simple test for localStorage settings with API authorization
 * 
 * This script simulates setting the localStorage values that would be set by the 
 * UI when connecting to the API with no auth, and then prints the values that would be used.
 * 
 * Run with: ts-node src/tests/storage-test.ts
 */

// Simulate browser's localStorage
const localStorage = {
  items: new Map<string, string>(),
  getItem(key: string): string | null {
    return this.items.get(key) || null;
  },
  setItem(key: string, value: string): void {
    this.items.set(key, value);
  },
  removeItem(key: string): void {
    this.items.delete(key);
  },
  clear(): void {
    this.items.clear();
  }
};

// Mock configuration
const config = {
  api: {
    enabled: true,
    baseUrl: 'http://localhost:8000',
    authMethod: 'token',
    token: 'default-token',
    clientSecret: 'default-secret',
    clientId: 'default-id'
  },
  preferLocalStorage: true
};

// Simulate setting values in localStorage as if user connected with no-auth
console.log('Setting up localStorage values for API with no-auth...');
localStorage.setItem('apiEnabled', 'true');
localStorage.setItem('apiAuthMethod', 'none');
localStorage.removeItem('agent_monitor_api_token');
localStorage.removeItem('apiClientSecret');
localStorage.removeItem('apiClientId');

// Simulate the logic from RepositoryContext
function getApiSettings() {
  // Check if API is enabled
  const savedApiEnabled = localStorage.getItem('apiEnabled');
  const useApi = config.preferLocalStorage && savedApiEnabled !== null
    ? savedApiEnabled === 'true'
    : config.api.enabled;

  if (!useApi) {
    console.log('API not enabled');
    return null;
  }

  // Get authentication method from localStorage if available
  const savedAuthMethod = localStorage.getItem('apiAuthMethod');
  const authMethod = config.preferLocalStorage && savedAuthMethod 
    ? savedAuthMethod
    : config.api.authMethod;
  
  // Determine if we're using no authentication
  const useNoAuth = authMethod === 'none';
  
  // Get token from localStorage if using token auth
  const savedToken = authMethod === 'token' 
    ? localStorage.getItem('agent_monitor_api_token') 
    : undefined;
    
  // Get client secret and ID from localStorage if using API key auth
  const savedClientSecret = authMethod === 'api-key' 
    ? localStorage.getItem('apiClientSecret') 
    : undefined;
  const savedClientId = authMethod === 'api-key' 
    ? localStorage.getItem('apiClientId') 
    : undefined;
  
  return {
    baseUrl: config.api.baseUrl,
    authMethod,
    token: authMethod === 'token' ? (savedToken || config.api.token) : undefined,
    clientSecret: authMethod === 'api-key' ? (savedClientSecret || config.api.clientSecret) : undefined,
    clientId: authMethod === 'api-key' ? (savedClientId || config.api.clientId) : undefined,
    useNoAuth
  };
}

// Run the test
const settings = getApiSettings();
console.log('\nAPI Settings that would be used:');
console.log(JSON.stringify(settings, null, 2));

// Test different scenarios
console.log('\n--- Testing different scenarios ---');

// Scenario 1: config prefers config over localStorage
console.log('\nScenario 1: preferLocalStorage = false');
config.preferLocalStorage = false;
console.log(JSON.stringify(getApiSettings(), null, 2));

// Scenario 2: token auth
console.log('\nScenario 2: Token auth');
config.preferLocalStorage = true;
localStorage.setItem('apiAuthMethod', 'token');
localStorage.setItem('agent_monitor_api_token', 'localStorage-token');
console.log(JSON.stringify(getApiSettings(), null, 2));

// Scenario 3: API key auth
console.log('\nScenario 3: API key auth');
localStorage.setItem('apiAuthMethod', 'api-key');
localStorage.setItem('apiClientSecret', 'localStorage-secret');
localStorage.setItem('apiClientId', 'localStorage-id');
console.log(JSON.stringify(getApiSettings(), null, 2));

// Scenario 4: Back to no-auth
console.log('\nScenario 4: Back to no-auth');
localStorage.setItem('apiAuthMethod', 'none');
localStorage.removeItem('agent_monitor_api_token');
localStorage.removeItem('apiClientSecret');
localStorage.removeItem('apiClientId');
console.log(JSON.stringify(getApiSettings(), null, 2));