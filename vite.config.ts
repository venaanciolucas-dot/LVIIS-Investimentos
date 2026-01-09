
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Expondo apenas as chaves necessárias de forma segura
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY),
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000, // Aumenta o limite para o aviso de tamanho de chunk
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
});
