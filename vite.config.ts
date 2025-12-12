import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente baseadas no modo (development/production)
  // O terceiro argumento '' garante que carregue todas, inclusive as do sistema (Vercel)
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Isso permite que seu código continue usando process.env.API_KEY
      // mesmo num ambiente de navegador/Vite
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Polyfill básico para evitar erros com outras libs que buscam process.env
      'process.env': {}
    },
    build: {
      outDir: 'dist',
    }
  };
});