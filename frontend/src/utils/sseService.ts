import { client } from './apolloClientSetup';
import { config } from '../config/environment';

export interface SSEEvent {
  type: 'taskUpdate' | 'taskCreated' | 'taskUserAssigned' | 'taskDeleted' | 
        'epicUpdate' | 'epicCreated' | 'epicDeleted' | 
        'featureUpdate' | 'featureCreated' | 'featureDeleted' | 
        'projectUpdate';
  data: any;
}

interface ReconnectionState {
  attempts: number;
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  timeoutId?: NodeJS.Timeout;
  connectionCheckTimeoutId?: NodeJS.Timeout;
  lastSuccessfulConnection?: number;
  persistentRetryIntervalId?: NodeJS.Timeout; // For continuous 30s retry after max attempts
  lastConnectionAttempt?: number;
}

class SSEService {
  private eventSources: Map<string, EventSource> = new Map();
  private listeners: Map<string, ((event: SSEEvent) => void)[]> = new Map();
  private reconnectionStates: Map<string, ReconnectionState> = new Map();
  private readonly CONNECTION_TIMEOUT = 15000; // 15 seconds to establish connection

  /**
   * Subscribe to Server-Sent Events for a project
   */
  subscribeToProject(projectId: string, onEvent: (event: SSEEvent) => void): void {
    // ADD DEBUG LINE
    console.log('🔌 subscribeToProject called for:', projectId, 'existing connections:', this.eventSources.size);
    
    // Add listener
    const projectListeners = this.listeners.get(projectId) || [];
    projectListeners.push(onEvent);
    this.listeners.set(projectId, projectListeners);

    // Initialize reconnection state
    if (!this.reconnectionStates.has(projectId)) {
      this.reconnectionStates.set(projectId, {
        attempts: 0,
        maxAttempts: 10, // Initial exponential backoff attempts
        baseDelay: 1000,
        maxDelay: 30000,
        lastSuccessfulConnection: Date.now()
      });
    }

    const existingEventSource = this.eventSources.get(projectId);
    // ADD MORE DEBUG INFO
    console.log('🔌 EventSource state:', existingEventSource?.readyState, 'EventSource.CLOSED:', EventSource.CLOSED);
    
    if (!existingEventSource || existingEventSource.readyState === EventSource.CLOSED) {
      console.log('🔌 Creating new EventSource for:', projectId);
      this.createEventSource(projectId);
    } else {
      console.log('🔌 Reusing existing EventSource for:', projectId);
    }
  }

  /**
   * Unsubscribe from Server-Sent Events for a project
   */
  unsubscribeFromProject(projectId: string, onEvent?: (event: SSEEvent) => void): void {
    const projectListeners = this.listeners.get(projectId);
    if (!projectListeners) return;

    if (onEvent) {
      const index = projectListeners.indexOf(onEvent);
      if (index > -1) {
        projectListeners.splice(index, 1);
      }
      
      if (projectListeners.length === 0) {
        this.listeners.delete(projectId);
        this.closeEventSource(projectId);
        this.clearReconnectionState(projectId);
      } else {
        this.listeners.set(projectId, projectListeners);
      }
    } else {
      this.listeners.delete(projectId);
      this.closeEventSource(projectId);
      this.clearReconnectionState(projectId);
    }
  }

  /**
   * Create an EventSource for a project
   */
  private createEventSource(projectId: string): void {
    const state = this.reconnectionStates.get(projectId);
    
    // ADD DEBUG INFO
    console.log('🔌 createEventSource - checking debounce for:', projectId, 'lastAttempt:', state?.lastConnectionAttempt, 'now:', Date.now());
    
    // Prevent rapid reconnections
    if (state?.lastConnectionAttempt && 
        Date.now() - state.lastConnectionAttempt < 2000) {
      console.log('🔌 DEBOUNCED - too soon to reconnect for:', projectId);
      return;
    }

    console.log('🔌 Creating EventSource for:', projectId);
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('🔌 No token found in localStorage');
      return;
    }

