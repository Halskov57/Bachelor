import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getGraphQLUrl } from '../config/environment';

// --- 1. HTTP Link (Queries and Mutations) ---
const httpLink = createHttpLink({
  uri: getGraphQLUrl(),
});

// --- 2. Authentication Link (HTTP) ---
const authLink = setContext((_, { headers } = {}) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// --- 3. Combined Link (No WebSocket) ---
const combinedLink = authLink.concat(httpLink);

// --- 4. Apollo Client ---
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
