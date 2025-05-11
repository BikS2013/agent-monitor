// API Connection Test Script
// This script helps diagnose API connection issues

// Save in localStorage
function setApiNoAuth() {
  localStorage.setItem('apiEnabled', 'true');
  localStorage.setItem('apiAuthMethod', 'none');
  console.log('Set API to no-auth mode in localStorage');
}

// Check current settings
function checkSettings() {
  console.log('Current localStorage settings:');
  console.log('apiEnabled:', localStorage.getItem('apiEnabled'));
  console.log('apiAuthMethod:', localStorage.getItem('apiAuthMethod'));
  console.log('agent_monitor_api_token:', localStorage.getItem('agent_monitor_api_token'));
  console.log('apiClientSecret:', localStorage.getItem('apiClientSecret'));
  console.log('apiClientId:', localStorage.getItem('apiClientId'));
}

// Create test ApiClient
function testApiClient() {
  // Load ApiClient code
  const script = document.createElement('script');
  script.src = '../data/api/ApiClient.js';
  document.head.appendChild(script);

  // Test the connection after script loads
  script.onload = () => {
    try {
      const apiClient = new ApiClient(
        'http://localhost:8000',
        undefined,
        undefined,
        undefined,
        true // noAuth = true
      );

      console.log('Successfully created ApiClient with noAuth = true');
      console.log('Testing an API request...');

      apiClient.axios.get('/test-endpoint')
        .then(response => {
          console.log('API test response:', response);
        })
        .catch(error => {
          console.error('API test request failed:', error);
        });
    } catch (error) {
      console.error('Failed to create ApiClient:', error);
    }
  };
}

// Run setup
setApiNoAuth();
checkSettings();
console.log('Test operations complete. Now reload the main application to test the connection.');