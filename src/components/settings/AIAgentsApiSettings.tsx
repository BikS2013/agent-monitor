import React, { useState, useEffect } from 'react';
import { X, Check, Info, Loader2 } from 'lucide-react';
import { ApiClient } from '../../data/api/ApiClient';

interface AIAgentsApiSettingsProps {
  onClose: () => void;
  onSave: (settings: {
    baseUrl: string;
    authToken?: string;
    clientSecret?: string;
    clientId?: string;
    noAuth: boolean;
    enabled: boolean;
  }) => void;
  settings: {
    baseUrl: string;
    authToken?: string;
    clientSecret?: string;
    clientId?: string;
    noAuth: boolean;
    enabled: boolean;
  };
}

export const AIAgentsApiSettings: React.FC<AIAgentsApiSettingsProps> = ({
  onClose,
  onSave,
  settings
}) => {
  const [formData, setFormData] = useState(settings);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const apiClient = new ApiClient(
        formData.baseUrl,
        formData.authToken,
        formData.clientSecret,
        formData.clientId,
        formData.noAuth
      );

      await apiClient.initialize();
      
      // Test AI Agents specific endpoint
      const agents = await apiClient.getAIAgents();
      
      setTestResult({
        success: true,
        message: `Successfully connected to AI Agents API at ${formData.baseUrl}`
      });
    } catch (error) {
      console.error('AI Agents API test failed:', error);
      setTestResult({
        success: false,
        message: (error as Error).message || 'Failed to connect to AI Agents API'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleEnableToggle = () => {
    setFormData(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">AI Agents API Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-white">Enable AI Agents API</span>
              <div className="relative group">
                <Info className="w-4 h-4 text-gray-400" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  When enabled, AI Agents will be fetched from the API instead of local data
                </div>
              </div>
            </div>
            <button
              onClick={handleEnableToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.enabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {formData.enabled && (
            <>
              {/* Base URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Base URL
                </label>
                <input
                  type="text"
                  value={formData.baseUrl}
                  onChange={(e) => handleInputChange('baseUrl', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="http://localhost:8000"
                />
              </div>

              {/* Authentication Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Authentication Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.noAuth}
                      onChange={() => handleInputChange('noAuth', true)}
                      className="mr-2"
                    />
                    <span className="text-gray-300">No Authentication</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!formData.noAuth && !!formData.authToken}
                      onChange={() => handleInputChange('noAuth', false)}
                      className="mr-2"
                    />
                    <span className="text-gray-300">JWT Token</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!formData.noAuth && !!formData.clientSecret}
                      onChange={() => handleInputChange('noAuth', false)}
                      className="mr-2"
                    />
                    <span className="text-gray-300">API Key</span>
                  </label>
                </div>
              </div>

              {/* JWT Token Input */}
              {!formData.noAuth && (!formData.clientSecret || formData.authToken) && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    JWT Token
                  </label>
                  <input
                    type="password"
                    value={formData.authToken || ''}
                    onChange={(e) => {
                      handleInputChange('authToken', e.target.value);
                      handleInputChange('clientSecret', '');
                      handleInputChange('clientId', '');
                    }}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Bearer token..."
                  />
                </div>
              )}

              {/* API Key Inputs */}
              {!formData.noAuth && !formData.authToken && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={formData.clientId || ''}
                      onChange={(e) => handleInputChange('clientId', e.target.value)}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your client ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Client Secret
                    </label>
                    <input
                      type="password"
                      value={formData.clientSecret || ''}
                      onChange={(e) => {
                        handleInputChange('clientSecret', e.target.value);
                        handleInputChange('authToken', '');
                      }}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your client secret"
                    />
                  </div>
                </>
              )}

              {/* Test Connection Button */}
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  'Test Connection'
                )}
              </button>

              {/* Test Result */}
              {testResult && (
                <div
                  className={`p-3 rounded-lg flex items-start space-x-2 ${
                    testResult.success
                      ? 'bg-green-900 text-green-100'
                      : 'bg-red-900 text-red-100'
                  }`}
                >
                  {testResult.success ? (
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <X className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-sm">{testResult.message}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};