/**
 * Fetch with automatic retry logic for network errors
 */

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  onRetry?: (attempt: number, delay: number, error: Error) => void;
  persistentRetry?: boolean; // If true, after maxAttempts, continues retrying every maxDelay forever
}

export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryOptions?: RetryOptions
): Promise<Response> {
  const {
    maxAttempts = 10,
    initialDelay = 1000,
    maxDelay = 30000,
    onRetry,
    persistentRetry = false
  } = retryOptions || {};

  let lastError: Error | null = null;
  let attempt = 0;
  
  // Use while(true) for persistent retry, otherwise for loop with maxAttempts
  while (persistentRetry ? true : attempt < maxAttempts) {
    try {
      const response = await fetch(url, options);
      
      // Return successful responses immediately
      if (response.ok) {
        return response;
      }
      
      // Gateway errors (502, 503, 504) - backend is restarting or proxy is stale
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        lastError = new Error(`Gateway error ${response.status}: Backend restarting or proxy issue`);
        console.log(`⚠️ Gateway error detected: ${response.status} - will retry`);
      }
      // Other 5xx server errors - also retriable
      else if (response.status >= 500) {
        lastError = new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      // 4xx client errors (400, 401, 403, 404) - NOT retriable, return immediately
      else {
        return response;
      }
      
    } catch (error) {
      // Network error (connection refused, timeout, DNS failure, etc.)
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`⚠️ Network error:`, error instanceof Error ? error.message : error);
    }
    
    // For gateway errors, use shorter delays to break through proxy cache faster
    let delay;
    if (lastError?.message.includes('Gateway error')) {
      // For gateway errors: try every 5 seconds to break through Railway proxy cache
      delay = 5000;
      console.log(`🔄 Gateway error retry in ${delay}ms (attempt ${attempt + 1})`);
    } else if (attempt < maxAttempts) {
      // Normal exponential backoff for other errors
      delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
    } else {
      // After max attempts, use constant max delay
      delay = maxDelay;
    }
    
    const retryMessage = persistentRetry && attempt >= maxAttempts
      ? `🔄 Persistent retry attempt ${attempt + 1} in ${delay}ms...`
      : `🔄 Fetch retry attempt ${attempt + 1}/${maxAttempts} in ${delay}ms...`;
    
    if (!lastError?.message.includes('Gateway error')) {
      console.log(retryMessage);
    }
    
    if (onRetry) {
      onRetry(attempt + 1, delay, lastError);
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    attempt++;
  }
  
  // All retries exhausted (only reached if persistentRetry is false)
  throw lastError || new Error('Fetch failed after retries');
}
