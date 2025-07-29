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
  },
  base: '/invaders/',
});
