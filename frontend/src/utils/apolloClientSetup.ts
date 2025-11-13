import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { getGraphQLUrl } from '../config/environment';

// --- 1. HTTP Link (Queries and Mutations) ---
const httpLink = createHttpLink({
  uri: getGraphQLUrl(),
});

// --- 2. Retry Link (Reconnection Logic) ---
const retryLink = new RetryLink({
  delay: {
    initial: 1000,     // Start with 1 second delay
    max: 30000,        // Max 30 seconds between retries (increased from 10s)
    jitter: true
  },
  attempts: {
    max: Infinity,     // Retry indefinitely (changed from 10)
    retryIf: (error, _operation) => {
      // Retry on network errors (server down, connection refused, etc.)
      // Don't retry on GraphQL errors (authentication, validation, etc.)
      const isNetworkError = !!error && !error.message?.includes('GraphQL');
      if (isNetworkError) {
        console.log(`🔄 Apollo: Network error detected, retrying...`);
      }
      return isNetworkError;
    }
  }
});

// --- 3. Error Handling Link ---
const errorLink = onError(({ graphQLErrors, networkError }: any) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }: any) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        extensions
      );

      // Check if it's an authentication error (token expired, invalid, etc.)
      if (
        extensions?.code === 'UNAUTHENTICATED' ||
        message.includes('JWT') ||
        message.includes('Unauthorized') ||
        message.toLowerCase().includes('not authenticated')
      ) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        console.log('Authentication error, redirecting to login');
        window.location.href = '/login';
        return;
      }
      
      // Check if it's a project access denied error (user removed from project or no permission)
      if (
        extensions?.code === 'FORBIDDEN' ||
        message.includes('Access denied') ||
        message.includes('not a member') ||
        message.includes('permission') ||
        message.toLowerCase().includes('forbidden')
      ) {
        // If currently on a project page, redirect to dashboard
        if (window.location.pathname.startsWith('/project/')) {
          console.log('Access denied to project, redirecting to dashboard');
          window.location.href = '/dashboard';
        }
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]:`, networkError);
    
    // Only redirect to login for actual authentication errors (401)
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      localStorage.removeItem('token');
      console.log('401 Unauthorized, redirecting to login');
      window.location.href = '/login';
      return;
    }
    
    // For 403 (Forbidden) on project pages, redirect to dashboard
    if ('statusCode' in networkError && networkError.statusCode === 403) {
      if (window.location.pathname.startsWith('/project/')) {
        console.log('403 Forbidden on project page, redirecting to dashboard');
        window.location.href = '/dashboard';
      }
    }
  }
});

// --- 4. Authentication Link (HTTP) ---
const authLink = setContext((_, { headers } = {}) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// --- 5. Combined Link (Error -> Auth -> Retry -> HTTP) ---
const combinedLink = errorLink.concat(authLink).concat(retryLink).concat(httpLink);

// --- 6. Apollo Client ---
export const client = new ApolloClient({
  link: combinedLink,
  cache: new InMemoryCache({
    typePolicies: {
      Task: {
        fields: {
          assignedUsers: {
            merge(existing = [], incoming) {
              return incoming;
            }
          }
        }
      },
      Project: {
        fields: {
          epics: {
            merge(existing = [], incoming) {
              return incoming;
            }
          }
        }
      },
      Epic: {
        fields: {
          features: {
            merge(existing = [], incoming) {
              return incoming;
            }
          }
        }
      },
      Feature: {
        fields: {
          tasks: {
            merge(existing = [], incoming) {
              return incoming;
            }
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});
