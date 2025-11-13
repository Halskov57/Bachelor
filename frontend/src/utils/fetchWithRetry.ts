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
      
      // If we get a response (even error codes like 400, 401, 403, 404), return it
      // Only retry on network failures or 5xx server errors
      if (response.ok || response.status < 500) {
        return response;
      }
      
      // 5xx server error - treat as retriable
      lastError = new Error(`Server error: ${response.status} ${response.statusText}`);
      
    } catch (error) {
      // Network error (connection refused, timeout, etc.)
      lastError = error instanceof Error ? error : new Error(String(error));
    }
    
    // Calculate delay with exponential backoff for initial attempts
    // After maxAttempts, use constant maxDelay
    const delay = attempt < maxAttempts 
      ? Math.min(initialDelay * Math.pow(2, attempt), maxDelay)
      : maxDelay;
    
    const retryMessage = persistentRetry && attempt >= maxAttempts
      ? `🔄 Persistent retry attempt ${attempt + 1} in ${delay}ms...`
      : `🔄 Fetch retry attempt ${attempt + 1}/${maxAttempts} in ${delay}ms...`;
    
    console.log(retryMessage);
    
    if (onRetry) {
      onRetry(attempt + 1, delay, lastError);
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    attempt++;
  }
  
  // All retries exhausted (only reached if persistentRetry is false)
  throw lastError || new Error('Fetch failed after retries');
}
