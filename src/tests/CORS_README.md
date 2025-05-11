# Fixing CORS Issues in Agent Monitor API

This directory contains tools and examples to help diagnose and fix Cross-Origin Resource Sharing (CORS) issues with the Agent Monitor API.

## What is CORS?

Cross-Origin Resource Sharing (CORS) is a security mechanism that allows web applications running at one origin (domain, protocol, or port) to access resources from a different origin. By default, web browsers block cross-origin HTTP requests initiated from scripts for security reasons. CORS provides a way for servers to indicate that their resources can be accessed from specific origins.

## Common CORS Error Message

The typical CORS error in the browser console looks like:

```
Access to fetch at 'http://localhost:8000/collection' from origin 'http://localhost:5173' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present 
on the requested resource.
```

## Diagnosing CORS Issues

Use the provided `cors-test.html` tool to test the API endpoints and diagnose CORS issues:

1. Open `cors-test.html` in your browser
2. Enter the API endpoint URL (e.g., `http://localhost:8000/conversation`)
3. Select the appropriate HTTP method (GET, POST, etc.)
4. Choose the authentication method if needed
5. Click "Test API Endpoint" or "Test Common Endpoints"

## Fixing CORS Issues

### Option 1: Use the Sample API Servers

For testing purposes, you can use one of the provided sample API servers that already have CORS correctly configured:

#### Flask (Python) Server:

```bash
# Install dependencies
pip install flask flask-cors

# Run the server
python api-cors-helper.py --host=localhost --port=8000 --origin=http://localhost:5173
```

#### Express.js (Node.js) Server:

```bash
# Install dependencies
npm install express cors

# Run the server
node api-cors-express.js --host=localhost --port=8000 --origin=http://localhost:5173
```

### Option 2: Configure Your Existing API Server

Add CORS headers to your existing API server based on the server technology:

#### Express.js (Node.js):

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-KEY', 'X-Client-ID'],
  credentials: true
}));
```

#### Flask (Python):

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {
    "origins": "http://localhost:5173",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "X-API-KEY", "X-Client-ID"]
}})
```

#### Django (Python):

```python
# In settings.py
INSTALLED_APPS = [
    # ...
    'corsheaders',
    # ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be placed at the top
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-api-key",
    "x-client-id",
]
```

#### Nginx:

```nginx
server {
    # ... other configuration
    
    # CORS configuration
    add_header 'Access-Control-Allow-Origin' 'http://localhost:5173' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-API-KEY, X-Client-ID' always;
    
    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'http://localhost:5173' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-API-KEY, X-Client-ID' always;
        add_header 'Access-Control-Max-Age' '3600' always;
        add_header 'Content-Type' 'text/plain charset=UTF-8';
        add_header 'Content-Length' '0';
        return 204;
    }
}
```

## Important CORS Headers

- `Access-Control-Allow-Origin`: Specifies which origins can access the resource
- `Access-Control-Allow-Methods`: Specifies the allowed HTTP methods 
- `Access-Control-Allow-Headers`: Specifies which headers can be used in the request
- `Access-Control-Allow-Credentials`: Indicates whether the response can be shared when credentials are included
- `Access-Control-Max-Age`: Specifies how long preflight request results can be cached

## Testing After Configuration

After configuring CORS on your API server:

1. Restart your API server
2. Use the `cors-test.html` tool to verify that CORS is properly configured
3. Check for the appropriate CORS headers in the responses
4. If everything is working, the frontend application should now be able to connect to the API

## Troubleshooting

If you're still experiencing CORS issues:

1. Ensure the Origin header in the response matches your frontend URL exactly (protocol, domain, and port)
2. Check for any proxy servers or firewalls that might be stripping CORS headers
3. Make sure the API server is handling OPTIONS (preflight) requests properly
4. Verify that all required headers are included in the Access-Control-Allow-Headers response
5. Check the browser console for specific CORS error messages