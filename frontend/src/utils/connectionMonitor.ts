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
  
  private readonly CHECK_INTERVAL = 30000; // Check every 30 seconds
  private readonly HEALTH_CHECK_ENDPOINT = '/actuator/health';

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
    
    // Set up periodic checks
    this.state.checkIntervalId = setInterval(() => {
      this.checkConnection();
    }, this.CHECK_INTERVAL);
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

      if (response.ok) {
        this.handleConnectionRestored();
      } else {
        this.handleConnectionLost();
      }
    } catch (error) {
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
      
      // Trigger a custom event that components can listen to
      window.dispatchEvent(new CustomEvent('backend-reconnected'));
    }
  }

  /**
   * Handle when connection is lost
   */
  private handleConnectionLost(): void {
    if (this.state.isConnected) {
      console.log('❌ Backend connection lost');
      this.state.isConnected = false;
      
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
      return '/api/actuator/health';
    }
    // In development, direct connection
    return 'http://localhost:8080/actuator/health';
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
