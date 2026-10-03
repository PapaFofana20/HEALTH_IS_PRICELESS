import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Le .env reste à la racine du projet (par défaut Vite le chercherait dans root/).
  envDir: '..',
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
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Pré-bundle les dépendances lourdes au démarrage. Sans cela, le premier
  // chargement de /#/admin ou /#/dashboard déclenche l'optimisation de
  // recharts pendant l'exécution : Vite invalide le graphe de modules et les
  // requêtes concurrentes de ces pages restent bloquées sur le fallback
  // Suspense (vu sous forme de tests qui passent seuls et échouent en parallèle).
  optimizeDeps: {
    include: ['recharts', 'react-router-dom', '@supabase/supabase-js'],
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