/**
 * Script to enable the Conversations API for localhost:8001
 * This will make the collections page use the API instead of local data
 */

// Enable Conversations API
localStorage.setItem('conversationsApiEnabled', 'true');
localStorage.setItem('conversationsApiBaseUrl', 'http://localhost:8001');
localStorage.setItem('conversationsApiAuthMethod', 'none');

console.log('Conversations API enabled with the following settings:');
console.log('- API URL: http://localhost:8001');
console.log('- Authentication: None');
console.log('- Enabled: true');

console.log('\nPlease reload the page for changes to take effect.');
console.log('The collections page will now use the API at localhost:8001');
