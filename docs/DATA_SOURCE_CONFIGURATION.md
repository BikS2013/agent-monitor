# Data Source Configuration Guide

This document explains how to configure different data sources in the application.

## Available Data Sources

The application supports different data sources to accommodate various use cases:

1. **JSON Data Files** - External data loaded from JSON files in the `/public` directory
2. **In-Memory Mock Data** - Default sample data loaded directly from code

## Configuring Data Size

The application supports three different dataset sizes when using JSON files as the data source:

- **Small** - Approximately 200 messages and 100 conversations
- **Medium** - Approximately 5,000 messages and 500 conversations
- **Large** - Approximately 20,000 messages and 2,000 conversations

### How to Change Data Size

There are three ways to change the data size:

#### 1. Using the Settings UI

1. Navigate to the **Settings** page in the application
2. Scroll down to the **Data Source** section
3. Select your desired dataset size (Small, Medium, or Large)
4. The application will automatically reload with the new dataset

> Note: The Settings UI can be disabled via configuration settings

#### 2. Programmatically

You can programmatically change the data size by using the application's context API:

```typescript
import { useRepositories } from '../context/RepositoryContext';

// Inside your component
const { initialize } = useRepositories();

// Change to small dataset
await initialize(undefined, 'small');

// Change to medium dataset
await initialize(undefined, 'medium');

// Change to large dataset
await initialize(undefined, 'large');
```

To persist this setting between page reloads, you should also update localStorage:

```typescript
// Save setting to localStorage
localStorage.setItem('dataSize', 'medium'); // or 'small' or 'large'
```

#### 3. Using Configuration Settings

The application supports configuration via environment variables or configuration file.

##### Environment Variables (Runtime)

The application checks for the following environment variables at runtime:

| Variable | Description | Valid Values | Default |
|----------|-------------|--------------|---------|
| ENV_DATASET_SIZE | The dataset size to use | 'small', 'medium', 'large', 'internal' | 'medium' |
| ENV_CUSTOM_DATASET_PATH | Path to a custom dataset file | String (path) | undefined |
| ENV_ALLOW_UI_DATASET_CHANGE | Whether to allow dataset changes from the UI | 'true', 'false' | 'true' |
| ENV_PREFER_LOCAL_STORAGE | Whether localStorage settings override environment settings | 'true', 'false' | 'true' |

When running the application in a Docker container, you can set these environment variables:

```bash
docker run -p 8080:80 \
  -e ENV_DATASET_SIZE=large \
  -e ENV_ALLOW_UI_DATASET_CHANGE=false \
  ai-agent-monitor
```

##### Configuration File

For more advanced configuration, you can modify the `src/config.ts` file:

```typescript
const defaultConfig: Config = {
  dataSource: {
    datasetSize: 'medium',  // 'small', 'medium', 'large', or 'internal'
    allowUIDatasetChange: true,
    customDatasetPath: undefined,  // Optional path to custom dataset
  },
  preferLocalStorage: true,  // Whether localStorage overrides config
};
```

## Configuration Priority

The application uses the following priority order for dataset configuration:

1. **localStorage settings** - Highest priority (if `preferLocalStorage` is true)
2. **Environment variables** - Medium priority
3. **Default config file** - Lowest priority

## Using a Custom Data Source

Advanced users can implement and provide a custom data source by implementing the `IDataSource` interface:

```typescript
import { IDataSource } from './src/data/sources/IDataSource';
import { useRepositories } from './src/context/RepositoryContext';

// Create your custom data source implementation
class CustomDataSource implements IDataSource {
  // Implement all required methods...
}

// Inside your component
const { initialize } = useRepositories();

// Initialize with custom data source
const customDataSource = new CustomDataSource();
await initialize(customDataSource);
```

## Data Source Files

The JSON data files are located in the `/public` directory:

- `/public/smallSampleData.json`
- `/public/mediumSampleData.json`
- `/public/largeSampleData.json`

## Implementation Details

The data source configuration is managed through the `RepositoryContext` which initializes the `RepositoryFactory`. The factory creates all necessary repositories and connects them to the selected data source.

The data source selection code can be found in:
- `src/context/RepositoryContext.tsx`
- `src/data/repositories/RepositoryFactory.ts`
- `src/views/SettingsView.tsx`
- `src/config.ts`

## Configuration During Build

When building the application for production, you can use environment variable substitution to inject configuration values:

```bash
# Build with specific dataset size
ENV_DATASET_SIZE=large npm run build
```

This will replace the placeholder values in the index.html file with the specified values.

## Troubleshooting

If you encounter issues with data loading:

1. Check browser console for error messages
2. Verify the JSON files exist in the `/public` directory
3. Clear localStorage and reload the application to reset to defaults
4. Try a smaller dataset if the large dataset is causing performance issues
5. Check configuration settings in `src/config.ts` and environment variables