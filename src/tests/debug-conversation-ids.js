// Debug script to check conversation ID mapping
// Run with: node src/tests/debug-conversation-ids.js

const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8001';
const NO_AUTH = true;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

async function debugConversationIds() {
  console.log('=== Debugging Conversation IDs ===\n');
  
  try {
    // 1. List conversations
    console.log('1. Listing conversations...');
    const listResponse = await apiClient.get('/conversation', {
      params: {
        limit: 3,
        includePagination: true
      }
    });
    
    console.log('List response status:', listResponse.status);
    console.log('Response has items:', !!listResponse.data.items);
    
    if (listResponse.data.items && listResponse.data.items.length > 0) {
      console.log(`\nFound ${listResponse.data.items.length} conversations\n`);
      
      // Examine each conversation's ID fields
      for (let i = 0; i < listResponse.data.items.length; i++) {
        const conv = listResponse.data.items[i];
        console.log(`Conversation ${i + 1}:`);
        console.log('  ID fields present:');
        console.log(`    - id: ${conv.id || 'NOT PRESENT'}`);
        console.log(`    - threadId: ${conv.threadId || 'NOT PRESENT'}`);
        console.log(`    - thread_id: ${conv.thread_id || 'NOT PRESENT'}`);
        console.log(`    - _id: ${conv._id || 'NOT PRESENT'}`);
        console.log(`  Other fields: ${Object.keys(conv).join(', ')}`);
        
        // Try to fetch this specific conversation using different ID fields
        const possibleIds = [
          { field: 'threadId', value: conv.threadId },
          { field: 'thread_id', value: conv.thread_id },
          { field: 'id', value: conv.id },
          { field: '_id', value: conv._id }
        ].filter(item => item.value);
        
        console.log(`\n  Testing individual fetch for conversation ${i + 1}:`);
        
        for (const idOption of possibleIds) {
          if (idOption.value) {
            try {
              console.log(`    Trying GET /conversation/${idOption.value} (using ${idOption.field})...`);
              const getResponse = await apiClient.get(`/conversation/${idOption.value}`);
              console.log(`    ✅ SUCCESS with ${idOption.field}: ${idOption.value}`);
              console.log(`    Response has conversation: ${!!getResponse.data}`);
              break; // Stop on first success
            } catch (error) {
              console.log(`    ❌ FAILED with ${idOption.field}: ${idOption.value} - ${error.response?.status || error.message}`);
            }
          }
        }
        console.log('');
      }
    } else {
      console.log('No conversations found in the response');
      console.log('Full response:', JSON.stringify(listResponse.data, null, 2));
    }
    
  } catch (error) {
    console.error('Error during debug:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the debug
debugConversationIds();