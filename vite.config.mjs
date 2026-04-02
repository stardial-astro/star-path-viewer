// vite.config.mjs
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import babel from '@rolldown/plugin-babel';
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
            // { name: 'components-io',   test: /\/src\/components\/(Input|Output)\// },
          ],
        },
      },
    },
  },
});
