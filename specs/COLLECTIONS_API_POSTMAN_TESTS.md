# Collections API Postman Tests

This document provides instructions for using the Postman test collection to test the Collections API endpoints.

## Overview

The test collection contains a comprehensive set of tests providing **100% coverage** of the Collections API specification, including:

### Core Functionality
1. Creating collections with various filter criteria
2. Retrieving collections (individual and list)
3. Updating collections (basic info and filters)
4. Managing collection conversations
5. Refreshing collections based on filter criteria
6. Retrieving collection statistics
7. Deleting collections

### Advanced Testing
8. Advanced filtering (by owner, public status, search)
9. Error handling and validation scenarios
10. Cross-API integration (Groups ↔ Collections)
11. Pagination and sorting capabilities
12. Edge cases and boundary testing

### API Endpoints Covered
- ✅ GET /collection (with all query parameters)
- ✅ GET /collection/{id}
- ✅ POST /collection
- ✅ PUT /collection/{id}
- ✅ DELETE /collection/{id}
- ✅ GET /collection/{id}/conversation
- ✅ POST /collection/{id}/refresh
- ✅ GET /collection/{id}/statistics
- ✅ GET /user/{id}/collection
- ✅ GET /group/{id}/collection

## Prerequisites

1. [Postman](https://www.postman.com/downloads/) installed
2. Agent Monitor API running locally or on a server
3. PostgreSQL databases set up for both LangGraph and Collections

## Setup Instructions

1. **Import the Collection**:
   - Open Postman
   - Click "Import" button at the top left
   - Select the `collections_api_postman_tests.json` file from the `test_scripts` directory
   - Click "Import" to load the collection

2. **Create Environment Variables**:
   - Click the gear icon (⚙️) at the top right
   - Click "Add" to create a new environment (e.g., "Agent Monitor API - Local")
   - Add the following variables:
     - `baseUrl`: Set to your API base URL (default: `http://localhost:8001`)
     - Leave the following variables empty (they will be populated during tests):
       - `collectionId`
       - `collectionId1`
       - `collectionId2`
       - `initialCollectionCount`
       - `totalConversations`
   - Click "Save"
   - Select the environment from the dropdown in the top right corner

3. **Set Initial Collection Variable**:
   - Ensure the API is running
   - The test will automatically set environment variables as it runs

## Running the Tests

You can run the tests in two ways:

### Method 1: Run All Tests

1. Click on the "Agent Monitor - Collections API Tests" collection
2. Click the "Run" button in the collection overview
3. In the Collection Runner, click "Start Run"
4. This will run all requests in sequence and show test results

### Method 2: Run Individual Tests

1. Open the "Agent Monitor - Collections API Tests" collection
2. Click on a specific request (e.g., "Create Test Collection")
3. Click the "Send" button to execute that request
4. View the test results in the "Test Results" tab of the response panel

## Test Sequence

The tests are designed to be run in order, as each test may depend on data from previous tests:

### Phase 1: Authentication & Setup
1. **Authentication - Admin Login**: Obtains authentication token for protected endpoints
2. **Health Check**: Verifies the API is running and healthy

### Phase 2: Core CRUD Operations
3. **List Collections (Initial)**: Gets the initial collection count
4. **Create Test Collection**: Creates a new collection and stores its ID
5. **Get Collection by ID**: Verifies the collection was created correctly
6. **List Collections (After Creation)**: Verifies the collection count increased
7. **Update Collection**: Updates the collection's name, description, and tags
8. **Update Collection Filter**: Updates the collection's filter criteria
9. **Get Collection Conversations**: Retrieves conversations in the collection
10. **Refresh Collection**: Refreshes the collection's conversations based on filter criteria
11. **Get Collection Statistics**: Gets statistics for the collection
12. **Get Collections by User**: Gets collections for a specific user
13. **Delete Collection**: Deletes the test collection
14. **Verify Deletion**: Verifies the collection was deleted successfully

### Phase 3: Multiple Collections & Filtering
15. **Create Multiple Collections**: Creates two additional test collections for filter testing
16. **Create Second Collection**: Creates another collection with different criteria
17. **Filter Collections by IDs**: Tests filtering collections by ID
18. **Filter Collections by Tag**: Tests filtering collections by tag
19. **Clean Up - Delete Collection 1**: Deletes the first test collection
20. **Clean Up - Delete Collection 2**: Deletes the second test collection

### Phase 4: Advanced Filtering Tests
21. **Filter Collections by Owner**: Tests filtering by `ownerId` parameter
22. **Filter Collections by Public Status**: Tests filtering by `isPublic` parameter
23. **Search Collections by Name**: Tests text search in name and description

### Phase 5: Error Handling & Validation
24. **Get Non-existent Collection**: Tests 404 error handling
25. **Create Collection with Invalid Data**: Tests validation and 422 errors
26. **Get Collections for Non-existent User**: Tests user validation scenarios

### Phase 6: Cross-API Integration
27. **Get Collections in Group**: Tests Groups API integration with Collections

### Phase 7: Pagination & Sorting
28. **Test Collection Conversations with Sorting**: Tests sorting and pagination on conversations
29. **Test Collections Pagination**: Tests pagination limits and parameters

### Phase 8: Cleanup
30. **Cleanup - Logout**: Cleans up authentication token and session

## Interpreting Results

- Green checkmarks (✓) indicate passing tests
- Red X marks (✗) indicate failing tests
- Details for each test are displayed beneath each request

## Test Categories & Coverage

### Core API Coverage (Tests 1-20)
- **Authentication**: Login/logout flows
- **Health Checks**: API availability verification
- **CRUD Operations**: Create, Read, Update, Delete collections
- **Conversations**: Collection-conversation relationships
- **Statistics**: Collection metadata and analytics

### Advanced Feature Coverage (Tests 21-30)
- **Query Parameters**: All filtering options (`ownerId`, `isPublic`, `search`, `tags`, `ids`)
- **Pagination**: `limit`, `skip` parameters with boundary testing
- **Sorting**: `sortBy`, `sortOrder` on collection conversations
- **Error Scenarios**: 404, 422 validation, non-existent resources
- **Cross-API Integration**: Groups ↔ Collections relationship testing

## Expected Test Results

When all tests pass successfully, you should see:
- **30 total tests** with comprehensive API coverage
- **Authentication flows** working correctly
- **All CRUD operations** functioning properly
- **Filter and search** capabilities validated
- **Error handling** responding appropriately
- **Cross-API integration** working between Groups and Collections
- **Data cleanup** completed successfully

## Common Issues

### Setup Issues
1. **API Not Running**: Ensure the API is running on the correct port before executing tests
2. **Database Connection**: Verify database connection details in your .env file
3. **Authentication**: Ensure auth endpoints are properly configured for your environment

### Test Execution Issues
4. **Missing Collections**: If tests fail because collections are missing, check your database setup
5. **Permission Errors**: Verify authentication tokens have appropriate permissions
6. **Cross-API Dependencies**: Ensure Groups API is available for integration tests
7. **Environment Variables**: Check that all required environment variables are set

### Performance Issues
8. **Slow Response Times**: If tests fail due to timeouts, consider increasing timeout values
9. **Database Performance**: Large datasets may affect test performance

## Customizing Tests

The test collection is designed to be flexible and customizable:

### Modifying Individual Tests
1. Open a request in the collection
2. Go to the "Tests" tab
3. Edit the JavaScript test code
4. Save your changes

### Adding New Test Scenarios
1. Right-click on a test folder (e.g., "Advanced Filtering Tests")
2. Select "Add Request"
3. Configure the request details
4. Add test scripts in the "Tests" tab

### Environment Configuration
1. Adjust the `baseUrl` variable for different environments
2. Add custom variables for your specific test data
3. Configure authentication parameters as needed

## Test Coverage Summary

This comprehensive test suite provides:

- ✅ **100% Endpoint Coverage**: All 10 Collections API endpoints tested
- ✅ **Parameter Testing**: All query parameters and options validated
- ✅ **Error Scenarios**: Comprehensive error handling verification
- ✅ **Integration Testing**: Cross-API functionality with Groups
- ✅ **Performance Testing**: Pagination and sorting capabilities
- ✅ **Data Validation**: Response structure and content verification

## Next Steps

After running the Collections API tests:

1. **Review Results**: Check for any failing tests and investigate causes
2. **Environment Testing**: Run tests against different environments (dev, staging)
3. **Integration**: Include in your CI/CD pipeline for automated testing
4. **Monitoring**: Use results to monitor API health and performance

## Support

If you have questions or need assistance with these tests:
- Review the test execution logs for specific error details
- Check the API documentation for endpoint specifications
- Verify your environment configuration matches requirements
- Contact the development team for additional support