    // ADD TOKEN DEBUG LINES:
    console.log('🔌 Token exists, length:', token.length);
    console.log('🔌 Token starts with:', token.substring(0, 20) + '...');
    
    try {
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const now = Date.now() / 1000;
      console.log('🔌 Token exp:', payload.exp, 'now:', now, 'expired:', payload.exp < now);
      console.log('🔌 Token sub:', payload.sub, 'role:', payload.role);
    } catch (e) {
      console.error('🔌 Failed to decode token:', e);
    }

    // FIX: Update last attempt time BEFORE creating EventSource
    if (state) {
      state.lastConnectionAttempt = Date.now();
      this.reconnectionStates.set(projectId, state);
    }

    const url = `${config.API_BASE_URL}/sse/project/${projectId}?token=${encodeURIComponent(token)}`;
    console.log('🔌 SSE URL:', url);
    
    const eventSource = new EventSource(url);
    
    // Store EventSource immediately so it's tracked
    this.eventSources.set(projectId, eventSource);
    if (state) {
      if (state.connectionCheckTimeoutId) {
        clearTimeout(state.connectionCheckTimeoutId);
      }
      
      state.connectionCheckTimeoutId = setTimeout(() => {
        if (eventSource.readyState === EventSource.CONNECTING) {
          eventSource.close();
          this.eventSources.delete(projectId);
          
          if (this.listeners.has(projectId) && this.listeners.get(projectId)!.length > 0) {
            this.attemptReconnection(projectId);
          }
        }
      }, this.CONNECTION_TIMEOUT);
    }

    eventSource.onopen = () => {
      const state = this.reconnectionStates.get(projectId);
      if (state) {
        state.attempts = 0;
        state.lastSuccessfulConnection = Date.now();
        
        if (state.connectionCheckTimeoutId) {
          clearTimeout(state.connectionCheckTimeoutId);
          state.connectionCheckTimeoutId = undefined;
        }
        
        if (state.persistentRetryIntervalId) {
          clearInterval(state.persistentRetryIntervalId);
          state.persistentRetryIntervalId = undefined;
        }
      }
    };

    eventSource.onerror = (error) => {
      const state = this.reconnectionStates.get(projectId);
      
      if (state?.connectionCheckTimeoutId) {
        clearTimeout(state.connectionCheckTimeoutId);
        state.connectionCheckTimeoutId = undefined;
      }
      
      if (eventSource.readyState === EventSource.CLOSED) {
        this.eventSources.delete(projectId);
        
        if (this.listeners.has(projectId) && this.listeners.get(projectId)!.length > 0) {
          this.attemptReconnection(projectId);
        }
      }
    };

    // Handle different event types
    eventSource.addEventListener('connected', (event) => {
      // Handshake completed
    });

    eventSource.addEventListener('taskUpdate', (event) => {
      this.handleSSEEvent(projectId, 'taskUpdate', event.data);
    });

    eventSource.addEventListener('taskCreated', (event) => {
      this.handleSSEEvent(projectId, 'taskCreated', event.data);
    });

    eventSource.addEventListener('taskUserAssigned', (event) => {
      this.handleSSEEvent(projectId, 'taskUserAssigned', event.data);
    });

    eventSource.addEventListener('taskDeleted', (event) => {
      this.handleSSEEvent(projectId, 'taskDeleted', event.data);
    });

    eventSource.addEventListener('epicUpdate', (event) => {
      this.handleSSEEvent(projectId, 'epicUpdate', event.data);
    });

    eventSource.addEventListener('epicCreated', (event) => {
      this.handleSSEEvent(projectId, 'epicCreated', event.data);
    });

    eventSource.addEventListener('epicDeleted', (event) => {
      this.handleSSEEvent(projectId, 'epicDeleted', event.data);
    });

