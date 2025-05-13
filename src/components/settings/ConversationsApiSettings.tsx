import React, { useState, useEffect } from 'react';
import { useConversationsRepositories } from '../../context/ConversationsRepositoryContext';
import ApiLoginModal from '../login/ApiLoginModal';
import config from '../../config';
import { AuthService } from '../../data/api/AuthService';
import { ApiClient } from '../../data/api/ApiClient';

/**
 * Conversations API settings component that allows toggling between API and local data
 */
export const ConversationsApiSettings: React.FC = () => {
  const { isUsingApi, initialize, initialized } = useConversationsRepositories();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authStatus, setAuthStatus] = useState<{
    authenticated: boolean;
    user?: { username: string; role: string };
  }>({ authenticated: false });
  const [baseUrl, setBaseUrl] = useState<string>(
    localStorage.getItem('conversationsApiBaseUrl') || config.conversationsApi.baseUrl
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (isUsingApi) {
        try {
          // Create API client with stored configuration
          const apiClient = new ApiClient(
            localStorage.getItem('conversationsApiBaseUrl') || config.conversationsApi.baseUrl,
            localStorage.getItem('conversationsApiToken') || undefined,
            localStorage.getItem('conversationsApiClientSecret') || undefined,
            localStorage.getItem('conversationsApiClientId') || undefined
          );

          const authService = new AuthService(apiClient);
          const status = await authService.checkAuthStatus();
          setAuthStatus(status);
        } catch (error) {
          console.error('Failed to check authentication status:', error);
        }
      }
    };

    checkAuthStatus();
  }, [isUsingApi]);

  const handleConnect = async () => {
    setIsLoading(true);
    // Save the base URL to localStorage
    localStorage.setItem('conversationsApiBaseUrl', baseUrl);
    localStorage.setItem('conversationsApiEnabled', 'true');
    localStorage.setItem('conversationsApiAuthMethod', 'none');

    // Reinitialize with Conversations API data source
    try {
      await initialize();

      // Reload the application to apply changes
      window.location.reload();
    } catch (error) {
      console.error('Failed to initialize repositories after connecting:', error);
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    // Clear API credentials from localStorage
    localStorage.removeItem('conversationsApiEnabled');
    localStorage.removeItem('conversationsApiAuthMethod');
    localStorage.removeItem('conversationsApiClientSecret');
    localStorage.removeItem('conversationsApiClientId');
    localStorage.removeItem('conversationsApiToken');

    // Reinitialize with local data source
    try {
      const savedDataSize = localStorage.getItem('dataSize');
      await initialize(true, savedDataSize as any);

      // Reload the application to apply changes
      window.location.reload();
    } catch (error) {
      console.error('Failed to initialize repositories after disconnecting:', error);
      setIsLoading(false);
    }
  };

  // Show loading state if the repository is not yet initialized
  if (!initialized && !isLoading) {
    setIsLoading(true);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Conversations API Configuration</h2>

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Conversations API Connection</h3>
            <p className="text-sm text-gray-500">
              {isUsingApi
                ? 'Currently using the Conversations API for the Conversations page'
                : 'Currently using local data for the Conversations page'}
            </p>
          </div>

          {isUsingApi ? (
            <button
              onClick={handleDisconnect}
              disabled={isLoading}
              className={`px-4 py-2 ${isLoading ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'} text-white rounded-md`}
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect'}
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className={`px-4 py-2 ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md`}
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Conversations API URL
        </label>
        <input
          type="text"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          disabled={isLoading}
          className={`w-full px-3 py-2 border ${isLoading ? 'bg-gray-100' : 'bg-white'} border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="http://localhost:8001"
        />
        <p className="mt-1 text-sm text-gray-500">
          The base URL of your dedicated Conversations API server
        </p>
      </div>

      {isUsingApi && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">Connection Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600">API URL:</div>
            <div>{localStorage.getItem('conversationsApiBaseUrl') || config.conversationsApi.baseUrl}</div>

            <div className="text-gray-600">Authentication Method:</div>
            <div className="capitalize">
              {localStorage.getItem('conversationsApiAuthMethod') === 'none'
                ? 'No Authentication'
                : localStorage.getItem('conversationsApiAuthMethod') || config.conversationsApi.authMethod}
            </div>

            <div className="text-gray-600">Status:</div>
            <div className={
              localStorage.getItem('conversationsApiAuthMethod') === 'none'
                ? 'text-yellow-600'
                : (authStatus.authenticated ? 'text-green-600' : 'text-red-600')
            }>
              {localStorage.getItem('conversationsApiAuthMethod') === 'none'
                ? 'Public Access Only'
                : (authStatus.authenticated ? 'Authenticated' : 'Not Authenticated')}
            </div>

            {authStatus.authenticated && authStatus.user && (
              <>
                <div className="text-gray-600">User:</div>
                <div>{authStatus.user.username}</div>

                <div className="text-gray-600">Role:</div>
                <div className="capitalize">{authStatus.user.role}</div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 p-3 text-sm bg-blue-100 text-blue-800 rounded-md">
        <p>
          <strong>Note:</strong> This API is dedicated to the Conversations page only.
          Other parts of the application will continue to use the standard API.
        </p>
      </div>

      <ApiLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default ConversationsApiSettings;
