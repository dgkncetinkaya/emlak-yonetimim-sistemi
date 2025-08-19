import { useAuth } from '../context/AuthContext';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: any) => boolean;
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Circuit Breaker implementation
class CircuitBreaker {
  private state: CircuitBreakerState = {
    failures: 0,
    lastFailureTime: 0,
    state: 'CLOSED'
  };
  
  private readonly failureThreshold = 5;
  private readonly recoveryTimeout = 30000; // 30 seconds
  private readonly halfOpenMaxCalls = 3;
  private halfOpenCalls = 0;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state.state === 'OPEN') {
      if (Date.now() - this.state.lastFailureTime > this.recoveryTimeout) {
        this.state.state = 'HALF_OPEN';
        this.halfOpenCalls = 0;
        console.log('🔄 Circuit breaker moving to HALF_OPEN state');
      } else {
        throw new ApiError('Circuit breaker is OPEN - service temporarily unavailable', 503, 'CIRCUIT_BREAKER_OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.state.failures = 0;
    if (this.state.state === 'HALF_OPEN') {
      this.state.state = 'CLOSED';
      console.log('✅ Circuit breaker recovered - moving to CLOSED state');
    }
  }

  private onFailure(): void {
    this.state.failures++;
    this.state.lastFailureTime = Date.now();

    if (this.state.state === 'HALF_OPEN') {
      this.state.state = 'OPEN';
      console.log('❌ Circuit breaker failed in HALF_OPEN - moving back to OPEN state');
    } else if (this.state.failures >= this.failureThreshold) {
      this.state.state = 'OPEN';
      console.log(`❌ Circuit breaker OPENED after ${this.state.failures} failures`);
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }
}

const circuitBreaker = new CircuitBreaker();

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

const defaultRetryCondition = (error: any): boolean => {
  // Retry on network errors, 5xx errors, or circuit breaker errors
  if (error instanceof ApiError) {
    return error.status ? error.status >= 500 : true;
  }
  return error.name === 'TypeError' || error.message.includes('fetch');
};

export const apiFetchWithRetry = async (
  url: string, 
  options: RequestInit = {}, 
  token?: string,
  retryOptions: RetryOptions = {}
): Promise<any> => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 2,
    retryCondition = defaultRetryCondition
  } = retryOptions;

  const executeRequest = async (): Promise<any> => {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const res = await fetch(url, { 
        ...options, 
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!res.ok) {
        let errorData: any = {};
        try {
          errorData = await res.json();
        } catch {
          // If response is not JSON, use status text
          errorData = { message: res.statusText };
        }
        
        throw new ApiError(
          errorData.message || `HTTP ${res.status}: ${res.statusText}`,
          res.status,
          errorData.code,
          errorData
        );
      }
      
      return res.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'TIMEOUT');
      }
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other fetch errors
      throw new ApiError(
        error.message || 'Network error occurred',
        undefined,
        'NETWORK_ERROR',
        error
      );
    }
  };

  // Execute with circuit breaker and retry logic
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await circuitBreaker.execute(executeRequest);
      
      if (attempt > 0) {
        console.log(`✅ Request succeeded on attempt ${attempt + 1}`);
      }
      
      return result;
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if circuit breaker is open
      if (error.code === 'CIRCUIT_BREAKER_OPEN') {
        throw error;
      }
      
      // Don't retry if condition is not met or max retries reached
      if (!retryCondition(error) || attempt === maxRetries) {
        break;
      }
      
      const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
      console.log(`⚠️  Request failed (attempt ${attempt + 1}/${maxRetries + 1}): ${error.message}`);
      console.log(`🔄 Retrying in ${delay}ms...`);
      
      await sleep(delay);
    }
  }
  
  console.error(`❌ Request failed after ${maxRetries + 1} attempts:`, lastError);
  throw lastError;
};

// Backward compatibility
export const apiFetch = apiFetchWithRetry;

export const useAuthApi = () => {
  const { user } = useAuth();
  const token = user?.token;
  
  const createMethod = (method: string) => {
    return async (url: string, body?: any, retryOptions?: RetryOptions) => {
      const options: RequestInit = { method };
      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }
      return apiFetchWithRetry(url, options, token, retryOptions);
    };
  };
  
  return {
    get: createMethod('GET'),
    post: createMethod('POST'),
    put: createMethod('PUT'),
    del: createMethod('DELETE'),
    
    // Utility methods
    getCircuitBreakerState: () => circuitBreaker.getState(),
    
    // Health check method
    healthCheck: async (): Promise<boolean> => {
      try {
        await apiFetchWithRetry('/api/health', { method: 'GET' }, token, {
          maxRetries: 1,
          retryDelay: 500
        });
        return true;
      } catch {
        return false;
      }
    }
  };
};

export { ApiError, CircuitBreaker };
export type { RetryOptions, CircuitBreakerState };