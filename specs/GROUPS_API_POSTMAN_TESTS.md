# Agent Monitor Groups API Postman Tests

This document describes the Postman test collection for testing the Groups API in the Agent Monitor application.

## Overview

The test collection verifies all essential functionality of the Groups API, including:

1. Creating groups
2. Retrieving groups (individually and as collections)
3. Updating groups
4. Managing collection associations
5. User permission operations
6. Cleanup operations

## Setup

1. Import the `groups_api_postman_collection.json` file into Postman.
2. Ensure the Agent Monitor API is running (by default on `localhost:8001`).
3. Verify that you have at least one collection in the system for testing collection operations.

## Test Execution

The tests are designed to be run in sequence, as each test builds on previous tests. They use Postman environment variables to store and pass data between requests.

### Key Variables

- `baseUrl`: The base URL of the API (default: http://localhost:8001)
- `createdGroupId`: Stores the ID of a group created during testing
- `testCollectionId`: Stores the ID of a collection to use for group-collection operations

### Test Flow

The test flow follows this sequence:

1. **Setup**: Identifies an existing collection for testing
2. **Group Creation**: Creates a new group and verifies it
3. **Group Retrieval**: Gets the created group and verifies its data
4. **Group Updates**: Updates the group with new information
5. **Collection Operations**: Tests adding and removing collections from the group
6. **Permission Operations**: Tests user permission checks
7. **Cleanup**: Deletes the created group

## Test Sections

### 1. Setup

- **Get Test Collection ID**: Retrieves available collections and stores the first one for testing.

### 2. Group Creation

- **Create Group**: Creates a test group with proper fields and verifies the response.
- **Create Group with Invalid Purpose**: Attempts to create a group with an invalid purpose to test validation.

### 3. Group Retrieval

- **List All Groups**: Retrieves all groups and verifies the created group is listed.
- **Get Specific Group**: Gets the created group by its ID and verifies its data.
- **Get Non-existent Group**: Attempts to get a non-existent group to test error handling.

### 4. Group Updates

- **Update Group Name and Description**: Updates the group's basic information.
- **Update Group Purpose**: Updates only the group's purpose.
- **Update Non-existent Group**: Attempts to update a non-existent group to test error handling.

### 5. Group Collections Operations

- **Get Collections in Group (Empty)**: Verifies that the group initially has no collections.
- **Add Collection to Group**: Adds a collection to the group.
- **Get Collections in Group (After Add)**: Verifies the collection was added successfully.
- **Remove Collection from Group**: Removes the added collection.

### 6. User Permission Operations

- **Get Groups by Admin User**: Verifies that the admin user can see groups they administer.
- **Check Admin Permission**: Verifies the admin has full permissions.
- **Check Regular User Permission**: Verifies the regular user has read permissions.
- **Check Regular User Write Permission**: Verifies the regular user doesn't have write permissions.

### 7. Cleanup

- **Delete Created Group**: Removes the group created during testing.

## Test Assertions

Each test includes assertions to verify the correct functionality:

- Status code checks (200 for success, 404 for not found, etc.)
- Response body structure validation
- Data validation against expected values
- Error response validation

## Running the Tests

To run the tests:

1. Open the collection in Postman
2. Click the "Run" button to open the collection runner
3. Ensure all tests are selected and in the correct order
4. Click "Run" to execute the tests in sequence

You can also run individual tests as needed, but be aware that some tests depend on variables set by previous tests.

## Error Handling

If the test collection fails to find a valid collection ID, some of the collection-related tests will be skipped, but they won't fail the overall test suite.

Each test includes proper error handling and will provide detailed information in the Postman console if something goes wrong.

## Expected Results

When all tests run successfully, you should see:
- A new group created
- The group updated with new information
- Collection associations added and removed
- Permission checks verified
- The test group deleted to clean up