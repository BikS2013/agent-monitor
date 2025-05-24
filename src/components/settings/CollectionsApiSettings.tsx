import React, { useState, useEffect } from 'react';
import { useRepositories } from '../../context/RepositoryContext';
import ApiLoginModal from '../login/ApiLoginModal';
import config from '../../config';
import { AuthService } from '../../data/api/AuthService';
import { ApiClient } from '../../data/api/ApiClient';

/**
 * Collections API settings component that allows toggling between API and local data
 */
export const CollectionsApiSettings: React.FC = () => {
  const { initialize } = useRepositories();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authStatus, setAuthStatus] = useState<{
    authenticated: boolean;
    user?: { username: string; role: string };
  }>({ authenticated: false });
  const [baseUrl, setBaseUrl] = useState<string>(
    localStorage.getItem('collectionsApiBaseUrl') || 'http://localhost:8002'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(
    localStorage.getItem('collectionsApiEnabled') === 'true'
  );

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (isEnabled) {
        try {
          // Create API client with stored configuration
          const apiClient = new ApiClient(
            localStorage.getItem('collectionsApiBaseUrl') || 'http://localhost:8002',
            localStorage.getItem('collectionsApiToken') || undefined,
            localStorage.getItem('collectionsApiClientSecret') || undefined,
            localStorage.getItem('collectionsApiClientId') || undefined
          );

          const authService = new AuthService(apiClient);
          const status = await authService.checkAuthStatus();
          setAuthStatus(status);
        } catch (error) {
          console.error('Failed to check Collections API authentication status:', error);
        }
      }
    };

    checkAuthStatus();
  }, [isEnabled]);

  const handleConnect = async () => {
    setIsLoading(true);
    // Save the base URL to localStorage
    localStorage.setItem('collectionsApiBaseUrl', baseUrl);
    localStorage.setItem('collectionsApiEnabled', 'true');
    localStorage.setItem('collectionsApiAuthMethod', 'none');

    // Reinitialize with Collections API data source for collections only
    try {
      await initialize();
      setIsEnabled(true);

      // Reload the application to apply changes
      window.location.reload();
    } catch (error) {
      console.error('Failed to initialize repositories after connecting to Collections API:', error);
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    // Clear Collections API credentials from localStorage
    localStorage.removeItem('collectionsApiEnabled');
    localStorage.removeItem('collectionsApiAuthMethod');
    localStorage.removeItem('collectionsApiClientSecret');
    localStorage.removeItem('collectionsApiClientId');
    localStorage.removeItem('collectionsApiToken');

    // Reinitialize with local data source
    try {
      const savedDataSize = localStorage.getItem('dataSize');
      await initialize(undefined, savedDataSize as any);
      setIsEnabled(false);

      // Reload the application to apply changes
      window.location.reload();
    } catch (error) {
      console.error('Failed to initialize repositories after disconnecting from Collections API:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Collections API Configuration</h2>

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Collections API Connection</h3>
            <p className="text-sm text-gray-500">
              {isEnabled
                ? 'Currently using the Collections API for collections data'
                : 'Currently using local data for collections'}
            </p>
          </div>

          {isEnabled ? (
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
          Collections API URL
        </label>
        <input
          type="text"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          disabled={isLoading}
          className={`w-full px-3 py-2 border ${isLoading ? 'bg-gray-100' : 'bg-white'} border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="http://localhost:8002"
        />
        <p className="mt-1 text-sm text-gray-500">
          The base URL of your dedicated Collections API server
        </p>
      </div>

      {isEnabled && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">Connection Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600">API URL:</div>
            <div>{localStorage.getItem('collectionsApiBaseUrl') || 'http://localhost:8002'}</div>

            <div className="text-gray-600">Authentication Method:</div>
            <div className="capitalize">
              {localStorage.getItem('collectionsApiAuthMethod') === 'none'
                ? 'No Authentication'
                : localStorage.getItem('collectionsApiAuthMethod') || 'none'}
            </div>

            <div className="text-gray-600">Status:</div>
            <div className={
              localStorage.getItem('collectionsApiAuthMethod') === 'none'
                ? 'text-yellow-600'
                : (authStatus.authenticated ? 'text-green-600' : 'text-red-600')
            }>
              {localStorage.getItem('collectionsApiAuthMethod') === 'none'
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
          <strong>Note:</strong> This API is dedicated to Collections only.
          It includes conversation data needed by collections but focuses on collection management.
          Other parts of the application will continue to use their respective APIs or local data.
        </p>
      </div>

      <ApiLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default CollectionsApiSettings;