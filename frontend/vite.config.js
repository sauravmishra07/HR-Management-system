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
      // Proxy API + uploads to the local backend during development (plain HTTP).
      '/api': { target: 'https://hrmsapi.itsybizz.com', changeOrigin: true },
      '/uploads': { target: 'https://hrmsapi.itsybizz.com', changeOrigin: true },
    },
  },
});
