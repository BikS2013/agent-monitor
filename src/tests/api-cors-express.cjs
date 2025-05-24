/**
 * CORS Helper for Agent Monitor API (Express.js version)
 * ----------------------------------------------------
 * 
 * This script demonstrates how to set up CORS properly in an Express.js API server
 * to allow requests from the Agent Monitor frontend.
 * 
 * Usage:
 * 1. Install required packages: npm install express cors
 * 2. Run this script: node api-cors-express.js
 * 3. Test CORS with the cors-test.html tool from the frontend
 * 
 * This is a minimal example that handles basic CORS configuration.
 * Add your actual API routes on top of this structure.
 */

const express = require('express');
const cors = require('cors');
const app = express();

// Parse command line arguments
const args = parseArgs();
const PORT = args.port || 8000;
const HOST = args.host || 'localhost';
const ALLOWED_ORIGIN = args.origin || 'http://localhost:5173';
const DEBUG = args.debug || false;

// Configure CORS
const corsOptions = {
  origin: ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-KEY', 'X-Client-ID'],
  credentials: true,
  maxAge: 3600
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Parse JSON request bodies
app.use(express.json());

// Log all requests (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Headers:`, req.headers);
  next();
});

// Health check endpoint
app.get('/system/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Agent Monitor API',
    cors_enabled: true,
    allowed_origins: ALLOWED_ORIGIN
  });
});

// Conversation endpoints
app.get('/conversation', (req, res) => {
  res.json({
    items: [
      {
        id: 'conv-1',
        threadId: 'thread-001',
        title: 'Sample Conversation 1',
        userName: 'User 1',
        createdAt: '2023-01-01T12:00:00Z',
        decodedMessages: [
          {
            id: 'msg-001',
            type: 'human',
            content: 'Hello, this is a test message'
          },
          {
            id: 'msg-002',
            type: 'ai',
            content: "Hello! I'm responding to your test message."
          }
        ]
      },
      {
        id: 'conv-2',
        threadId: 'thread-002',
        title: 'Sample Conversation 2',
        userName: 'User 2',
        createdAt: '2023-01-02T12:00:00Z',
        decodedMessages: []
      }
    ],
    page_info: {
      total_items: 2,
      limit: 20,
      skip: 0
    }
  });
});

app.get('/conversation/:id', (req, res) => {
  const id = req.params.id;
  const includeMessages = req.query.include_messages === 'true';
  
  const result = {
    id: id,
    threadId: `thread-${id}`,
    title: `Conversation ${id}`,
    userName: 'Test User',
    createdAt: '2023-01-01T12:00:00Z'
  };
  
  if (includeMessages) {
    result.decodedMessages = [
      {
        id: 'msg-001',
        type: 'human',
        content: 'Hello, this is a test message'
      },
      {
        id: 'msg-002',
        type: 'ai',
        content: "Hello! I'm responding to your test message."
      }
    ];
  }
  
  res.json(result);
});

// Collection endpoints
app.get('/collection', (req, res) => {
  res.json({
    items: [
      {
        id: 'coll-1',
        name: 'Sample Collection 1',
        createdAt: '2023-01-01T12:00:00Z',
        createdBy: 'User 1'
      },
      {
        id: 'coll-2',
        name: 'Sample Collection 2',
        createdAt: '2023-01-02T12:00:00Z',
        createdBy: 'User 2'
      }
    ]
  });
});

// Group endpoints
app.get('/group', (req, res) => {
  const ids = req.query.ids ? req.query.ids.split(',') : null;
  
  const allGroups = [
    {
      id: 'group-1',
      name: 'Security Review Group',
      description: 'Group for reviewing security-related conversations',
      purpose: 'security',
      created_at: '2023-01-01T12:00:00Z',
      updated_at: '2023-01-15T09:30:00Z',
      metadata: {
        totalCollections: 3,
        totalConversations: 42
      },
      is_private: true
    },
    {
      id: 'group-2',
      name: 'Efficiency Analysis Group',
      description: 'Group for analyzing agent efficiency',
      purpose: 'efficiency',
      created_at: '2023-01-02T12:00:00Z',
      updated_at: '2023-01-20T10:00:00Z',
      metadata: {
        totalCollections: 2,
        totalConversations: 18
      },
      is_private: false
    }
  ];
  
  const filteredGroups = ids ? allGroups.filter(g => ids.includes(g.id)) : allGroups;
  
  res.json({
    items: filteredGroups
  });
});

app.get('/group/:id', (req, res) => {
  const groupId = req.params.id;
  
  const groups = {
    'group-1': {
      id: 'group-1',
      name: 'Security Review Group',
      description: 'Group for reviewing security-related conversations',
      purpose: 'security',
      created_at: '2023-01-01T12:00:00Z',
      updated_at: '2023-01-15T09:30:00Z',
      metadata: {
        totalCollections: 3,
        totalConversations: 42,
        activeUsers: 5,
        lastActivity: '2023-01-15T14:30:00Z'
      },
      is_private: true
    },
    'group-2': {
      id: 'group-2',
      name: 'Efficiency Analysis Group',
      description: 'Group for analyzing agent efficiency',
      purpose: 'efficiency',
      created_at: '2023-01-02T12:00:00Z',
      updated_at: '2023-01-20T10:00:00Z',
      metadata: {
        totalCollections: 2,
        totalConversations: 18,
        activeUsers: 3,
        lastActivity: '2023-01-20T11:00:00Z'
      },
      is_private: false
    }
  };
  
  const group = groups[groupId];
  if (group) {
    res.json(group);
  } else {
    res.status(404).json({ error: 'Group not found' });
  }
});

