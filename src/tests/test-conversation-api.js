// Test script for Conversations API endpoints
// Run with: node src/tests/test-conversation-api.js

const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8001';
const API_KEY = process.env.API_KEY || '';
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';
const NO_AUTH = process.env.NO_AUTH === 'true';

// Create axios instance with proper headers
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
});

// Add authentication headers if needed
if (!NO_AUTH) {
  if (AUTH_TOKEN) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  } else if (API_KEY) {
    apiClient.defaults.headers.common['X-API-KEY'] = API_KEY;
  }
}

// Test functions
async function testListConversations() {
  console.log('\n=== Testing GET /conversation ===');
  try {
    const response = await apiClient.get('/conversation', {
      params: {
        limit: 10,
        skip: 0,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        includePagination: true,
        includeMessages: false
      }
    });
    
    console.log('✅ List conversations successful');
    console.log('Response structure:', {
      hasItems: !!response.data.items,
      itemCount: response.data.items?.length || 0,
      hasPageInfo: !!response.data.pageInfo,
      pageInfo: response.data.pageInfo
    });
    
    if (response.data.items && response.data.items.length > 0) {
      console.log('First conversation:', JSON.stringify(response.data.items[0], null, 2));
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ List conversations failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetConversation(threadId) {
  console.log(`\n=== Testing GET /conversation/${threadId} ===`);
  try {
    const response = await apiClient.get(`/conversation/${threadId}`, {
      params: {
        includeMessages: true
      }
    });
    
    console.log('✅ Get conversation successful');
    console.log('Response fields:', Object.keys(response.data));
    console.log('Has messages:', !!(response.data.decodedMessages || response.data.messages));
    
    return response.data;
  } catch (error) {
    console.error('❌ Get conversation failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testCreateConversation() {
  console.log('\n=== Testing POST /conversation ===');
  try {
    const newConversation = {
      userId: `user-${Date.now()}`,
      userName: 'Test User',
      aiAgentId: `agent-${Date.now()}`,
      aiAgentName: 'Test AI Agent',
      aiAgentType: 'customer-support',
      tags: ['test', 'api-verification'],
      confidence: 0.85,
      initialMessage: 'Hello, I need help testing the API.'
    };
    
    const response = await apiClient.post('/conversation', newConversation);
    
    console.log('✅ Create conversation successful');
    console.log('Created conversation:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Create conversation failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testUpdateConversation(threadId) {
  console.log(`\n=== Testing PUT /conversation/${threadId} ===`);
  try {
    const updateData = {
      status: 'closed',
      conclusion: 'successful',
      tags: ['test', 'api-verification', 'updated'],
      resolutionNotes: 'Test completed successfully'
    };
    
    const response = await apiClient.put(`/conversation/${threadId}`, updateData);
    
    console.log('✅ Update conversation successful');
    console.log('Updated conversation:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Update conversation failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testFilterConversations() {
  console.log('\n=== Testing POST /conversation/filter ===');
  try {
    const filterCriteria = {
      status: 'active',
      conclusion: 'uncertain',
      timeRange: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      }
    };
    
    const response = await apiClient.post('/conversation/filter', filterCriteria);
    
    console.log('✅ Filter conversations successful');
    console.log('Response structure:', {
      hasItems: !!response.data.items,
      itemCount: response.data.items?.length || 0,
      isArray: Array.isArray(response.data),
      arrayLength: Array.isArray(response.data) ? response.data.length : 0
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Filter conversations failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetMessages(threadId) {
  console.log(`\n=== Testing GET /conversation/${threadId}/messages ===`);
  try {
    const response = await apiClient.get(`/conversation/${threadId}/messages`, {
      params: {
        skip: 0,
        limit: 20,
        sortBy: 'timestamp',
        sortOrder: 'asc'
      }
    });
    
    console.log('✅ Get messages successful');
    console.log('Response structure:', {
      hasItems: !!response.data.items,
      itemCount: response.data.items?.length || 0,
      hasPageInfo: !!response.data.pageInfo
    });
    
    if (response.data.items && response.data.items.length > 0) {
      console.log('First message:', JSON.stringify(response.data.items[0], null, 2));
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Get messages failed:', error.response?.data || error.message);
    throw error;
  }
}

// Main test runner
async function runTests() {
  console.log('Starting Conversations API tests...');
  console.log('Base URL:', BASE_URL);
  console.log('Authentication:', NO_AUTH ? 'Disabled' : (AUTH_TOKEN ? 'Bearer Token' : (API_KEY ? 'API Key' : 'None')));
  
  try {
    // Test 1: List conversations
    const conversations = await testListConversations();
    
    // Test 2: Create a new conversation
    let createdConversation;
    try {
      createdConversation = await testCreateConversation();
    } catch (error) {
      console.log('⚠️  Create conversation failed, continuing with existing data...');
    }
    
    // Test 3: Get a specific conversation
    const threadId = createdConversation?.threadId || 
                    createdConversation?.thread_id || 
                    conversations?.items?.[0]?.threadId || 
                    conversations?.items?.[0]?.thread_id;
    
    if (threadId) {
      await testGetConversation(threadId);
      
      // Test 4: Update the conversation
      if (createdConversation) {
        await testUpdateConversation(threadId);
      }
      
      // Test 5: Get messages
      await testGetMessages(threadId);
    } else {
      console.log('⚠️  No conversation ID available for detailed tests');
    }
    
    // Test 6: Filter conversations
    await testFilterConversations();
    
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();