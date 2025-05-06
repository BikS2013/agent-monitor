import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Shield, Database, Bot, Save, HardDrive, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { useRepositories } from '../context/RepositoryContext';
import { DataSize } from '../data/jsonDataSource';
import { User as UserType } from '../data/types';
import config from '../config';

const SettingsView: React.FC = () => {
  const { getCurrentUser } = useData();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const { theme } = useTheme();
  const { initialize } = useRepositories();
  const [dataSize, setDataSize] = useState<DataSize>('medium');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Load saved data settings
  useEffect(() => {
    const savedSetting = localStorage.getItem('dataSize');
    if (savedSetting) {
      setDataSize(savedSetting as DataSize);
    }
    
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    
    fetchUser();
  }, [getCurrentUser]);
  
  // Handle data source change
  const handleDataSizeChange = async (size: DataSize) => {
    try {
      setIsLoading(true);
      // Save setting to localStorage
      localStorage.setItem('dataSize', size);
      
      // Reinitialize repositories with new data size
      await initialize(undefined, size);
      
      setDataSize(size);
      setIsLoading(false);
      
      // Force page reload to refresh all data
      window.location.reload();
    } catch (error) {
      console.error('Failed to change data size:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className={`text-2xl font-bold mb-6 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <Settings size={24} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mr-2`} />
          Settings
        </h1>

        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm overflow-hidden mb-6`}>
          <div className={`border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
            <nav className="flex">
              <button className={`px-6 py-3 border-b-2 border-blue-500 font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                General
              </button>
              <button className={`px-6 py-3 ${
                theme === 'dark'
                  ? 'text-gray-300 hover:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
                Notifications
              </button>
              <button className={`px-6 py-3 ${
                theme === 'dark'
                  ? 'text-gray-300 hover:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
                Security
              </button>
              <button className={`px-6 py-3 ${
                theme === 'dark'
                  ? 'text-gray-300 hover:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
                AI Configuration
              </button>
            </nav>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <h2 className={`text-lg font-medium mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <User size={20} className="text-blue-500 mr-2" />
                User Profile
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Name
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={currentUser?.name || ''}
                    readOnly
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Role
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={currentUser?.role || ''}
                    readOnly
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Email
                  </label>
                  <input
                    type="email"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value="admin@example.com"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Language
                  </label>
                  <select className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}>
                    <option>English</option>
                    <option>Greek</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className={`text-lg font-medium mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <Bell size={20} className="text-blue-500 mr-2" />
                Notification Preferences
              </h2>

              <div className="space-y-3">
                <div className={`flex items-center justify-between p-3 rounded-md ${
                  theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'
                }`}>
                  <div>
                    <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Email Notifications</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Receive email alerts for important events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked />
                    <div className={`w-11 h-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                  </label>
                </div>

                <div className={`flex items-center justify-between p-3 rounded-md ${
                  theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'
                }`}>
                  <div>
                    <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>AI Failure Alerts</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Get notified when AI agents fail to resolve conversations</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked />
                    <div className={`w-11 h-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                  </label>
                </div>

                <div className={`flex items-center justify-between p-3 rounded-md ${
                  theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'
                }`}>
                  <div>
                    <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Weekly Reports</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Receive weekly performance summaries</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className={`w-11 h-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className={`text-lg font-medium mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <Shield size={20} className="text-blue-500 mr-2" />
                Security Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Two-Factor Authentication
                  </label>
                  <div className="flex items-center">
                    <button className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}>
                      Enable 2FA
                    </button>
                    <span className={`ml-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Not enabled</span>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Change Password
                  </label>
                  <button className={`${
                    theme === 'dark'
                      ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}>
                    Update Password
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className={`text-lg font-medium mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <HardDrive size={20} className="text-blue-500 mr-2" />
                Data Source
              </h2>

              <div className="space-y-3">
                <div className={`p-4 rounded-md ${
                  theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'
                }`}>
                  <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>Dataset Size</h3>
                  
                  {!config.dataSource.allowUIDatasetChange ? (
                    <div className="flex items-center p-3 mb-4 text-sm bg-amber-100 text-amber-800 rounded-md">
                      <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                      <p>
                        Dataset size changes are restricted by configuration settings. 
                        Current dataset size: <strong>{config.dataSource.datasetSize}</strong>
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} mb-4`}>
                        Select the size of the dataset to load from JSON file. Larger datasets provide a more realistic experience but may take longer to load.
                      </p>
                      
                      {isLoading && (
                        <div className="flex items-center my-2 text-sm text-blue-500">
                          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent mr-2"></div>
                          <span>Loading data...</span>
                        </div>
                      )}
                      
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            id="small-dataset" 
                            name="dataset-size"
                            value="small"
                            checked={dataSize === 'small'}
                            onChange={() => !isLoading && handleDataSizeChange('small')}
                            disabled={isLoading || !config.dataSource.allowUIDatasetChange}
                            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="small-dataset" className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Small Dataset
                            <span className={`block text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              ~200 messages, ~100 conversations
                            </span>
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            id="medium-dataset" 
                            name="dataset-size"
                            value="medium"
                            checked={dataSize === 'medium'}
                            onChange={() => !isLoading && handleDataSizeChange('medium')}
                            disabled={isLoading || !config.dataSource.allowUIDatasetChange}
                            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="medium-dataset" className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Medium Dataset
                            <span className={`block text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              ~5,000 messages, ~500 conversations
                            </span>
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            id="large-dataset" 
                            name="dataset-size"
                            value="large"
                            checked={dataSize === 'large'}
                            onChange={() => !isLoading && handleDataSizeChange('large')}
                            disabled={isLoading || !config.dataSource.allowUIDatasetChange}
                            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="large-dataset" className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Large Dataset
                            <span className={`block text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              ~20,000 messages, ~2,000 conversations
                            </span>
                          </label>
                        </div>
                      </div>
                      
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-4`}>
                        Currently using the <strong>{dataSize}</strong> dataset.
                      </p>
                      
                      <p className="text-xs mt-2 text-amber-500">
                        Note: Changing the dataset size will reload the application.
                      </p>
                    </>
                  )}
                  
                  {!config.preferLocalStorage && (
                    <div className="mt-4 p-3 text-sm bg-blue-100 text-blue-800 rounded-md">
                      <p>
                        <strong>Note:</strong> Configuration settings are set to override localStorage preferences.
                        Your selected dataset may be overridden on the next application restart.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className={`text-lg font-medium mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <Database size={20} className="text-blue-500 mr-2" />
                Data Management
              </h2>

              <div className="space-y-3">
                <div className={`flex items-center justify-between p-3 rounded-md ${
                  theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'
                }`}>
                  <div>
                    <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Conversation Retention</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>How long to keep conversation data</p>
                  </div>
                  <select className={`px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}>
                    <option>90 days</option>
                    <option>180 days</option>
                    <option>1 year</option>
                    <option>Forever</option>
                  </select>
                </div>

                <div className={`flex items-center justify-between p-3 rounded-md ${
                  theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'
                }`}>
                  <div>
                    <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Auto-Archive Collections</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Automatically archive old collections</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked />
                    <div className={`w-11 h-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h2 className={`text-lg font-medium mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <Bot size={20} className="text-blue-500 mr-2" />
                AI Configuration
              </h2>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Default AI Response Time Threshold
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      className={`w-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      value="5"
                    />
                    <span className={`ml-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>seconds</span>
                  </div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    Maximum time before escalating to human agent
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Minimum AI Confidence Threshold
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      className={`w-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      value="75"
                    />
                    <span className={`ml-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>%</span>
                  </div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    Minimum confidence level for AI to respond without human review
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} px-6 py-3 flex justify-end`}>
            <button className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center`}>
              <Save size={16} className="mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
