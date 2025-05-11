#!/usr/bin/env python3
"""
CORS Helper for Agent Monitor API
--------------------------------

This script demonstrates how to set up CORS properly in a Flask API server
to allow requests from the Agent Monitor frontend.

Usage:
1. Install required packages: pip install flask flask-cors
2. Run this script: python api-cors-helper.py
3. Test CORS with the cors-test.html tool from the frontend

This is a minimal example that handles basic CORS configuration.
Add your actual API routes on top of this structure.
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import argparse
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Parse command-line arguments
parser = argparse.ArgumentParser(description='CORS-enabled Flask API server for Agent Monitor')
parser.add_argument('--host', default='localhost', help='Host to bind server to')
parser.add_argument('--port', type=int, default=8000, help='Port to bind server to')
parser.add_argument('--origin', default='http://localhost:5173', 
                    help='Allowed origin for CORS (frontend URL)')
parser.add_argument('--debug', action='store_true', help='Enable debug mode')
args = parser.parse_args()

# Create Flask app
app = Flask(__name__)

# Configure CORS
cors_config = {
    "origins": [args.origin],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": [
        "Content-Type", 
        "Authorization", 
        "X-API-KEY", 
        "X-Client-ID"
    ],
    "supports_credentials": True,
    "max_age": 3600
}

# Apply CORS configuration to all routes
CORS(app, resources={r"/*": cors_config})

# Log all requests (helpful for debugging)
@app.before_request
def log_request():
    logger.info(f"{request.method} {request.path} - Headers: {dict(request.headers)}")

# Health check endpoint
@app.route('/system/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "service": "Agent Monitor API",
        "cors_enabled": True,
        "allowed_origins": cors_config["origins"]
    })

# Add more API routes here...

# Conversation endpoints
@app.route('/conversation', methods=['GET'])
def get_conversations():
    return jsonify({
        "items": [
            {
                "id": "conv-1",
                "threadId": "thread-001",
                "title": "Sample Conversation 1",
                "userName": "User 1",
                "createdAt": "2023-01-01T12:00:00Z",
                "decodedMessages": [
                    {
                        "id": "msg-001",
                        "type": "human",
                        "content": "Hello, this is a test message"
                    },
                    {
                        "id": "msg-002",
                        "type": "ai",
                        "content": "Hello! I'm responding to your test message."
                    }
                ]
            },
            {
                "id": "conv-2",
                "threadId": "thread-002",
                "title": "Sample Conversation 2",
                "userName": "User 2",
                "createdAt": "2023-01-02T12:00:00Z",
                "decodedMessages": []
            }
        ],
        "page_info": {
            "total_items": 2,
            "limit": 20,
            "skip": 0
        }
    })

@app.route('/conversation/<id>', methods=['GET'])
def get_conversation(id):
    include_messages = request.args.get('include_messages', 'false').lower() == 'true'
    
    result = {
        "id": id,
        "threadId": f"thread-{id}",
        "title": f"Conversation {id}",
        "userName": "Test User",
        "createdAt": "2023-01-01T12:00:00Z"
    }
    
    if include_messages:
        result["decodedMessages"] = [
            {
                "id": "msg-001",
                "type": "human",
                "content": "Hello, this is a test message"
            },
            {
                "id": "msg-002",
                "type": "ai",
                "content": "Hello! I'm responding to your test message."
            }
        ]
    
    return jsonify(result)

# Collection endpoints
@app.route('/collection', methods=['GET'])
def get_collections():
    return jsonify({
        "items": [
            {
                "id": "coll-1",
                "name": "Sample Collection 1",
                "createdAt": "2023-01-01T12:00:00Z",
                "createdBy": "User 1"
            },
            {
                "id": "coll-2",
                "name": "Sample Collection 2",
                "createdAt": "2023-01-02T12:00:00Z",
                "createdBy": "User 2"
            }
        ]
    })

# Group endpoints
@app.route('/group', methods=['GET'])
def get_groups():
    return jsonify({
        "items": [
            {
                "id": "group-1",
                "name": "Sample Group 1",
                "createdAt": "2023-01-01T12:00:00Z",
                "adminIds": ["user-1"]
            },
            {
                "id": "group-2",
                "name": "Sample Group 2",
                "createdAt": "2023-01-02T12:00:00Z",
                "adminIds": ["user-2"]
            }
        ]
    })

# AI Agent endpoints
@app.route('/aiagent', methods=['GET'])
def get_agents():
    return jsonify({
        "items": [
            {
                "id": "agent-1",
                "name": "Sample Agent 1",
                "createdAt": "2023-01-01T12:00:00Z",
                "model": "gpt-4"
            },
            {
                "id": "agent-2",
                "name": "Sample Agent 2",
                "createdAt": "2023-01-02T12:00:00Z",
                "model": "claude-3-5"
            }
        ]
    })

# User endpoints
@app.route('/user', methods=['GET'])
def get_users():
    return jsonify({
        "items": [
            {
                "id": "user-1",
                "username": "user1",
                "name": "User One"
            },
            {
                "id": "user-2",
                "username": "user2",
                "name": "User Two"
            }
        ]
    })

# Auth status endpoint
@app.route('/system/auth/status', methods=['GET'])
def auth_status():
    return jsonify({
        "authenticated": True,
        "user": {
            "id": "user-1",
            "username": "demo_user",
            "name": "Demo User"
        }
    })

if __name__ == '__main__':
    logger.info(f"Starting CORS-enabled Flask API server on {args.host}:{args.port}")
    logger.info(f"Allowed origins: {cors_config['origins']}")
    
    app.run(host=args.host, port=args.port, debug=args.debug)