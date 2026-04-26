// vitest.config.mjs
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import pkg from './package.json';

export default defineConfig({
  define: {
    __APP_NAME__: JSON.stringify(pkg.name),
    __APP_DESCRIPTION__: JSON.stringify(pkg.description),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@components': resolve(__dirname, 'src/components'),
      '@context': resolve(__dirname, 'src/context'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@lib': resolve(__dirname, 'src/lib'),
      '@pwa': resolve(__dirname, 'src/pwa'),
      '@types': resolve(__dirname, 'src/types'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
  },
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
    },
    reporters: ['verbose'],
  },
});
