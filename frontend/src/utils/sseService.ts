import { client } from './apolloClientSetup';

export interface SSEEvent {
  type: 'taskUpdate' | 'taskCreated' | 'taskUserAssigned' | 'epicUpdate' | 'epicCreated' | 'featureUpdate' | 'featureCreated' | 'projectUpdate';
  data: any;
}

interface ReconnectionState {
  attempts: number;
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  timeoutId?: NodeJS.Timeout;
}

class SSEService {
  private eventSources: Map<string, EventSource> = new Map();
  private listeners: Map<string, ((event: SSEEvent) => void)[]> = new Map();
  private reconnectionStates: Map<string, ReconnectionState> = new Map();

  /**
   * Subscribe to Server-Sent Events for a project
   */
  subscribeToProject(projectId: string, onEvent: (event: SSEEvent) => void): void {
    // Add listener
    const projectListeners = this.listeners.get(projectId) || [];
    projectListeners.push(onEvent);
    this.listeners.set(projectId, projectListeners);

    // Initialize reconnection state
    if (!this.reconnectionStates.has(projectId)) {
      this.reconnectionStates.set(projectId, {
        attempts: 0,
        maxAttempts: 10,
        baseDelay: 1000,
        maxDelay: 30000
      });
    }

    // Create EventSource if not exists
    if (!this.eventSources.has(projectId)) {
      this.createEventSource(projectId);
    }
  }

  /**
   * Unsubscribe from Server-Sent Events for a project
   */
  unsubscribeFromProject(projectId: string, onEvent?: (event: SSEEvent) => void): void {
    const projectListeners = this.listeners.get(projectId);
    if (!projectListeners) return;

    if (onEvent) {
      // Remove specific listener
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
      // Remove all listeners
      this.listeners.delete(projectId);
      this.closeEventSource(projectId);
      this.clearReconnectionState(projectId);
    }
  }

  /**
   * Create an EventSource for a project
   */
  private createEventSource(projectId: string): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No JWT token found for SSE connection');
      return;
    }

    // Note: EventSource doesn't support custom headers, so we'll pass the token as a query parameter
    // In production, consider using a temporary SSE token endpoint for better security
    const url = `http://localhost:8081/api/sse/project/${projectId}?token=${encodeURIComponent(token)}`;
    
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      console.log(`🔗 SSE connected for project: ${projectId}`);
      // Reset reconnection attempts on successful connection
      const state = this.reconnectionStates.get(projectId);
      if (state) {
        state.attempts = 0;
      }
    };

    eventSource.onerror = (error) => {
      console.error(`❌ SSE error for project ${projectId}:`, error);
      
      // Close the current connection
      eventSource.close();
      this.eventSources.delete(projectId);
      
      // Attempt to reconnect if there are still listeners
      if (this.listeners.has(projectId) && this.listeners.get(projectId)!.length > 0) {
        this.attemptReconnection(projectId);
      }
    };

    // Handle different event types
    eventSource.addEventListener('connected', (event) => {
      console.log(`✅ SSE handshake completed for project: ${projectId}`);
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

    eventSource.addEventListener('epicUpdate', (event) => {
      this.handleSSEEvent(projectId, 'epicUpdate', event.data);
    });

    eventSource.addEventListener('epicCreated', (event) => {
      this.handleSSEEvent(projectId, 'epicCreated', event.data);
    });

    eventSource.addEventListener('featureUpdate', (event) => {
      this.handleSSEEvent(projectId, 'featureUpdate', event.data);
    });

    eventSource.addEventListener('featureCreated', (event) => {
      this.handleSSEEvent(projectId, 'featureCreated', event.data);
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

      // Call all listeners for this project
      const listeners = this.listeners.get(projectId) || [];
      listeners.forEach(listener => listener(event));

      // Update Apollo Client cache
      this.updateApolloCache(event);
      
      console.log(`📡 SSE ${type} event received for project ${projectId}:`, data);
    } catch (error) {
      console.error('Failed to parse SSE event data:', error);
    }
  }

  /**
   * Update Apollo Client cache with real-time data
   */
  private updateApolloCache(event: SSEEvent): void {
    try {
      // For now, we'll refetch queries to update the cache
      // This could be optimized to update specific cache entries directly
      client.refetchQueries({
        include: 'active'
      });
    } catch (error) {
      console.error('Failed to update Apollo cache:', error);
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
      console.log(`🔌 SSE disconnected for project: ${projectId}`);
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnection(projectId: string): void {
    const state = this.reconnectionStates.get(projectId);
    if (!state) return;

    // Check if we've exceeded max attempts
    if (state.attempts >= state.maxAttempts) {
      console.error(`❌ SSE max reconnection attempts (${state.maxAttempts}) reached for project ${projectId}`);
      return;
    }

    // Clear any existing timeout
    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      state.baseDelay * Math.pow(2, state.attempts),
      state.maxDelay
    );

    state.attempts++;
    console.log(`🔄 SSE attempting reconnection ${state.attempts}/${state.maxAttempts} for project ${projectId} in ${delay}ms...`);

    state.timeoutId = setTimeout(() => {
      // Only reconnect if there are still listeners
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
    if (state?.timeoutId) {
      clearTimeout(state.timeoutId);
    }
    this.reconnectionStates.delete(projectId);
  }

  /**
   * Close all EventSource connections
   */
  closeAll(): void {
    // Clear all reconnection timers
    this.reconnectionStates.forEach((state, projectId) => {
      if (state.timeoutId) {
        clearTimeout(state.timeoutId);
      }
    });
    this.reconnectionStates.clear();

    // Close all connections
    this.eventSources.forEach((eventSource, projectId) => {
      eventSource.close();
      console.log(`🔌 SSE disconnected for project: ${projectId}`);
    });
    this.eventSources.clear();
    this.listeners.clear();
  }
}

export const sseService = new SSEService();