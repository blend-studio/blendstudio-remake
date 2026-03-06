import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    watch: {
      usePolling: true,
      interval: 1000, // Aumentiamo l'intervallo di polling per risparmiare CPU
      ignored: ['**/node_modules/**', '**/dist/**', '**/public/**'],
    },
    host: true,
    strictPort: true,
    port: 5173,
    proxy: {
      '/mlflow-proxy': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mlflow-proxy/, ''),
      },
    },
  },
})
