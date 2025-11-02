import { client } from './apolloClientSetup';

export interface SSEEvent {
  type: 'taskUpdate' | 'taskCreated' | 'taskUserAssigned' | 'epicUpdate' | 'epicCreated' | 'featureUpdate' | 'featureCreated' | 'projectUpdate';
  data: any;
}

class SSEService {
  private eventSources: Map<string, EventSource> = new Map();
  private listeners: Map<string, ((event: SSEEvent) => void)[]> = new Map();

  /**
   * Subscribe to Server-Sent Events for a project
   */
  subscribeToProject(projectId: string, onEvent: (event: SSEEvent) => void): void {
    // Add listener
    const projectListeners = this.listeners.get(projectId) || [];
    projectListeners.push(onEvent);
    this.listeners.set(projectId, projectListeners);

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
      } else {
        this.listeners.set(projectId, projectListeners);
      }
    } else {
      // Remove all listeners
      this.listeners.delete(projectId);
      this.closeEventSource(projectId);
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
    };

    eventSource.onerror = (error) => {
      console.error(`❌ SSE error for project ${projectId}:`, error);
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
   * Close all EventSource connections
   */
  closeAll(): void {
    this.eventSources.forEach((eventSource, projectId) => {
      eventSource.close();
      console.log(`🔌 SSE disconnected for project: ${projectId}`);
    });
    this.eventSources.clear();
    this.listeners.clear();
  }
}

export const sseService = new SSEService();