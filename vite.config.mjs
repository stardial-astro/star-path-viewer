// vite.config.mjs
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import babel from '@rolldown/plugin-babel';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';
import fs from 'fs';
import pkg from './package.json';

/* https://vitejs.dev/config/ */
export default defineConfig({
  define: {
    __APP_NAME__: JSON.stringify(pkg.name),
    __APP_DESCRIPTION__: JSON.stringify(pkg.description),
  },
  base: '/',
  plugins: [
    react(),
    svgr(), // Transform SVGs into React components
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      registerType: 'autoUpdate',
      disable: process.env.NODE_ENV === 'development',
      /* Assets to precache beyond what's in the build output */
      includeAssets: [
        'favicon.*',
        'fonts/*',
        'icons/*.png',
        'locales/**/*.json',
        'robots.txt',
      ],
      /* Move manifest.json content here */
      manifest: {
        short_name: 'Star Path Viewer',
        name: 'Star Path Viewer',
        description: pkg.description,
        scope: '/',
        id: '/',
        start_url: '/',
        display: 'standalone',
        theme_color: '#E5EEFA',
        background_color: '#E5EEFA',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true, // removes stale chunk caches automatically
        skipWaiting: true, // new SW activates immediately
        clientsClaim: true, // claims all open tabs/windows
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html}'], // skip images, fonts
      },

      // devOptions: {
      //   enabled: false, // flip to true when debugging SW behavior (leave this off during normal dev)
      //   type: 'module', // matches Vite's dev server module type
      // },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@context': resolve(__dirname, 'src/context'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
    },
  },
  server: {
    open: true,
    https:
      process.env.HTTPS === 'true'
        ? {
            key: fs.readFileSync('localhost-key.pem'),
            cert: fs.readFileSync('localhost.pem'),
          }
        : undefined,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    /* Configuration for chunk splitting */
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-core',
              test: /node_modules\/(react|react-dom|scheduler)/,
            },
            { name: 'vendor-mui', test: /node_modules\/@mui/ },
            { name: 'vendor-xlsx', test: /node_modules\/xlsx/ },
            { name: 'vendor-svg2pdf', test: /node_modules\/svg2pdf\.js/ },
            { name: 'vendor-canvg', test: /node_modules\/canvg/ },
            { name: 'vendor-html2canvas', test: /node_modules\/html2canvas/ },
            { name: 'vendor-jspdf', test: /node_modules\/jspdf/ },
            { name: 'vendor-file-saver', test: /node_modules\/file-saver/ },
            { name: 'vendor', test: /node_modules/ },
            // { name: 'components-io',   test: /\/src\/components\/(input|output)\// },
          ],
        },
      },
    },
  },
});
