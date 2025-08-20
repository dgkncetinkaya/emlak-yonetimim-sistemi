import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { backendAutostart } from './src/plugins/vite-backend-autostart'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    backendAutostart({
      enabled: process.env.NODE_ENV !== 'production',
      command: 'node',
      args: ['server/index.js'],
      healthCheckUrl: 'http://localhost:3001/api/health',
      healthCheckInterval: 5000,
      maxRetries: 3
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('🔄 Proxy error - Backend may be starting...', err.message);
          });
        }
      }
    }
  }
})
