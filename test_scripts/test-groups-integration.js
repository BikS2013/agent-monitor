/**
 * Groups API Integration Test
 * 
 * This script tests the Groups API integration in the Agent Monitor application.
 * Run this after starting the mock API server:
 * 
 * 1. Start the mock API server: node src/tests/api-cors-express.cjs
 * 2. Run this test: node test_scripts/test-groups-integration.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

let testsPassed = 0;
let testsFailed = 0;

async function runTest(testName, testFn) {
  console.log(`\n${colors.blue}Testing: ${testName}${colors.reset}`);
  try {
    await testFn();
    console.log(`${colors.green}✓ PASSED${colors.reset}`);
    testsPassed++;
  } catch (error) {
    console.log(`${colors.red}✗ FAILED${colors.reset}`);
    console.error(`Error: ${error.message}`);
    if (error.response) {
      console.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    testsFailed++;
  }
}

async function testListGroups() {
  const response = await axios.get(`${BASE_URL}/group`);
  
  if (!response.data.items || !Array.isArray(response.data.items)) {
    throw new Error('Response should have items array');
  }
  
  if (response.data.items.length === 0) {
    throw new Error('Should have at least one group');
  }
  
  const group = response.data.items[0];
  if (!group.id || !group.name || !group.purpose) {
    throw new Error('Group should have id, name, and purpose');
  }
  
  console.log(`Found ${response.data.items.length} groups`);
}

async function testGetGroupById() {
  const groupId = 'group-1';
  const response = await axios.get(`${BASE_URL}/group/${groupId}`);
  
  if (response.data.id !== groupId) {
    throw new Error(`Expected group id ${groupId}, got ${response.data.id}`);
  }
  
  if (!response.data.metadata || typeof response.data.metadata !== 'object') {
    throw new Error('Group should have metadata object');
  }
  
  console.log(`Got group: ${response.data.name}`);
}

async function testCreateGroup() {
  const newGroup = {
    name: 'Test Evaluation Group',
    description: 'Test group for evaluation purposes',
    purpose: 'evaluation',
    collection_ids: ['coll-1', 'coll-2'],
    admin_ids: ['user-123'],
    user_ids: ['user-123', 'user-456'],
    is_private: true
  };
  
  const response = await axios.post(`${BASE_URL}/group`, newGroup);
  
  if (!response.data.id) {
    throw new Error('Created group should have an id');
  }
  
  if (response.data.name !== newGroup.name) {
    throw new Error(`Expected name ${newGroup.name}, got ${response.data.name}`);
  }
  
  console.log(`Created group with id: ${response.data.id}`);
}

async function testUpdateGroup() {
  const groupId = 'group-1';
  const updates = {
    name: 'Updated Security Group',
    description: 'Updated description'
  };
  
  const response = await axios.put(`${BASE_URL}/group/${groupId}`, updates);
  
  if (response.data.id !== groupId) {
    throw new Error(`Expected group id ${groupId}, got ${response.data.id}`);
  }
  
  if (!response.data.updated_at) {
    throw new Error('Updated group should have updated_at timestamp');
  }
  
  console.log(`Updated group: ${response.data.name}`);
}

async function testDeleteGroup() {
  const groupId = 'group-test';
  const response = await axios.delete(`${BASE_URL}/group/${groupId}`);
  
  if (!response.data.success) {
    throw new Error('Delete should return success: true');
  }
  
  console.log(`Deleted group: ${groupId}`);
}

async function testGetGroupCollections() {
  const groupId = 'group-1';
  const response = await axios.get(`${BASE_URL}/group/${groupId}/collection`);
  
  if (!response.data.items || !Array.isArray(response.data.items)) {
    throw new Error('Response should have items array');
  }
  
  const collection = response.data.items[0];
  if (collection && (!collection.id || !collection.name)) {
    throw new Error('Collection should have id and name');
  }
  
  console.log(`Found ${response.data.items.length} collections in group`);
}

async function testAddCollectionToGroup() {
  const groupId = 'group-1';
  const response = await axios.post(`${BASE_URL}/group/${groupId}/collection`, {
    collectionId: 'coll-new'
  });
  
  if (!response.data.success) {
    throw new Error('Should return success: true');
  }
  
  if (!response.data.group || !response.data.group.collectionIds) {
    throw new Error('Should return updated group with collectionIds');
  }
  
  console.log(`Added collection to group, now has ${response.data.group.collectionIds.length} collections`);
}

async function testRemoveCollectionFromGroup() {
  const groupId = 'group-1';
  const collectionId = 'coll-2';
  const response = await axios.delete(`${BASE_URL}/group/${groupId}/collection/${collectionId}`);
  
  if (!response.data.success) {
    throw new Error('Should return success: true');
  }
  
  console.log(`Removed collection from group`);
}

async function testGetAdminGroups() {
  const userId = 'user-123';
  const response = await axios.get(`${BASE_URL}/user/${userId}/admin-group`);
  
  if (!response.data.items || !Array.isArray(response.data.items)) {
    throw new Error('Response should have items array');
  }
  
  const group = response.data.items[0];
  if (group && !group.permission_levels) {
    throw new Error('Admin group should have permission_levels');
  }
  
  console.log(`User is admin of ${response.data.items.length} groups`);
}

async function testCheckUserPermission() {
  const groupId = 'group-1';
  const userId = 'user-123';
  const permission = 'read';
  
  const response = await axios.get(`${BASE_URL}/group/${groupId}/user/${userId}/permission?permission=${permission}`);
  
  if (typeof response.data.hasPermission !== 'boolean') {
    throw new Error('Should return hasPermission boolean');
  }
  
  if (response.data.hasPermission && !response.data.permissionLevel) {
    throw new Error('Should return permissionLevel when hasPermission is true');
  }
  
  console.log(`User has permission: ${response.data.hasPermission} (${response.data.permissionLevel})`);
}

async function runAllTests() {
  console.log(`${colors.yellow}Starting Groups API Integration Tests${colors.reset}`);
  console.log(`Testing against: ${BASE_URL}`);
  
  await runTest('List all groups', testListGroups);
  await runTest('Get group by ID', testGetGroupById);
  await runTest('Create new group', testCreateGroup);
  await runTest('Update group', testUpdateGroup);
  await runTest('Delete group', testDeleteGroup);
  await runTest('Get group collections', testGetGroupCollections);
  await runTest('Add collection to group', testAddCollectionToGroup);
  await runTest('Remove collection from group', testRemoveCollectionFromGroup);
  await runTest('Get admin groups for user', testGetAdminGroups);
  await runTest('Check user permission', testCheckUserPermission);
  
  console.log(`\n${colors.yellow}Test Summary:${colors.reset}`);
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
  
  if (testsFailed > 0) {
    process.exit(1);
  }
}

// Check if axios is installed
try {
  require.resolve('axios');
} catch (e) {
  console.error(`${colors.red}Error: axios is not installed${colors.reset}`);
  console.log('Please run: npm install axios');
  process.exit(1);
}

// Run the tests
runAllTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});