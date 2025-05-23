#!/usr/bin/env node

/**
 * Test script to verify the collections API endpoint
 */

import http from 'http';

const API_BASE_URL = 'http://localhost:8000';

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    console.log(`Making ${method} request to: ${url.toString()}`);
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Response status: ${res.statusCode}`);
        console.log(`Response headers:`, res.headers);
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const jsonData = JSON.parse(data);
            resolve({ status: res.statusCode, data: jsonData });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        } else {
          reject({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (e) => {
      reject({ error: e.message });
    });
    
    req.end();
  });
}

async function testApi() {
  console.log('Testing Collections API...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    try {
      const health = await makeRequest('/health');
      console.log('Health check successful:', health.data);
    } catch (e) {
      console.log('Health check failed:', e);
    }
    
    console.log('\n2. Testing collections endpoint...');
    try {
      const collections = await makeRequest('/collection');
      console.log('Collections response:', collections.data);
      
      if (collections.data.items && Array.isArray(collections.data.items)) {
        console.log(`Found ${collections.data.items.length} collections`);
      } else if (Array.isArray(collections.data)) {
        console.log(`Found ${collections.data.length} collections`);
      } else {
        console.log('Unexpected response format');
      }
    } catch (e) {
      console.log('Collections request failed:', e);
      
      // If it's a 404, the endpoint might not exist
      if (e.status === 404) {
        console.log('\nThe /collection endpoint returned 404. The API server might not have this endpoint implemented.');
      }
    }
    
    console.log('\n3. Testing alternate collections endpoint...');
    try {
      const collections = await makeRequest('/collections');
      console.log('Collections response:', collections.data);
    } catch (e) {
      console.log('Collections (alternate) request failed:', e);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testApi();