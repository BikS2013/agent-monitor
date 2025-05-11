"""
Base API client for Agent Monitor API
"""
from dotenv import load_dotenv
load_dotenv()


import os
import requests
import uuid
from typing import Dict, Optional, Any, List, Union
from urllib.parse import urljoin


class AgentMonitorClient:
    """Client for interacting with the Agent Monitor API"""

    def __init__(
        self,
        base_url: str = None,
        token: Optional[str] = None,
        client_secret: Optional[str] = None,
        client_id: Optional[str] = None
    ):
        """
        Initialize the API client.

        Args:
            base_url: Base URL of the Agent Monitor API (defaults to environment variables or localhost:8000)
            token: JWT token for authentication
            client_secret: Client secret for API key authentication
            client_id: Client ID for API key authentication
        """
        # Read from environment variables if not provided
        if base_url is None:
            host = os.environ.get("AGENT_MONITOR_API_HOST", "localhost")
            port = os.environ.get("AGENT_MONITOR_API_PORT", "8000")
            base_url = f"http://{host}:{port}"

        self.base_url = base_url.rstrip("/")
        self.token = token
        self.client_secret = client_secret
        self.client_id = client_id
        self.session = requests.Session()

    def _get_headers(self) -> Dict[str, str]:
        """
        Get the headers to use for API requests.

        Returns:
            Dict containing the appropriate headers
        """
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        elif self.client_secret:
            headers["X-API-KEY"] = self.client_secret
        
        if self.client_id:
            headers["X-Client-ID"] = self.client_id

        return headers

    def _make_request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None
    ) -> Any:
        """
        Make an HTTP request to the API.

        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint
            params: Query parameters
            data: Request body data

        Returns:
            Response data

        Raises:
            Exception: If the request fails
        """
        url = urljoin(self.base_url, endpoint)
        headers = self._get_headers()

        response = self.session.request(
            method=method,
            url=url,
            headers=headers,
            params=params,
            json=data
        )

        response.raise_for_status()

        if response.content:
            return response.json()
        return {}

    # Authentication
    def login(self, username: str, password: str) -> Dict[str, Any]:
        """
        Login to get an access token.

        Args:
            username: User's username
            password: User's password

        Returns:
            Token information including access_token, token_type, and expires_in
        """
        url = urljoin(self.base_url, "/system/token")
        form_data = {
            "username": username,
            "password": password
        }
        
        response = self.session.post(
            url=url,
            data=form_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        response.raise_for_status()
        token_info = response.json()
        
        # Set the token for future requests
        if "access_token" in token_info:
            self.token = token_info["access_token"]
            
        return token_info
    
    def get_auth_status(self) -> Dict[str, Any]:
        """
        Get current authentication status.
        
        Returns:
            Authentication status information
        """
        return self._make_request("GET", "/system/auth/status")

    # Note: Message-related endpoints have been removed since messages are now stored
    # directly in the conversation values field


    # Conversations API
    def get_conversations(
        self,
        ids: Optional[List[str]] = None,
        skip: int = 0,
        limit: Optional[int] = None,
        sort_by: str = "createdAt",
        sort_order: str = "desc",
        include_pagination: bool = False,
        include_messages: bool = False
    ) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Get a list of conversations with optional pagination.

        Args:
            ids: Optional list of conversation IDs
            skip: Number of items to skip for pagination
            limit: Maximum number of items to return (default: None/20 with pagination)
            sort_by: Field to sort by (default: start_timestamp)
            sort_order: Sort order ('asc' or 'desc')
            include_pagination: Whether to include pagination metadata (default: False)
            include_messages: Whether to include decoded messages from the values field (default: False)

        Returns:
            If ids is provided: Dictionary of conversations with IDs as keys
            If include_pagination is False: List of conversations
            If include_pagination is True: Paginated response with conversations and pagination info
        """
        params = {
            "skip": skip,
            "sort_by": sort_by,
            "sort_order": sort_order,
            "include_pagination": include_pagination,
            "include_messages": include_messages
        }

        if ids:
            params["ids"] = ",".join(ids)
        if limit is not None:
            params["limit"] = limit

        return self._make_request("GET", "/conversation", params=params)

    def get_conversation(self, conversation_id: str, include_messages: bool = False) -> Dict[str, Any]:
        """
        Get details of a specific conversation.

        Args:
            conversation_id: ID of the conversation to retrieve
            include_messages: Whether to include decoded messages from the values field (default: False)

        Returns:
            Dictionary containing conversation details
        """
        params = {"include_messages": include_messages}
        return self._make_request("GET", f"/conversation/{conversation_id}", params=params)
    
    def create_conversation(self, conversation_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new conversation.
        
        Args:
            conversation_data: Conversation data
            
        Returns:
            The created conversation
        """
        return self._make_request("POST", "/conversation", data=conversation_data)
    
    def update_conversation(self, conversation_id: str, conversation_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing conversation.
        
        Args:
            conversation_id: ID of the conversation to update
            conversation_data: Updated conversation data
            
        Returns:
            The updated conversation
        """
        return self._make_request("PUT", f"/conversation/{conversation_id}", data=conversation_data)
    
    def delete_conversation(self, conversation_id: str) -> bool:
        """
        Delete a conversation.
        
        Args:
            conversation_id: ID of the conversation to delete
            
        Returns:
            True if deletion was successful
        """
        return self._make_request("DELETE", f"/conversation/{conversation_id}")
    
    def filter_conversations(self, filter_criteria: Dict[str, Any]) -> List[str]:
        """
        Filter conversations based on complex criteria.
        
        Args:
            filter_criteria: Filter criteria object
            
        Returns:
            List of conversation IDs matching the criteria
        """
        return self._make_request("POST", "/conversation/filter", data=filter_criteria)
    
    def get_conversations_by_collection(
        self,
        collection_id: str,
        skip: int = 0,
        limit: Optional[int] = None,
        sort_by: str = "createdAt",
        sort_order: str = "desc",
        include_pagination: bool = False
    ) -> Union[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Get conversations for a specific collection with optional pagination.

        Args:
            collection_id: ID of the collection
            skip: Number of items to skip for pagination
            limit: Maximum number of items to return
            sort_by: Field to sort by
            sort_order: Sort order ('asc' or 'desc')
            include_pagination: Whether to include pagination metadata

        Returns:
            If include_pagination is False: List of conversations in the collection
            If include_pagination is True: Paginated response with conversations and pagination info
        """
        params = {
            "skip": skip,
            "sort_by": sort_by,
            "sort_order": sort_order,
            "include_pagination": include_pagination
        }

        if limit is not None:
            params["limit"] = limit

        return self._make_request(
            "GET",
            f"/collection/{collection_id}/conversation",
            params=params
        )
    
    def get_conversations_by_ai_agent(
        self,
        ai_agent_id: str,
        skip: int = 0,
        limit: Optional[int] = None,
        sort_by: str = "createdAt",
        sort_order: str = "desc",
        include_pagination: bool = False
    ) -> Union[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Get conversations for a specific AI agent with optional pagination.

        Args:
            ai_agent_id: ID of the AI agent
            skip: Number of items to skip for pagination
            limit: Maximum number of items to return
            sort_by: Field to sort by
            sort_order: Sort order ('asc' or 'desc')
            include_pagination: Whether to include pagination metadata

        Returns:
            If include_pagination is False: List of conversations for the AI agent
            If include_pagination is True: Paginated response with conversations and pagination info
        """
        params = {
            "skip": skip,
            "sort_by": sort_by,
            "sort_order": sort_order,
            "include_pagination": include_pagination
        }

        if limit is not None:
            params["limit"] = limit

        return self._make_request(
            "GET",
            f"/aiagent/{ai_agent_id}/conversation",
            params=params
        )
    
    def get_conversations_by_user(
        self,
        user_id: str,
        skip: int = 0,
        limit: Optional[int] = None,
        sort_by: str = "createdAt",
        sort_order: str = "desc",
        include_pagination: bool = False
    ) -> Union[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Get conversations for a specific user with optional pagination.

        Args:
            user_id: ID of the user
            skip: Number of items to skip for pagination
            limit: Maximum number of items to return
            sort_by: Field to sort by
            sort_order: Sort order ('asc' or 'desc')
            include_pagination: Whether to include pagination metadata

        Returns:
            If include_pagination is False: List of conversations for the user
            If include_pagination is True: Paginated response with conversations and pagination info
        """
        params = {
            "skip": skip,
            "sort_by": sort_by,
            "sort_order": sort_order,
            "include_pagination": include_pagination
        }

        if limit is not None:
            params["limit"] = limit

        return self._make_request(
            "GET",
            f"/user/{user_id}/conversation",
            params=params
        )

    # Collections API
    def get_collections(self, ids: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Get a list of collections.

        Args:
            ids: Optional list of collection IDs

        Returns:
            Dictionary containing collections data
        """
        params = {}
        if ids:
            params["ids"] = ",".join(ids)
            
        return self._make_request("GET", "/collection", params=params)

    def get_collection(self, collection_id: str) -> Dict[str, Any]:
        """
        Get details of a specific collection.

        Args:
            collection_id: ID of the collection to retrieve

        Returns:
            Dictionary containing collection details
        """
        return self._make_request("GET", f"/collection/{collection_id}")
    
    def create_collection(self, collection_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new collection.
        
        Args:
            collection_data: Collection data
            
        Returns:
            The created collection
        """
        return self._make_request("POST", "/collection", data=collection_data)
    
    def update_collection(self, collection_id: str, collection_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing collection.
        
        Args:
            collection_id: ID of the collection to update
            collection_data: Updated collection data
            
        Returns:
            The updated collection
        """
        return self._make_request("PUT", f"/collection/{collection_id}", data=collection_data)
    
    def delete_collection(self, collection_id: str) -> bool:
        """
        Delete a collection.
        
        Args:
            collection_id: ID of the collection to delete
            
        Returns:
            True if deletion was successful
        """
        return self._make_request("DELETE", f"/collection/{collection_id}")
    
    def get_collections_by_group(self, group_id: str) -> List[Dict[str, Any]]:
        """
        Get collections for a specific group.

        Args:
            group_id: ID of the group

        Returns:
            List of collections in the group
        """
        return self._make_request("GET", f"/group/{group_id}/collection")
    
    def get_collections_by_creator(self, creator_id: str) -> List[Dict[str, Any]]:
        """
        Get collections created by a specific user.

        Args:
            creator_id: ID of the creator user

        Returns:
            List of collections created by the user
        """
        return self._make_request("GET", f"/user/{creator_id}/collection")

    # Groups API
    def get_groups(self, ids: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Get a list of groups.

        Args:
            ids: Optional list of group IDs

        Returns:
            Dictionary containing groups data
        """
        params = {}
        if ids:
            params["ids"] = ",".join(ids)
            
        return self._make_request("GET", "/group", params=params)

    def get_group(self, group_id: str) -> Dict[str, Any]:
        """
        Get details of a specific group.

        Args:
            group_id: ID of the group to retrieve

        Returns:
            Dictionary containing group details
        """
        return self._make_request("GET", f"/group/{group_id}")
    
    def create_group(self, group_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new group.
        
        Args:
            group_data: Group data
            
        Returns:
            The created group
        """
        return self._make_request("POST", "/group", data=group_data)
    
    def update_group(self, group_id: str, group_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing group.
        
        Args:
            group_id: ID of the group to update
            group_data: Updated group data
            
        Returns:
            The updated group
        """
        return self._make_request("PUT", f"/group/{group_id}", data=group_data)
    
    def delete_group(self, group_id: str) -> bool:
        """
        Delete a group.
        
        Args:
            group_id: ID of the group to delete
            
        Returns:
            True if deletion was successful
        """
        return self._make_request("DELETE", f"/group/{group_id}")
    
    def get_groups_by_admin_user(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get groups where a user is an admin.

        Args:
            user_id: ID of the admin user

        Returns:
            List of groups where the user is an admin
        """
        return self._make_request("GET", f"/user/{user_id}/admin-group")
    
    def get_groups_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get groups that a user belongs to.

        Args:
            user_id: ID of the user

        Returns:
            List of groups the user belongs to
        """
        return self._make_request("GET", f"/user/{user_id}/group")
    
    def get_groups_by_collection(self, collection_id: str) -> List[Dict[str, Any]]:
        """
        Get groups that include a specific collection.

        Args:
            collection_id: ID of the collection

        Returns:
            List of groups that include the collection
        """
        return self._make_request("GET", f"/collection/{collection_id}/group")
    
    def get_groups_by_purpose(self, purpose: str) -> List[Dict[str, Any]]:
        """
        Get groups with a specific purpose.
        
        Args:
            purpose: Purpose of the group (e.g., 'evaluation', 'security', 'efficiency')
            
        Returns:
            List of groups with the specified purpose
        """
        return self._make_request("GET", f"/group/purpose/{purpose}")
    
    def add_user_to_group(self, group_id: str, user_id: str, permission_level: str) -> Dict[str, Any]:
        """
        Add a user to a group with a specific permission level.
        
        Args:
            group_id: ID of the group
            user_id: ID of the user to add
            permission_level: Permission level for the user
            
        Returns:
            The updated group
        """
        data = {
            "user_id": user_id,
            "permission_level": permission_level
        }
        return self._make_request("POST", f"/group/{group_id}/users", data=data)
    
    def remove_user_from_group(self, group_id: str, user_id: str) -> Dict[str, Any]:
        """
        Remove a user from a group.
        
        Args:
            group_id: ID of the group
            user_id: ID of the user to remove
            
        Returns:
            The updated group
        """
        return self._make_request("DELETE", f"/group/{group_id}/users/{user_id}")
    
    def add_admin_to_group(self, group_id: str, user_id: str) -> Dict[str, Any]:
        """
        Add a user as an admin to a group.
        
        Args:
            group_id: ID of the group
            user_id: ID of the user to add as admin
            
        Returns:
            The updated group
        """
        data = {"user_id": user_id}
        return self._make_request("POST", f"/group/{group_id}/admins", data=data)
    
    def add_collection_to_group(self, group_id: str, collection_id: str) -> Dict[str, Any]:
        """
        Add a collection to a group.
        
        Args:
            group_id: ID of the group
            collection_id: ID of the collection to add
            
        Returns:
            The updated group
        """
        data = {"collection_id": collection_id}
        return self._make_request("POST", f"/group/{group_id}/collections", data=data)
    
    def remove_collection_from_group(self, group_id: str, collection_id: str) -> Dict[str, Any]:
        """
        Remove a collection from a group.
        
        Args:
            group_id: ID of the group
            collection_id: ID of the collection to remove
            
        Returns:
            The updated group
        """
        return self._make_request("DELETE", f"/group/{group_id}/collections/{collection_id}")
    
    def get_user_permission_level(self, group_id: str, user_id: str) -> str:
        """
        Get a user's permission level in a group.
        
        Args:
            group_id: ID of the group
            user_id: ID of the user
            
        Returns:
            The user's permission level
        """
        return self._make_request("GET", f"/group/{group_id}/users/{user_id}/permission")
    
    def get_users_with_permission_level(self, group_id: str, permission_level: str) -> List[str]:
        """
        Get users with a specific permission level in a group.
        
        Args:
            group_id: ID of the group
            permission_level: Permission level to filter by
            
        Returns:
            List of user IDs with the specified permission level
        """
        return self._make_request("GET", f"/group/{group_id}/permissions/{permission_level}/users")

    # AI Agents API
    def get_ai_agents(self, ids: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Get a list of AI agents.

        Args:
            ids: Optional list of AI agent IDs

        Returns:
            Dictionary containing AI agents data
        """
        params = {}
        if ids:
            params["ids"] = ",".join(ids)
            
        return self._make_request("GET", "/aiagent", params=params)

    def get_ai_agent(self, agent_id: str) -> Dict[str, Any]:
        """
        Get details of a specific AI agent.

        Args:
            agent_id: ID of the AI agent to retrieve

        Returns:
            Dictionary containing AI agent details
        """
        return self._make_request("GET", f"/aiagent/{agent_id}")
    
    def create_ai_agent(self, agent_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new AI agent.
        
        Args:
            agent_data: AI agent data
            
        Returns:
            The created AI agent
        """
        return self._make_request("POST", "/aiagent", data=agent_data)
    
    def update_ai_agent(self, agent_id: str, agent_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing AI agent.
        
        Args:
            agent_id: ID of the AI agent to update
            agent_data: Updated AI agent data
            
        Returns:
            The updated AI agent
        """
        return self._make_request("PUT", f"/aiagent/{agent_id}", data=agent_data)
    
    def delete_ai_agent(self, agent_id: str) -> bool:
        """
        Delete an AI agent.
        
        Args:
            agent_id: ID of the AI agent to delete
            
        Returns:
            True if deletion was successful
        """
        return self._make_request("DELETE", f"/aiagent/{agent_id}")
    
    def get_ai_agents_by_status(self, status: str) -> List[Dict[str, Any]]:
        """
        Get AI agents with a specific status.

        Args:
            status: Status of the AI agent ('active', 'inactive', or 'training')

        Returns:
            List of AI agents with the specified status
        """
        return self._make_request("GET", f"/aiagent/status/{status}")

    # Users API
    def get_users(self, ids: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Get a list of users.

        Args:
            ids: Optional list of user IDs

        Returns:
            Dictionary containing users data
        """
        params = {}
        if ids:
            params["ids"] = ",".join(ids)
            
        return self._make_request("GET", "/user", params=params)

    def get_user(self, user_id: str) -> Dict[str, Any]:
        """
        Get details of a specific user.

        Args:
            user_id: ID of the user to retrieve

        Returns:
            Dictionary containing user details
        """
        return self._make_request("GET", f"/user/{user_id}")
    
    def get_current_user(self) -> Dict[str, Any]:
        """
        Get the currently authenticated user.
        
        Returns:
            The current user's details
        """
        return self._make_request("GET", "/user/current")
    
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new user.
        
        Args:
            user_data: User data
            
        Returns:
            The created user
        """
        return self._make_request("POST", "/user", data=user_data)
    
    def update_user(self, user_id: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing user.
        
        Args:
            user_id: ID of the user to update
            user_data: Updated user data
            
        Returns:
            The updated user
        """
        return self._make_request("PUT", f"/user/{user_id}", data=user_data)
    
    def delete_user(self, user_id: str) -> bool:
        """
        Delete a user.
        
        Args:
            user_id: ID of the user to delete
            
        Returns:
            True if deletion was successful
        """
        return self._make_request("DELETE", f"/user/{user_id}")
    
    def get_users_by_role(self, role: str) -> List[Dict[str, Any]]:
        """
        Get users with a specific role.

        Args:
            role: Role of the user (e.g., 'admin', 'supervisor', 'executive')

        Returns:
            List of users with the specified role
        """
        return self._make_request("GET", f"/user/role/{role}")
    
    # System API
    def initialize_system(self) -> Dict[str, Any]:
        """
        Initialize the data source.
        
        Returns:
            Response from the server
        """
        return self._make_request("POST", "/system/initialize")
    
    def save_data(self) -> Dict[str, Any]:
        """
        Save all data to persistent storage.
        
        Returns:
            Response from the server
        """
        return self._make_request("POST", "/system/save")
    
    def clear_cache(self) -> Dict[str, Any]:
        """
        Clear all cached data.
        
        Returns:
            Response from the server
        """
        return self._make_request("POST", "/system/cache/clear")
    
    def generate_sample_data(self, size: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate sample data.
        
        Args:
            size: Size configuration ('small', 'medium', or 'large')
            
        Returns:
            Response from the server
        """
        data = {"size": size} if size else None
        return self._make_request("POST", "/system/sample-data/generate", data=data)
    
    def get_sample_data_status(self) -> Dict[str, Any]:
        """
        Get the status of sample data.
        
        Returns:
            Sample data status information
        """
        return self._make_request("GET", "/system/sample-data/status")
    
    def generate_static_sample_data(self) -> Dict[str, Any]:
        """
        Generate and save all three static sample data sets.
        
        Returns:
            Response from the server
        """
        return self._make_request("POST", "/system/sample-data/generate-static")
    
    def load_static_sample_data(self, size: Optional[str] = None) -> Dict[str, Any]:
        """
        Load static sample data.
        
        Args:
            size: Size configuration ('small', 'medium', or 'large')
            
        Returns:
            Response from the server
        """
        data = {"size": size} if size else None
        return self._make_request("POST", "/system/sample-data/load-static", data=data)
    
    def save_current_as_static(self, size: str) -> Dict[str, Any]:
        """
        Save the current data state as static sample data.
        
        Args:
            size: Size to save as ('small', 'medium', or 'large')
            
        Returns:
            Response from the server
        """
        data = {"size": size}
        return self._make_request("POST", "/system/sample-data/save-current", data=data)


if __name__ == "__main__":
    # Create client instance
    client = AgentMonitorClient("http://127.0.0.1:8000")

    # Get all agents
    print("\n=== All Agents ===")
    print("API URL:", client.base_url + "/aiagent")
    agents_result = client.get_ai_agents()

    if isinstance(agents_result, dict):
        agents = list(agents_result.values())
        print(f"Total agents: {len(agents)}")
        for agent in agents:
            print(f"Agent: {agent.get('name', 'Unknown')} (ID: {agent.get('id', 'Unknown')})")

    # Get first 5 conversations with pagination and include decoded messages
    print("\n=== First 5 Conversations with Decoded Messages ===")
    print("API URL:", client.base_url + "/conversation?limit=5&include_pagination=true&include_messages=true")
    conversations_result = client.get_conversations(limit=5, include_pagination=True, include_messages=True)

    if "items" in conversations_result:
        conversations = conversations_result["items"]
        page_info = conversations_result.get("page_info", {})
        print(f"Conversations: {len(conversations)} of {page_info.get('total_items', 'unknown')} total")

        for conversation in conversations:
            print(f"Conversation: {conversation.get('threadId', 'Unknown')} - User: {conversation.get('userName', 'Unknown')}")
            # Try different potential field names
            if 'decodedMessages' in conversation:
                messages_field = 'decodedMessages'
            elif 'decoded_messages' in conversation:
                messages_field = 'decoded_messages'
            else:
                messages_field = None

            if messages_field and conversation.get(messages_field):
                print(f"  Decoded Messages ({len(conversation[messages_field])}): ")
                for message in conversation[messages_field]:
                    print(f"    - {message.get('id', 'Unknown')} - from {message.get('type', 'Unknown')}: {message.get('content', 'Unknown')}")
            else:
                print("  No decoded messages found or no messages in the values field.")


    conversations_result = client.get_conversations(limit=5, include_pagination=True, include_messages=False)
    # Display the messages from the values field of a conversation
    if "items" in conversations_result:
        conversations = conversations_result["items"]
        for conversation in conversations:
            conversation_id = conversation.get('threadId', conversation.get('id', 'Unknown'))

            # Get messages directly from the conversation endpoint with include_messages=True
            print(f"\n=== Decoded Messages from conversation values field ===")
            conversation = client.get_conversation(conversation_id, include_messages=True)

            # Debug the response structure
            print(f"Response keys: {conversation.keys() if conversation else 'None'}")

            # Try different potential field names
            if conversation:
                if 'decodedMessages' in conversation:
                    messages_field = 'decodedMessages'
                elif 'decoded_messages' in conversation:
                    messages_field = 'decoded_messages'
                else:
                    messages_field = None

                if messages_field and conversation.get(messages_field):
                    messages = conversation.get(messages_field)
                    print(f"Found {len(messages)} messages in the values field")
                    for message in messages:
                        # Use new field names (type instead of sender)
                        print(f"Message: {message.get('id', 'Unknown')} - from {message.get('type', 'Unknown')}: {message.get('content', 'Unknown')}")
                else:
                    print("No decoded messages field found in the response or field is empty. Available fields:")
                    for key in conversation.keys():
                        print(f"- {key}")
            else:
                print("No conversation data returned.")
            



    