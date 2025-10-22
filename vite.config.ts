import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5174
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // TypeScript hatalarını görmezden gel
        if (warning.code === 'TYPESCRIPT_ERROR') return;
        warn(warning);
      },
    },
  },
  esbuild: {
    // TypeScript kontrollerini devre dışı bırak
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})
