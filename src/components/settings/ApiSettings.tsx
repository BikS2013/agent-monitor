import React, { useState, useEffect } from 'react';
import { useRepositories } from '../../context/RepositoryContext';
import ApiLoginModal from '../login/ApiLoginModal';
import config from '../../config';
import { AuthService } from '../../data/api/AuthService';
import { ApiClient } from '../../data/api/ApiClient';

/**
 * API settings component that allows toggling between API and local data
 */
export const ApiSettings: React.FC = () => {
  const { isUsingApi, initialize } = useRepositories();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authStatus, setAuthStatus] = useState<{
    authenticated: boolean;
    user?: { username: string; role: string };
  }>({ authenticated: false });

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (isUsingApi) {
        try {
          // Create API client with stored configuration
          const apiClient = new ApiClient(
            config.api.baseUrl,
            localStorage.getItem('agent_monitor_api_token') || undefined,
            localStorage.getItem('apiClientSecret') || undefined,
            localStorage.getItem('apiClientId') || undefined
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

  const handleDisconnect = async () => {
    // Clear API credentials from localStorage
    localStorage.removeItem('apiEnabled');
    localStorage.removeItem('apiAuthMethod');
    localStorage.removeItem('apiClientSecret');
    localStorage.removeItem('apiClientId');
    localStorage.removeItem('agent_monitor_api_token');
    localStorage.removeItem('agent_monitor_token_expiry');
    
    // Reinitialize with local data source
    try {
      const savedDataSize = localStorage.getItem('dataSize');
      await initialize(undefined, savedDataSize as any);
      
      // Reload the application to apply changes
      window.location.reload();
    } catch (error) {
      console.error('Failed to initialize repositories after disconnecting:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
      
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">API Connection</h3>
            <p className="text-sm text-gray-500">
              {isUsingApi
                ? 'Currently using the API for data access'
                : 'Currently using local data'}
            </p>
          </div>
          
          {isUsingApi ? (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Connect
            </button>
          )}
        </div>
      </div>
      
      {isUsingApi && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">Connection Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600">API URL:</div>
            <div>{config.api.baseUrl}</div>
            
            <div className="text-gray-600">Authentication Method:</div>
            <div className="capitalize">
              {localStorage.getItem('apiAuthMethod') === 'none'
                ? 'No Authentication'
                : localStorage.getItem('apiAuthMethod') || config.api.authMethod}
            </div>

            <div className="text-gray-600">Status:</div>
            <div className={
              localStorage.getItem('apiAuthMethod') === 'none'
                ? 'text-yellow-600'
                : (authStatus.authenticated ? 'text-green-600' : 'text-red-600')
            }>
              {localStorage.getItem('apiAuthMethod') === 'none'
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
      
      <ApiLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default ApiSettings;