import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // When VITE_API_MODE=api and VITE_API_URL is left empty, the client
      // hits /api/... which gets proxied to the local backend in dev.
      '/api': {
        target: 'http://localhost:1337',
        changeOrigin: true
      }
    }
  }
});
