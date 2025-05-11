import React, { useState } from 'react';
import { AuthService } from '../../data/api/AuthService';
import { ApiClient } from '../../data/api/ApiClient';
import config from '../../config';

interface LoginFormProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

/**
 * Login form component for API authentication
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [clientId, setClientId] = useState('');
  const [authMethod, setAuthMethod] = useState<'token' | 'api-key' | 'none'>(
    config.api.authMethod === 'api-key' ? 'api-key' :
    config.api.authMethod === 'none' ? 'none' : 'token'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create API client and auth service
  const apiClient = new ApiClient(
    config.api.baseUrl,
    config.api.token,
    config.api.clientSecret,
    config.api.clientId
  );
  const authService = new AuthService(apiClient);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // For no-auth mode, we skip authentication and just set localStorage values
      if (authMethod === 'none') {
        // Store auth method in localStorage
        localStorage.setItem('apiEnabled', 'true');
        localStorage.setItem('apiAuthMethod', 'none');

        // Clear any existing auth credentials
        localStorage.removeItem('apiClientSecret');
        localStorage.removeItem('apiClientId');
        localStorage.removeItem('agent_monitor_api_token');
        localStorage.removeItem('agent_monitor_token_expiry');

        // Notify parent component of successful connection
        onLoginSuccess();
        return;
      }

      // For token and api-key auth methods
      let result;

      if (authMethod === 'token') {
        result = await authService.login(username, password);
      } else {
        result = await authService.loginWithApiKey(clientSecret, clientId);
      }

      if (result.success) {
        // Store auth method and credentials in localStorage
        localStorage.setItem('apiEnabled', 'true');
        localStorage.setItem('apiAuthMethod', authMethod);

        if (authMethod === 'api-key') {
          localStorage.setItem('apiClientSecret', clientSecret);
          if (clientId) {
            localStorage.setItem('apiClientId', clientId);
          }
        }

        // Notify parent component of successful login
        onLoginSuccess();
      } else {
        setError(result.message || 'Authentication failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Connect to API</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="authMethod"
              checked={authMethod === 'token'}
              onChange={() => setAuthMethod('token')}
              className="mr-2"
            />
            <span>JWT Token (Username/Password)</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="authMethod"
              checked={authMethod === 'api-key'}
              onChange={() => setAuthMethod('api-key')}
              className="mr-2"
            />
            <span>API Key</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="authMethod"
              checked={authMethod === 'none'}
              onChange={() => setAuthMethod('none')}
              className="mr-2"
            />
            <span>No Authentication</span>
          </label>
        </div>
      </div>
      
      <div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">API URL</label>
          <input
            type="text"
            value={config.api.baseUrl}
            readOnly
            disabled
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
          />
          <p className="text-sm text-gray-500 mt-1">
            Configure API URL in application settings
          </p>
        </div>

        {authMethod === 'token' && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </>
        )}

        {authMethod === 'api-key' && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">API Key (Client Secret)</label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Client ID (Optional)</label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </>
        )}

        {authMethod === 'none' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">
              <strong>No Authentication Mode:</strong> You'll connect to the API without sending any authentication credentials.
            </p>
            <p className="text-yellow-700 mt-2 text-sm">
              This mode should only be used for public APIs or development environments.
              Access will be limited to endpoints that don't require authentication.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading
              ? 'Connecting...'
              : authMethod === 'none'
                ? 'Connect without Auth'
                : 'Connect'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;