import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API + uploads to the Render backend during development.
      '/api': { target: 'https://hr-management-system-bvfx.onrender.com', changeOrigin: true, secure: true },
      '/uploads': { target: 'https://hr-management-system-bvfx.onrender.com', changeOrigin: true, secure: true },
    },
  },
});
