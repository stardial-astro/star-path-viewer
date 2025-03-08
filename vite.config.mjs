// vite.config.mjs
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { resolve } from 'path';
import fs from 'fs';

/* https://vitejs.dev/config/ */
export default defineConfig({
  plugins: [
    react(),
    svgr()  // Transform SVGs into React components
  ],
  base: '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@context': resolve(__dirname, 'src/context'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@utils': resolve(__dirname, 'src/utils')
    }
  },
  server: {
    open: true,
    https: process.env.HTTPS === 'true' ? {
      key: fs.readFileSync('localhost-key.pem'),
      cert: fs.readFileSync('localhost.pem'),
    } : undefined
  },
  /* Handle environment variables for compatibility */
  define: {
    'process.env': process.env
  },
  build: {
    /* Configuration for chunk splitting */
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          const heavyDirs = ['Input', 'Output'];
          for (const dir of heavyDirs) {
            /* Subdirectories in each dir */
            const subMatch = id.match(new RegExp(`/components/${dir}/([^/]+)/`));
            if (subMatch) {
              return `component-${dir.toLowerCase()}-${subMatch[1].toLowerCase()}`;
            }
            /* Root files in each dir */
            if (id.match(new RegExp(`/components/${dir}/[^/]+\\.(jsx?|tsx?)$`))) {
              return `component-${dir.toLowerCase()}-root`;;
            }
          }
        }
      }
    }
  },
  /* Configuration for testing */
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js'
  }
});
