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
  private readonly CHECK_INTERVAL_DISCONNECTED = 30000; // Check every 5 seconds when disconnected
  private readonly HEALTH_CHECK_ENDPOINT = '/sse/health';

  /**
   * Start monitoring backend connection
   */
  startMonitoring(): void {
    if (this.state.checkIntervalId) {
      return;
    }
    
    this.checkConnection();
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
      const response = await fetch(this.getHealthUrl(), {
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok || response.status < 500) {
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
      client.resetStore().catch((error) => {
        client.clearStore().catch(() => {});
      });
      
      this.state.isConnected = true;
      this.scheduleNextCheck();
      window.dispatchEvent(new CustomEvent('backend-reconnected'));
    }
  }

  /**
   * Handle when connection is lost
   */
  private handleConnectionLost(): void {
    if (this.state.isConnected) {
      this.state.isConnected = false;
      this.scheduleNextCheck();
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
