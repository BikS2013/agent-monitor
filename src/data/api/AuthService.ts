import { ApiClient } from './ApiClient';

/**
 * Authentication service for the Agent Monitor API
 * Handles the login process and token management
 */
export class AuthService {
  private apiClient: ApiClient;
  private tokenStorageKey = 'agent_monitor_api_token';
  private tokenExpiryKey = 'agent_monitor_token_expiry';
  
  /**
   * Create a new authentication service
   * @param apiClient The API client instance
   */
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
    
    // Try to restore token from localStorage if it exists
    const savedToken = localStorage.getItem(this.tokenStorageKey);
    const tokenExpiry = localStorage.getItem(this.tokenExpiryKey);
    
    if (savedToken && tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry, 10);
      
      // Check if the token is still valid (not expired)
      if (expiryTime > Date.now()) {
        this.apiClient.setAuthToken(savedToken);
      } else {
        // Token is expired, clear it
        this.clearToken();
      }
    }
  }
  
  /**
   * Login with username and password
   * @param username User's username
   * @param password User's password
   * @returns Authentication result with token information
   */
  public async login(username: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const tokenInfo = await this.apiClient.login(username, password);
      
      if (tokenInfo && tokenInfo.access_token) {
        // Store the token and its expiry time
        const expiryTime = Date.now() + (tokenInfo.expires_in * 1000);
        localStorage.setItem(this.tokenStorageKey, tokenInfo.access_token);
        localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: 'Authentication failed: Invalid response from server' 
        };
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      
      return { 
        success: false, 
        message: error.message || 'Authentication failed' 
      };
    }
  }
  
  /**
   * Login with API key
   * @param clientSecret Client secret for API key authentication
   * @param clientId Optional client ID for API key authentication
   * @returns Authentication result
   */
  public async loginWithApiKey(clientSecret: string, clientId?: string): Promise<{ success: boolean; message?: string }> {
    try {
      // The ApiClient will automatically use the API key for authentication
      // We just need to check that we can successfully authenticate
      
      const status = await this.apiClient.getAuthStatus();
      
      if (status && status.authenticated) {
        return { success: true };
      } else {
        return { 
          success: false, 
          message: 'API key authentication failed' 
        };
      }
    } catch (error: any) {
      console.error('API key authentication failed:', error);
      
      return { 
        success: false, 
        message: error.message || 'API key authentication failed' 
      };
    }
  }
  
  /**
   * Logout and clear token
   */
  public logout(): void {
    this.clearToken();
  }
  
  /**
   * Clear the authentication token and expiry time
   */
  private clearToken(): void {
    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.tokenExpiryKey);
    this.apiClient.clearAuthToken();
  }
  
  /**
   * Check if the user is currently authenticated
   * @returns True if authenticated, false otherwise
   */
  public isAuthenticated(): boolean {
    const savedToken = localStorage.getItem(this.tokenStorageKey);
    const tokenExpiry = localStorage.getItem(this.tokenExpiryKey);
    
    if (savedToken && tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry, 10);
      return expiryTime > Date.now();
    }
    
    return false;
  }
  
  /**
   * Get the current authentication token
   * @returns The JWT token if authenticated, null otherwise
   */
  public getToken(): string | null {
    if (this.isAuthenticated()) {
      return localStorage.getItem(this.tokenStorageKey);
    }
    
    return null;
  }
  
  /**
   * Check the current authentication status with the server
   * @returns Authentication status information
   */
  public async checkAuthStatus(): Promise<any> {
    // If we're using no-auth mode, return a special status
    if (localStorage.getItem('apiAuthMethod') === 'none') {
      return {
        authenticated: false,
        authMethod: 'none',
        publicAccess: true
      };
    }

    try {
      return await this.apiClient.getAuthStatus();
    } catch (error) {
      console.error('Failed to check authentication status:', error);
      return { authenticated: false };
    }
  }
}