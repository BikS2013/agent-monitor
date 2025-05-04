import React from 'react';
import { Settings, User, Bell, Shield, Database, Bot, Save } from 'lucide-react';
import { useData } from '../context/DataContext';

const SettingsView: React.FC = () => {
  const { getCurrentUser } = useData();
  const currentUser = getCurrentUser();

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <Settings size={24} className="text-gray-500 mr-2" />
          Settings
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button className="px-6 py-3 border-b-2 border-blue-500 font-medium text-blue-600">
                General
              </button>
              <button className="px-6 py-3 text-gray-500 hover:text-gray-700">
                Notifications
              </button>
              <button className="px-6 py-3 text-gray-500 hover:text-gray-700">
                Security
              </button>
              <button className="px-6 py-3 text-gray-500 hover:text-gray-700">
                AI Configuration
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <User size={20} className="text-blue-500 mr-2" />
                User Profile
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentUser.name}
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentUser.role}
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input 
                    type="email" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value="admin@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>English</option>
                    <option>Greek</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <Bell size={20} className="text-blue-500 mr-2" />
                Notification Preferences
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive email alerts for important events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <h3 className="font-medium">AI Failure Alerts</h3>
                    <p className="text-sm text-gray-500">Get notified when AI agents fail to resolve conversations</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <h3 className="font-medium">Weekly Reports</h3>
                    <p className="text-sm text-gray-500">Receive weekly performance summaries</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <Shield size={20} className="text-blue-500 mr-2" />
                Security Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Two-Factor Authentication
                  </label>
                  <div className="flex items-center">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      Enable 2FA
                    </button>
                    <span className="ml-3 text-sm text-gray-500">Not enabled</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Change Password
                  </label>
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <Database size={20} className="text-blue-500 mr-2" />
                Data Management
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <h3 className="font-medium">Conversation Retention</h3>
                    <p className="text-sm text-gray-500">How long to keep conversation data</p>
                  </div>
                  <select className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>90 days</option>
                    <option>180 days</option>
                    <option>1 year</option>
                    <option>Forever</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <h3 className="font-medium">Auto-Archive Collections</h3>
                    <p className="text-sm text-gray-500">Automatically archive old collections</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <Bot size={20} className="text-blue-500 mr-2" />
                AI Configuration
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default AI Response Time Threshold
                  </label>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value="5"
                    />
                    <span className="ml-2">seconds</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum time before escalating to human agent
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum AI Confidence Threshold
                  </label>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value="75"
                    />
                    <span className="ml-2">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum confidence level for AI to respond without human review
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-3 flex justify-end">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center">
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
