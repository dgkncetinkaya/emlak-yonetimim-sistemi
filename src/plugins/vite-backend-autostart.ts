import type { Plugin } from 'vite';
import { spawn, ChildProcess } from 'child_process';

interface BackendAutostartOptions {
  command?: string;
  args?: string[];
  cwd?: string;
  healthCheckUrl?: string;
  healthCheckInterval?: number;
  maxRetries?: number;
  enabled?: boolean;
}

const defaultOptions: Required<BackendAutostartOptions> = {
  command: 'node',
  args: ['server/index.js'],
  cwd: process.cwd(),
  healthCheckUrl: 'http://localhost:3001/api/health',
  healthCheckInterval: 2000,
  maxRetries: 10,
  enabled: process.env.NODE_ENV !== 'production'
};

let backendProcess: ChildProcess | null = null;
let healthCheckTimer: NodeJS.Timeout | null = null;

const checkBackendHealth = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    return response.ok;
  } catch {
    return false;
  }
};

const startBackend = (options: Required<BackendAutostartOptions>): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting backend server...');
    
    backendProcess = spawn(options.command, options.args, {
      cwd: options.cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32'
    });

    backendProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      console.log(`[Backend] ${output.trim()}`);
      
      // Check if server started successfully
      if (output.includes('Server running on port') || output.includes('🚀')) {
        console.log('✅ Backend server started successfully');
        resolve();
      }
    });

    backendProcess.stderr?.on('data', (data) => {
      console.error(`[Backend Error] ${data.toString().trim()}`);
    });

    backendProcess.on('error', (error) => {
      console.error('❌ Failed to start backend:', error);
      reject(error);
    });

    backendProcess.on('exit', (code, signal) => {
      if (code !== 0 && code !== null) {
        console.error(`❌ Backend process exited with code ${code}`);
        reject(new Error(`Backend process exited with code ${code}`));
      } else if (signal) {
        console.log(`🛑 Backend process terminated by signal ${signal}`);
      }
      backendProcess = null;
    });

    // Timeout fallback
    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        console.log('⏰ Backend startup timeout, assuming success');
        resolve();
      }
    }, 5000);
  });
};

const stopBackend = (): void => {
  if (backendProcess && !backendProcess.killed) {
    console.log('🛑 Stopping backend server...');
    
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', backendProcess.pid!.toString(), '/f', '/t']);
    } else {
      backendProcess.kill('SIGTERM');
    }
    
    backendProcess = null;
  }
  
  if (healthCheckTimer) {
    clearInterval(healthCheckTimer);
    healthCheckTimer = null;
  }
};

const startHealthCheck = (options: Required<BackendAutostartOptions>): void => {
  let retryCount = 0;
  
  healthCheckTimer = setInterval(async () => {
    const isHealthy = await checkBackendHealth(options.healthCheckUrl);
    
    if (!isHealthy) {
      retryCount++;
      console.log(`⚠️  Backend health check failed (${retryCount}/${options.maxRetries})`);
      
      if (retryCount >= options.maxRetries) {
        console.log('🔄 Restarting backend due to health check failures...');
        stopBackend();
        
        setTimeout(async () => {
          try {
            await startBackend(options);
            retryCount = 0;
            startHealthCheck(options);
          } catch (error) {
            console.error('❌ Failed to restart backend:', error);
          }
        }, 2000);
        
        return;
      }
    } else {
      if (retryCount > 0) {
        console.log('✅ Backend health restored');
        retryCount = 0;
      }
    }
  }, options.healthCheckInterval);
};

export const backendAutostart = (userOptions: BackendAutostartOptions = {}): Plugin => {
  const options = { ...defaultOptions, ...userOptions };
  
  return {
    name: 'backend-autostart',
    
    async buildStart() {
      if (!options.enabled) {
        console.log('🔇 Backend autostart disabled');
        return;
      }
      
      // Check if backend is already running
      const isAlreadyRunning = await checkBackendHealth(options.healthCheckUrl);
      
      if (isAlreadyRunning) {
        console.log('✅ Backend is already running');
        startHealthCheck(options);
        return;
      }
      
      try {
        await startBackend(options);
        
        // Wait a bit for server to fully start
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Start health monitoring
        startHealthCheck(options);
        
      } catch (error) {
        console.error('❌ Failed to start backend automatically:', error);
        console.log('💡 You may need to start the backend manually with: npm run server');
      }
    },
    
    buildEnd() {
      // Keep backend running during development
    },
    
    closeBundle() {
      // Stop backend when Vite closes (production build)
      if (process.env.NODE_ENV === 'production') {
        stopBackend();
      }
    }
  };
};

export default backendAutostart;