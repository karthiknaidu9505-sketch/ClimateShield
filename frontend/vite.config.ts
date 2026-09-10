import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // SPA mode: serve index.html for all routes so refresh works on /dashboard, /risk-map etc.
  appType: 'spa',
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => console.error('[proxy error]', err));
        }
      }
    }
  }
});
