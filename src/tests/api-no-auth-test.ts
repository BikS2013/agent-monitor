/**
 * Simple test for the no-auth API client
 * 
 * Run with: ts-node src/tests/api-no-auth-test.ts
 */

import { ApiClient } from '../data/api/ApiClient';

// Create API client with no authentication (noAuth = true)
const apiClient = new ApiClient(
  'http://localhost:8000', // Change this to your API server URL
  undefined, // No JWT token
  undefined, // No client secret
  undefined, // No client ID
  true // Enable no-auth mode
);

async function runTest() {
  try {
    console.log('Testing API client with no authentication...');
    
    // Test a simple API call (make sure this endpoint allows public access)
    const sampleData = await apiClient.getSampleDataStatus();
    console.log('Sample data status:', sampleData);
    
    // Try to get all AI agents
    try {
      const agents = await apiClient.getAIAgents();
      console.log(`Successfully fetched ${Array.isArray(agents) ? agents.length : 'some'} AI agents`);
    } catch (error) {
      console.error('Error fetching AI agents:', error.message);
    }
    
    console.log('Test completed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
runTest();