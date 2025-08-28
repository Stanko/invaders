import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 1234,
    host: true,
    allowedHosts: true,
  },
  build: {
    outDir: './docs',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: './index.html',
        iframe: './iframe.html',
      },
    },
  },
  base: '/invaders/',
});