    eventSource.addEventListener('featureUpdate', (event) => {
      this.handleSSEEvent(projectId, 'featureUpdate', event.data);
    });

    eventSource.addEventListener('featureCreated', (event) => {
      this.handleSSEEvent(projectId, 'featureCreated', event.data);
    });

    eventSource.addEventListener('featureDeleted', (event) => {
      this.handleSSEEvent(projectId, 'featureDeleted', event.data);
    });

    eventSource.addEventListener('projectUpdate', (event) => {
      this.handleSSEEvent(projectId, 'projectUpdate', event.data);
    });

    this.eventSources.set(projectId, eventSource);
  }

  /**
   * Handle incoming SSE events
   */
  private handleSSEEvent(projectId: string, type: SSEEvent['type'], rawData: string): void {
    try {
      const data = JSON.parse(rawData);
      const event: SSEEvent = { type, data };

      const listeners = this.listeners.get(projectId) || [];
      listeners.forEach(listener => listener(event));

      this.updateApolloCache(event);
    } catch (error) {
      // Failed to parse SSE event data
    }
  }

  /**
   * Update Apollo Client cache with real-time data
   */
  private updateApolloCache(event: SSEEvent): void {
    try {
      client.refetchQueries({
        include: 'active'
      });
    } catch (error) {
      // Failed to update Apollo cache
    }
  }

  /**
   * Close EventSource for a project
   */
  private closeEventSource(projectId: string): void {
    const eventSource = this.eventSources.get(projectId);
    if (eventSource) {
      eventSource.close();
      this.eventSources.delete(projectId);
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnection(projectId: string): void {
    const state = this.reconnectionStates.get(projectId);
    if (!state) return;

    if (state.attempts >= state.maxAttempts) {
      if (!state.persistentRetryIntervalId) {
        state.persistentRetryIntervalId = setInterval(() => {
          if (this.listeners.has(projectId) && this.listeners.get(projectId)!.length > 0) {
            this.createEventSource(projectId);
          } else {
            if (state.persistentRetryIntervalId) {
              clearInterval(state.persistentRetryIntervalId);
              state.persistentRetryIntervalId = undefined;
            }
          }
        }, 30000);
        
        this.reconnectionStates.set(projectId, state);
      }
      return;
    }

    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
    }

    const delay = Math.min(
      state.baseDelay * Math.pow(2, state.attempts),
      state.maxDelay
    );

    state.attempts++;

    state.timeoutId = setTimeout(() => {
      if (this.listeners.has(projectId) && this.listeners.get(projectId)!.length > 0) {
        this.createEventSource(projectId);
      }
    }, delay);

    this.reconnectionStates.set(projectId, state);
  }

  /**
   * Clear reconnection state for a project
   */
  private clearReconnectionState(projectId: string): void {
    const state = this.reconnectionStates.get(projectId);
    if (state) {
      if (state.timeoutId) {
        clearTimeout(state.timeoutId);
      }
      if (state.connectionCheckTimeoutId) {
        clearTimeout(state.connectionCheckTimeoutId);
      }
      if (state.persistentRetryIntervalId) {
        clearInterval(state.persistentRetryIntervalId);
      }
    }
    this.reconnectionStates.delete(projectId);
  }

  /**
   * Close all EventSource connections
   */
  closeAll(): void {
    this.reconnectionStates.forEach((state, projectId) => {
      if (state.timeoutId) {
        clearTimeout(state.timeoutId);
      }
      if (state.connectionCheckTimeoutId) {
        clearTimeout(state.connectionCheckTimeoutId);
      }
      if (state.persistentRetryIntervalId) {
        clearInterval(state.persistentRetryIntervalId);
      }
    });
    this.reconnectionStates.clear();

    this.eventSources.forEach((eventSource, projectId) => {
      eventSource.close();
    });
    this.eventSources.clear();
    this.listeners.clear();
  }
}

export const sseService = new SSEService();