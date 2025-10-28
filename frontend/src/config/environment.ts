export interface EnvironmentConfig {
  API_BASE_URL: string;
  GRAPHQL_ENDPOINT: string;
  APP_NAME: string;
  DEBUG: boolean;
}

export const environments = {
  development: {
    API_BASE_URL: 'http://localhost:8081',
    GRAPHQL_ENDPOINT: 'http://localhost:8081/graphql',
    APP_NAME: 'Project Management (Dev)',
    DEBUG: true,
  } as EnvironmentConfig,
  
  production: {
    API_BASE_URL: '/api',
    GRAPHQL_ENDPOINT: '/graphql',
    APP_NAME: 'Project Management',
    DEBUG: false,
  } as EnvironmentConfig,
};

// Change this to switch environments quickly
export const CURRENT_ENV: keyof typeof environments = 'development';

// Export the current configuration
export const config = environments[CURRENT_ENV];

// Helper function to get API URL
export const getApiUrl = (endpoint: string): string => {
  return `${config.API_BASE_URL}${endpoint}`;
};

// Helper function for GraphQL HTTP endpoint (Queries/Mutations)
export const getGraphQLUrl = (): string => {
  return config.GRAPHQL_ENDPOINT;
};

/**
 * Helper function for GraphQL WebSocket endpoint (Subscriptions).
 * Uses /subscriptions endpoint for WebSocket connections.
 */
export const getWebSocketUrl = (): string => {
  const baseUrl = config.API_BASE_URL;
  
  // Replace http with ws, or https with wss for WebSocket connections
  if (baseUrl.startsWith('https:')) {
    return baseUrl.replace('https:', 'wss:') + '/subscriptions';
  }
  if (baseUrl.startsWith('http:')) {
    return baseUrl.replace('http:', 'ws:') + '/subscriptions';
  }
  
  // For relative paths in production
  return '/subscriptions';
};

console.log(`🚀 Running in ${CURRENT_ENV} mode`);
console.log(`📡 API Base: ${config.API_BASE_URL}`);
console.log(`🔗 GraphQL: ${config.GRAPHQL_ENDPOINT}`);
console.log(`🔗 WebSocket: ${getWebSocketUrl()}`);