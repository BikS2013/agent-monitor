import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { X, Save, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface GroupsApiSettingsProps {
  onClose: () => void;
  onSave: (settings: GroupsApiSettings) => void;
  settings: GroupsApiSettings;
}

export interface GroupsApiSettings {
  baseUrl: string;
  authMethod: 'none' | 'token' | 'api-key';
  authToken?: string;
  clientSecret?: string;
  clientId?: string;
  enabled: boolean;
}

export const GroupsApiSettings: React.FC<GroupsApiSettingsProps> = ({
  onClose,
  onSave,
  settings: initialSettings
}) => {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<GroupsApiSettings>(initialSettings);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState<string>('');

  // Test API connection
  const testConnection = async () => {
    setTestStatus('testing');
    setTestError('');

    try {
      // Create a temporary GroupApiDataSource for testing
      const { GroupApiDataSource } = await import('../../data/sources/GroupApiDataSource');
      
      const testDataSource = new GroupApiDataSource(
        settings.baseUrl,
        settings.authMethod === 'token' ? settings.authToken : undefined,
        settings.authMethod === 'api-key' ? settings.clientSecret : undefined,
        settings.authMethod === 'api-key' ? settings.clientId : undefined,
        settings.authMethod === 'none'
      );

      await testDataSource.initialize();
      
      // Try to fetch groups to test the connection
      const groups = await testDataSource.getGroups();
      console.log('Groups API test successful:', Object.keys(groups).length, 'groups found');
      
      setTestStatus('success');
    } catch (error: any) {
      console.error('Groups API test failed:', error);
      setTestError(error.message || 'Unknown error occurred');
      setTestStatus('error');
    }
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleSettingChange = (key: keyof GroupsApiSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setTestStatus('idle'); // Reset test status when settings change
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Groups API Settings
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-md ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            } transition-colors`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Enable Groups API
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Use a dedicated API server for Groups data
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.enabled}
                onChange={(e) => handleSettingChange('enabled', e.target.checked)}
              />
              <div className={`w-11 h-6 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
            </label>
          </div>

          {settings.enabled && (
            <>
              {/* Base URL */}
              <div>
                <label className={`block text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                } mb-2`}>
                  API Base URL
                </label>
                <input
                  type="url"
                  value={settings.baseUrl}
                  onChange={(e) => handleSettingChange('baseUrl', e.target.value)}
                  placeholder="http://localhost:8000"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  The base URL of your Groups API server
                </p>
              </div>

              {/* Authentication Method */}
              <div>
                <label className={`block text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                } mb-2`}>
                  Authentication Method
                </label>
                <select
                  value={settings.authMethod}
                  onChange={(e) => handleSettingChange('authMethod', e.target.value as 'none' | 'token' | 'api-key')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="none">No Authentication</option>
                  <option value="token">JWT Token</option>
                  <option value="api-key">API Key</option>
                </select>
              </div>

              {/* JWT Token */}
              {settings.authMethod === 'token' && (
                <div>
                  <label className={`block text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  } mb-2`}>
                    JWT Token
                  </label>
                  <input
                    type="password"
                    value={settings.authToken || ''}
                    onChange={(e) => handleSettingChange('authToken', e.target.value)}
                    placeholder="Enter your JWT token"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              )}

              {/* API Key Authentication */}
              {settings.authMethod === 'api-key' && (
                <>
                  <div>
                    <label className={`block text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    } mb-2`}>
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={settings.clientId || ''}
                      onChange={(e) => handleSettingChange('clientId', e.target.value)}
                      placeholder="Enter your client ID"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    } mb-2`}>
                      Client Secret
                    </label>
                    <input
                      type="password"
                      value={settings.clientSecret || ''}
                      onChange={(e) => handleSettingChange('clientSecret', e.target.value)}
                      placeholder="Enter your client secret"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </>
              )}

              {/* Test Connection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Test Connection
                  </h4>
                  <button
                    onClick={testConnection}
                    disabled={testStatus === 'testing'}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-800'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:bg-gray-100'
                    } transition-colors disabled:cursor-not-allowed`}
                  >
                    {testStatus === 'testing' ? (
                      <>
                        <Loader size={16} className="mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Test Connection'
                    )}
                  </button>
                </div>

                {/* Test Status */}
                {testStatus === 'success' && (
                  <div className={`flex items-center p-3 rounded-md ${
                    theme === 'dark' ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-800'
                  }`}>
                    <CheckCircle size={16} className="mr-2 flex-shrink-0" />
                    <span className="text-sm">Connection successful! Groups API is accessible.</span>
                  </div>
                )}

                {testStatus === 'error' && (
                  <div className={`flex items-center p-3 rounded-md ${
                    theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-800'
                  }`}>
                    <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">Connection failed:</p>
                      <p>{testError}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Information */}
              <div className={`p-4 rounded-md ${
                theme === 'dark' ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-800'
              }`}>
                <h4 className="font-medium mb-2">Groups API Information</h4>
                <ul className="text-sm space-y-1">
                  <li>• Groups API handles group management operations separately from the main API</li>
                  <li>• This allows for independent scaling and configuration of group services</li>
                  <li>• If disabled, group operations will use the main API or local data</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 p-6 border-t ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            } transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-md flex items-center ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } transition-colors`}
          >
            <Save size={16} className="mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};