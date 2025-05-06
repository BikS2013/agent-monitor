# AI Agent Monitor Dashboard

A React dashboard application for monitoring AI agent performance and conversations within a contact center. The application supports multiple dataset sizes for different use cases.

## Features

- Dashboard with real-time AI agent performance metrics
- Conversation history and detailed conversation views
- Collection management for organizing conversations
- Group management for team collaboration
- AI agent configuration and monitoring
- Data visualization and analytics
- Flexible dataset sizing (small, medium, large) for testing and demonstrations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

### Build for Production

```
npm run build
```

## Data Sources

The application supports multiple data source modes:

1. **Default (in-memory)** - A small sample dataset that's loaded directly from sampleData.ts
2. **External JSON datasets** - Three different sizes of datasets can be generated and loaded from JSON files:
   - **Small**: ~750 messages, ~100 conversations
   - **Medium**: ~5,000 messages, ~500 conversations
   - **Large**: ~20,000 messages, ~2,000 conversations

### Using the External JSON Datasets

1. First, you need to generate the dataset JSON files:

```
# Generate small dataset
node build-dataset.js small

# Generate medium dataset
node build-dataset.js medium

# Generate large dataset
node build-dataset.js large

# Or generate all sizes at once
node build-dataset.js small && node build-dataset.js medium && node build-dataset.js large
```

2. This creates JSON files in the public directory:
   - `smallSampleData.json` (~750 messages, ~100 conversations)
   - `mediumSampleData.json` (~5,000 messages, ~500 conversations)
   - `largeSampleData.json` (~20,000 messages, ~2,000 conversations)

3. In the Settings view, select the desired dataset size under the "Data Source" section

For more detailed information about the datasets, see:
- [Dataset Guide](./docs/DATASET_GUIDE.md)
- [Data Source Configuration Guide](./docs/DATA_SOURCE_CONFIGURATION.md)

## Docker Support

The application includes Docker support for easy deployment.

### Build and run with Docker

```
# Build the Docker image
docker build -t ai-agent-monitor .

# Run the container
docker run -p 8080:80 ai-agent-monitor
```

### Using Docker Compose

```
docker-compose up -d
```

## Project Structure

```
/src
  /components - UI components
  /context - React context providers
  /data - Data handling
    /repositories - Repository pattern implementation
    /sources - Data sources
    /types.ts - TypeScript definitions
  /views - Page views
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.