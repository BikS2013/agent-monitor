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
  res.json({
    items: [
      {
        id: 'group-1',
        name: 'Sample Group 1',
        createdAt: '2023-01-01T12:00:00Z',
        adminIds: ['user-1']
      },
      {
        id: 'group-2',
        name: 'Sample Group 2',
        createdAt: '2023-01-02T12:00:00Z',
        adminIds: ['user-2']
      }
    ]
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