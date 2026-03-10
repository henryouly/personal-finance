import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import devServer from '@hono/vite-dev-server';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    devServer({
      entry: 'src/server/index.ts',
      exclude: [/^\/(assets|src|public)\/.+/, /^\/@.+/, /^\/node_modules\/.+/, /^\/$/],
      injectClientScript: true,
    }),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