app.post('/group', (req, res) => {
  const newGroup = {
    id: `group-${Date.now()}`,
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: {
      totalCollections: (req.body.collection_ids || []).length,
      totalConversations: 0
    }
  };
  
  res.status(201).json(newGroup);
});

app.put('/group/:id', (req, res) => {
  const groupId = req.params.id;
  
  const updatedGroup = {
    id: groupId,
    ...req.body,
    updated_at: new Date().toISOString()
  };
  
  res.json(updatedGroup);
});

app.delete('/group/:id', (req, res) => {
  res.json({ success: true });
});

app.get('/group/:id/collection', (req, res) => {
  const groupId = req.params.id;
  const { skip = 0, limit = 20, sortBy = 'created_at', sortOrder = 'desc', includePagination } = req.query;
  
  const collections = [
    {
      id: 'coll-1',
      name: 'High Priority Security Issues',
      description: 'Collection of high priority security conversations',
      created_at: '2023-01-10T09:00:00Z',
      updated_at: '2023-01-15T09:30:00Z',
      owner_id: 'user-123',
      creator: 'John Doe',
      is_public: false,
      tags: ['security', 'high-priority']
    },
    {
      id: 'coll-2',
      name: 'Efficiency Improvements Q1',
      description: 'Conversations showing efficiency improvements in Q1',
      created_at: '2023-01-12T10:00:00Z',
      updated_at: '2023-01-18T11:30:00Z',
      owner_id: 'user-456',
      creator: 'Jane Smith',
      is_public: true,
      tags: ['efficiency', 'q1-2023']
    }
  ];
  
  const response = {
    items: collections.slice(Number(skip), Number(skip) + Number(limit))
  };
  
  if (includePagination === 'true') {
    response.pageInfo = {
      totalItems: collections.length,
      limit: Number(limit),
      skip: Number(skip)
    };
  }
  
  res.json(response);
});

app.post('/group/:id/collection', (req, res) => {
  const groupId = req.params.id;
  const { collectionId } = req.body;
  
  res.json({
    success: true,
    group: {
      id: groupId,
      name: 'Updated Group',
      collectionIds: ['coll-1', 'coll-2', collectionId]
    }
  });
});

app.delete('/group/:id/collection/:collectionId', (req, res) => {
  const groupId = req.params.id;
  const collectionId = req.params.collectionId;
  
  res.json({
    success: true,
    group: {
      id: groupId,
      name: 'Updated Group',
      collectionIds: ['coll-1', 'coll-2'] // Simulating removal
    }
  });
});

app.get('/user/:id/admin-group', (req, res) => {
  const userId = req.params.id;
  
  res.json({
    items: [
      {
        id: 'group-1',
        name: 'Security Review Group',
        description: 'Group for reviewing security-related conversations',
        purpose: 'security',
        collectionIds: ['coll-1', 'coll-2', 'coll-3'],
        adminIds: [userId],
        userIds: [userId, 'user-456'],
        permission_levels: {
          [userId]: 'full',
          'user-456': 'read'
        },
        created_at: '2023-01-01T12:00:00Z',
        updated_at: '2023-01-15T09:30:00Z',
        is_private: true
      }
    ]
  });
});

app.get('/group/:id/user/:userId/permission', (req, res) => {
  const { id, userId } = req.params;
  const { permission } = req.query;
  
  // Mock implementation
  const hasPermission = userId === 'user-123' || permission === 'read';
  
  res.json({
    hasPermission,
    permissionLevel: hasPermission ? (userId === 'user-123' ? 'full' : 'read') : null
  });
});

// AI Agent endpoints
app.get('/aiagent', (req, res) => {
  res.json({
    items: [
      {
        id: 'agent-1',
        name: 'Sample Agent 1',
        createdAt: '2023-01-01T12:00:00Z',
        model: 'gpt-4'
      },
      {
        id: 'agent-2',
        name: 'Sample Agent 2',
        createdAt: '2023-01-02T12:00:00Z',
        model: 'claude-3-5'
      }
    ]
  });
});

// User endpoints
app.get('/user', (req, res) => {
  res.json({
    items: [
      {
        id: 'user-1',
        username: 'user1',
        name: 'User One'
      },
      {
        id: 'user-2',
        username: 'user2',
        name: 'User Two'
      }
    ]
  });
});

// Auth status endpoint
app.get('/system/auth/status', (req, res) => {
  res.json({
    authenticated: true,
    user: {
      id: 'user-1',
      username: 'demo_user',
      name: 'Demo User'
    }
  });
});

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`CORS-enabled Express API server running at http://${HOST}:${PORT}`);
  console.log(`Allowed origins: ${ALLOWED_ORIGIN}`);
});

// Helper function to parse command line arguments
function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      if (value === undefined) {
        args[key] = true;
      } else if (value === 'true') {
        args[key] = true;
      } else if (value === 'false') {
        args[key] = false;
      } else if (!isNaN(Number(value))) {
        args[key] = Number(value);
      } else {
        args[key] = value;
      }
    }
  });
  return args;
}