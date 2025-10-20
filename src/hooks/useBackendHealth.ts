import { useState, useEffect, useCallback } from 'react';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'checking';
  timestamp?: string;
  uptime?: number;
  environment?: string;
  version?: string;
  services?: {
    database: string;
    api: string;
  };
}

interface UseBackendHealthReturn {
  healthStatus: HealthStatus;
  isHealthy: boolean;
  isChecking: boolean;
  checkHealth: () => Promise<void>;
  lastChecked: Date | null;
}

const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const RETRY_INTERVAL = 5000; // 5 seconds for retries
const MAX_RETRIES = 1;

export const useBackendHealth = (): UseBackendHealthReturn => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    status: 'checking'
  });
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkHealth = useCallback(async (): Promise<void> => {
    try {
      setHealthStatus(prev => ({ ...prev, status: 'checking' }));
      
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Timeout after 5 seconds
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const healthData = await response.json();
        setHealthStatus({
          status: 'healthy',
          ...healthData
        });
        setRetryCount(0);
        setLastChecked(new Date());
        console.log('✅ Backend health check passed:', healthData);
      } else {
        throw new Error(`Health check failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      
      setHealthStatus({
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      });
      
      // Retry logic
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        console.log(`🔄 Retrying health check (${retryCount + 1}/${MAX_RETRIES}) in ${RETRY_INTERVAL/1000}s...`);
        setTimeout(checkHealth, RETRY_INTERVAL);
      } else {
        console.error('❌ Max retries reached. Backend appears to be down.');
        setRetryCount(0);
      }
      
      setLastChecked(new Date());
    }
  }, [retryCount]);

  // Initial health check and periodic checks
  useEffect(() => {
    // Initial check
    checkHealth();

    // Set up periodic health checks
    const interval = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [checkHealth]);

  // Auto-retry when backend becomes available
  useEffect(() => {
    if (healthStatus.status === 'unhealthy' && retryCount === 0) {
      const retryTimeout = setTimeout(() => {
        console.log('🔄 Auto-retrying health check...');
        checkHealth();
      }, RETRY_INTERVAL);

      return () => clearTimeout(retryTimeout);
    }
  }, [healthStatus.status, retryCount, checkHealth]);

  return {
    healthStatus,
    isHealthy: healthStatus.status === 'healthy',
    isChecking: healthStatus.status === 'checking',
    checkHealth,
    lastChecked
  };
};

export default useBackendHealth;