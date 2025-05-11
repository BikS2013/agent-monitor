/**
 * Application configuration settings
 *
 * This file contains the default configuration settings for the application.
 * For environment-specific settings, use .env files (see README for details).
 */

import { DataSize } from './data/jsonDataSource';

/**
 * API configuration
 */
export interface ApiConfig {
  /**
   * Whether to use the API data source instead of local data
   * Default: false
   */
  enabled: boolean;

  /**
   * Base URL of the Agent Monitor API
   * Default: 'http://localhost:8000'
   */
  baseUrl: string;

  /**
   * Authentication method to use
   * - 'none': No authentication
   * - 'token': JWT token authentication
   * - 'api-key': API key authentication
   * Default: 'none'
   */
  authMethod: 'none' | 'token' | 'api-key';

  /**
   * JWT token for authentication (when authMethod is 'token')
   */
  token?: string;

  /**
   * Client secret for API key authentication (when authMethod is 'api-key')
   */
  clientSecret?: string;

  /**
   * Client ID for API key authentication (when authMethod is 'api-key')
   */
  clientId?: string;
}

/**
 * Data source configuration
 */
export interface DataSourceConfig {
  /**
   * The dataset size to use
   * - 'internal': Uses in-memory mock data
   * - 'small': Uses small dataset from JSON file (~200 messages)
   * - 'medium': Uses medium dataset from JSON file (~5,000 messages)
   * - 'large': Uses large dataset from JSON file (~20,000 messages)
   */
  datasetSize: DataSize | 'internal';

  /**
   * Custom path to load dataset from (optional)
   * If provided, will try to load dataset from this path instead of the standard JSON files
   */
  customDatasetPath?: string;

  /**
   * Whether to allow changing dataset size through UI
   * Default: true
   */
  allowUIDatasetChange?: boolean;
}

/**
 * Application configuration
 */
export interface Config {
  /**
   * Data source configuration
   */
  dataSource: DataSourceConfig;

  /**
   * API configuration
   */
  api: ApiConfig;

  /**
   * Whether to prefer localStorage settings over config settings
   * If true, the application will use localStorage settings (if available) instead of
   * the config settings defined here. If false, config settings always override localStorage.
   * Default: true
   */
  preferLocalStorage: boolean;
}

/**
 * Default application configuration
 */
const defaultConfig: Config = {
  dataSource: {
    datasetSize: 'medium',
    allowUIDatasetChange: true,
  },
  api: {
    enabled: false,
    baseUrl: 'http://localhost:8000',
    authMethod: 'none',
  },
  preferLocalStorage: true,
};

/**
 * Load configuration from environment variables
 * In a production environment, these would be set in .env files or server environment
 */
function loadEnvConfig(): Partial<Config> {
  const envConfig: Partial<Config> = {
    dataSource: {
      datasetSize: 'medium', // Default value to satisfy TypeScript
    },
    api: {
      enabled: false,
      baseUrl: 'http://localhost:8000',
      authMethod: 'none',
    },
    preferLocalStorage: true,
  };

  // Parse dataset size from environment
  if (window.ENV_DATASET_SIZE) {
    envConfig.dataSource!.datasetSize = window.ENV_DATASET_SIZE as DataSize | 'internal';
  }

  // Parse custom dataset path
  if (window.ENV_CUSTOM_DATASET_PATH) {
    envConfig.dataSource!.customDatasetPath = window.ENV_CUSTOM_DATASET_PATH;
  }

  // Parse allow UI dataset change
  if (window.ENV_ALLOW_UI_DATASET_CHANGE !== undefined) {
    envConfig.dataSource!.allowUIDatasetChange = window.ENV_ALLOW_UI_DATASET_CHANGE === 'true';
  }

  // Parse prefer localStorage
  if (window.ENV_PREFER_LOCAL_STORAGE !== undefined) {
    envConfig.preferLocalStorage = window.ENV_PREFER_LOCAL_STORAGE === 'true';
  }

  // Parse API configuration
  if (window.ENV_API_ENABLED !== undefined) {
    envConfig.api!.enabled = window.ENV_API_ENABLED === 'true';
  }

  if (window.ENV_API_BASE_URL) {
    envConfig.api!.baseUrl = window.ENV_API_BASE_URL;
  }

  if (window.ENV_API_AUTH_METHOD) {
    envConfig.api!.authMethod = window.ENV_API_AUTH_METHOD as 'none' | 'token' | 'api-key';
  }

  if (window.ENV_API_TOKEN) {
    envConfig.api!.token = window.ENV_API_TOKEN;
  }

  if (window.ENV_API_CLIENT_SECRET) {
    envConfig.api!.clientSecret = window.ENV_API_CLIENT_SECRET;
  }

  if (window.ENV_API_CLIENT_ID) {
    envConfig.api!.clientId = window.ENV_API_CLIENT_ID;
  }

  return envConfig;
}

/**
 * Merge default config with environment config
 */
const envConfig = loadEnvConfig();
const config: Config = {
  ...defaultConfig,
  ...envConfig,
  dataSource: {
    ...defaultConfig.dataSource,
    ...envConfig.dataSource,
  },
  api: {
    ...defaultConfig.api,
    ...envConfig.api,
  },
};

export default config;

// Add window ENV variables for TypeScript
declare global {
  interface Window {
    ENV_DATASET_SIZE?: string;
    ENV_CUSTOM_DATASET_PATH?: string;
    ENV_ALLOW_UI_DATASET_CHANGE?: string;
    ENV_PREFER_LOCAL_STORAGE?: string;
    ENV_API_ENABLED?: string;
    ENV_API_BASE_URL?: string;
    ENV_API_AUTH_METHOD?: string;
    ENV_API_TOKEN?: string;
    ENV_API_CLIENT_SECRET?: string;
    ENV_API_CLIENT_ID?: string;
  }
}