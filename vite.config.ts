import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: 'frontend',
  // Le .env reste à la racine du projet (par défaut Vite le chercherait dans root/).
  envDir: __dirname,
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-data': ['@supabase/supabase-js'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './frontend/src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
