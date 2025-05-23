# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Agent Monitor Dashboard is a React application for monitoring AI agent performance and conversations in a contact center environment. The app displays metrics, conversation histories, and supports organizing conversations into collections and groups for analysis.

### Key Features

- Dashboard with AI agent performance metrics
- Conversation history and detailed views
- Collection and group management
- Data visualization and analytics
- Multiple dataset sizes (small, medium, large)
- Flexible data source options (in-memory, JSON files, REST API)

## Commands

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (includes TypeScript checking)
npm run build

# Preview production build
npm run preview

# Note: No linting, testing, or formatting commands are currently configured
```

### Data Generation

```bash
# Generate small dataset (~750 messages, ~100 conversations)
node build-dataset.js small

# Generate medium dataset (~5,000 messages, ~500 conversations)
node build-dataset.js medium

# Generate large dataset (~20,000 messages, ~2,000 conversations)
node build-dataset.js large

# Generate all dataset sizes
node build-dataset.js small && node build-dataset.js medium && node build-dataset.js large

# Export data to JSON
node build-export-data.js

# Generate large data (alternative script)
node build-large-data.js
```

### Docker

```bash
# Build Docker image
docker build -t ai-agent-monitor .

# Run Docker container
docker run -p 8080:80 ai-agent-monitor

# Run with Docker Compose
docker-compose up -d
```

### API Testing

```bash
# Run API CORS test server
node src/tests/api-cors-express.js

# Run no-auth API test
node src/tests/noauth-test.js

# Debug API connections
node src/tests/api-debug.js
```

## Architecture

### Data Model

The application follows a hierarchical data model:

1. **Messages** - Individual communications between users and AI agents
2. **Conversations** - Collection of messages between a user and AI agent
3. **Collections** - Groups of conversations based on filtering criteria
4. **Groups** - Higher-level organization of collections with access controls

Other key entities include AIAgents and Users.

### Data Sources

The application supports multiple data sources:

1. **In-Memory Sample Data** - Default small dataset loaded from sampleData.ts
2. **JSON Data Source** - External data loaded from JSON files in different sizes
3. **API Data Source** - Data from an external REST API with comprehensive endpoints

Data sources are configured through the `RepositoryContext` which initializes repositories with the selected data source.

### Repository Pattern

The app implements the repository pattern to abstract data access:

- `RepositoryFactory` creates instances of repositories for each entity type
- Each repository (AIAgentRepository, ConversationRepository, etc.) implements a common interface
- Repositories handle CRUD operations and relationships between entities
- Base repository class provides common functionality for all entity types

### API Integration

The application includes comprehensive API support with specifications for:

- **Conversations API** (`/conversation/*`) - Message and conversation management
- **Collections API** (`/collections/*`) - Conversation grouping and filtering
- **Groups API** (`/groups/*`) - High-level access control and organization
- **AI Agents API** (`/ai-agents/*`) - Agent configuration and monitoring
- **User API** (`/users/*`) - User management and permissions
- **Settings API** (`/settings/*`) - Application configuration

API Features:
- Multiple authentication methods: JWT token, API key, or no-auth mode
- Configurable base URL and authentication through UI settings
- Robust error handling with `ApiError` class
- Automatic retry logic and timeout handling
- CORS support for cross-origin requests

### Navigation

The app uses a state-based navigation system:
- Linear navigation flow: Dashboard → Conversations → Collections → Groups → AI Agents → Analytics → Settings
- Supports keyboard navigation (arrow keys) and swipe gestures
- Maintains selected item state across view transitions
- No formal routing library - navigation managed through React state

### Context API

React Context API is used for state management:

- `DataContext` provides access to data entities and operations
- `RepositoryContext` manages repository instances and initialization
- `ErrorContext` for centralized error handling
- `ThemeContext` for UI theme management
- Separate contexts for Conversations API when using dual-API mode

## Data Flow

1. User selects a data source in the Settings view
2. `RepositoryContext` initializes the `RepositoryFactory` with the selected data source
3. Repositories are created for each entity type
4. Views and components access repositories through context hooks to fetch and modify data
5. For API sources, `ApiClient` handles all HTTP requests with proper authentication

## Environment Configuration

Configuration can be set through:

1. **Environment Variables**:
   - `ENV_DATASET_SIZE`: 'small', 'medium', 'large' (default: 'medium')
   - `ENV_CUSTOM_DATASET_PATH`: Path to custom dataset
   - `ENV_ALLOW_UI_DATASET_CHANGE`: 'true', 'false' (default: 'true')
   - `ENV_PREFER_LOCAL_STORAGE`: 'true', 'false' (default: 'true')

2. **Configuration File** (`src/config.ts`):
   - Default configuration settings
   - API endpoint configurations
   - Authentication defaults

3. **localStorage**:
   - Persisted user preferences
   - API configuration and credentials
   - Selected data source settings

Priority order: localStorage (if enabled) > Environment variables > Default config

## TypeScript Configuration

- Target: ES2020 with strict mode enabled
- Module resolution: bundler
- No emit (Vite handles compilation)
- Excludes `exportDataToJson.ts` from compilation
- Path aliases configured for clean imports