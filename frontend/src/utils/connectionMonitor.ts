import { client } from './apolloClientSetup';

interface ConnectionState {
  isConnected: boolean;
  checkIntervalId?: NodeJS.Timeout;
  lastCheckTime?: number;
}

class ConnectionMonitor {
  private state: ConnectionState = {
    isConnected: true,
  };
  
  private readonly CHECK_INTERVAL_NORMAL = 30000; // Check every 30 seconds when connected
  private readonly CHECK_INTERVAL_DISCONNECTED = 5000; // Check every 5 seconds when disconnected
  private readonly HEALTH_CHECK_ENDPOINT = '/sse/health';

  /**
   * Start monitoring backend connection
   */
  startMonitoring(): void {
    // Don't start multiple monitors
    if (this.state.checkIntervalId) {
      return;
    }

    console.log('🔍 Connection monitor started');
    
    // Initial check
    this.checkConnection();
    
    // Set up periodic checks - will adjust interval based on connection state
    this.scheduleNextCheck();
  }

  /**
   * Schedule the next connection check based on current state
   */
  private scheduleNextCheck(): void {
    // Clear any existing interval
    if (this.state.checkIntervalId) {
      clearInterval(this.state.checkIntervalId);
    }

    // Use faster checks when disconnected to detect reconnection quickly
    const interval = this.state.isConnected 
      ? this.CHECK_INTERVAL_NORMAL 
      : this.CHECK_INTERVAL_DISCONNECTED;

    this.state.checkIntervalId = setInterval(() => {
      this.checkConnection();
    }, interval);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.state.checkIntervalId) {
      clearInterval(this.state.checkIntervalId);
      this.state.checkIntervalId = undefined;
    }
  }

  /**
   * Check if backend is reachable
   */
  private async checkConnection(): Promise<void> {
    this.state.lastCheckTime = Date.now();
    
    try {
      // Try to fetch health endpoint (or any simple endpoint)
      const response = await fetch(this.getHealthUrl(), {
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      console.log(`🔍 Health check response: ${response.status} ${response.statusText}`);

      // Consider 2xx and 4xx as "backend is up" (4xx means backend responded, just rejected the request)
      // Only 5xx errors mean backend is down/unreachable
      if (response.ok || response.status < 500) {
        this.handleConnectionRestored();
      } else {
        console.log(`⚠️ Backend returned 5xx error: ${response.status}`);
        this.handleConnectionLost();
      }
    } catch (error) {
      // Network error or timeout - backend is definitely down
      console.log(`⚠️ Health check failed:`, error instanceof Error ? error.message : error);
      this.handleConnectionLost();
    }
  }

  /**
   * Handle when connection is restored
   */
  private handleConnectionRestored(): void {
    if (!this.state.isConnected) {
      console.log('✅ Backend connection restored! Resetting Apollo Client...');
      
      // Clear Apollo Client cache to force fresh queries
      client.resetStore().catch((error) => {
        console.error('Failed to reset Apollo store:', error);
        // If reset fails, try clearing the cache
        client.clearStore().catch(console.error);
      });
      
      this.state.isConnected = true;
      
      // Switch back to slower check interval
      this.scheduleNextCheck();
      
      // Trigger a custom event that components can listen to
      window.dispatchEvent(new CustomEvent('backend-reconnected'));
    }
  }

  /**
   * Handle when connection is lost
   */
  private handleConnectionLost(): void {
    if (this.state.isConnected) {
      console.log('❌ Backend connection lost - switching to faster health checks (every 5s)');
      this.state.isConnected = false;
      
      // Switch to faster check interval to detect reconnection quickly
      this.scheduleNextCheck();
      
      // Trigger a custom event
      window.dispatchEvent(new CustomEvent('backend-disconnected'));
    }
  }

  /**
   * Get health check URL based on environment
   */
  private getHealthUrl(): string {
    // In production, the backend is proxied through /api
    if (window.location.hostname !== 'localhost') {
      return '/api/sse/health';
    }
    // In development, direct connection
    return 'http://localhost:8080/sse/health';
  }

  /**
   * Force an immediate connection check
   */
  async forceCheck(): Promise<boolean> {
    await this.checkConnection();
    return this.state.isConnected;
  }

  /**
   * Get current connection state
   */
  isBackendConnected(): boolean {
    return this.state.isConnected;
  }
}

export const connectionMonitor = new ConnectionMonitor();
