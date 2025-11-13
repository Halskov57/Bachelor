/**
 * Fetch with automatic retry logic for network errors
 */

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  onRetry?: (attempt: number, delay: number, error: Error) => void;
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
    onRetry
  } = retryOptions || {};

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
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
    
    // Don't retry if this was the last attempt
    if (attempt < maxAttempts - 1) {
      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
      
      console.log(`🔄 Fetch retry attempt ${attempt + 1}/${maxAttempts} in ${delay}ms...`);
      
      if (onRetry) {
        onRetry(attempt + 1, delay, lastError);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // All retries exhausted
  throw lastError || new Error('Fetch failed after retries');
}
