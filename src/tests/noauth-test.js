/**
 * Simple test script for testing no-auth API mode
 * 
 * Run with: node src/tests/noauth-test.js
 */

const axios = require('axios');

// Base URL for the API
const baseUrl = 'http://localhost:8000';

// Create an API client that doesn't send auth headers
const apiClient = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000
});

// Make a simple API request
async function testNoAuth() {
  try {
    console.log(`Testing API without authentication (${baseUrl})`);
    
    // Try to access a public endpoint (like system status or health check)
    const response = await apiClient.get('/system/status');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    console.log('\nTest successful! The API can be accessed without authentication.');
  } catch (error) {
    console.error('Error connecting to API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.error('\nTest failed. Make sure the API server is running and allows unauthenticated access.');
  }
}

// Run the test
testNoAuth();