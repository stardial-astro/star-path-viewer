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
  build: {
    /* Configuration for chunk splitting */
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/')) {
            if (id.includes("@mui")) {
              return "vendor-mui";
            } else if (id.includes("canvas")) {
              return "vendor-canvas";
            } else if (id.includes("xlsx")) {
              return "vendor-xlsx";
            } else if (id.includes("html2canvas")) {
              return "vendor-html2canvas";
            } else if (id.includes("svg2pdf.js")) {
              return "vendor-svg2pdf.js";
            } else if (id.includes("canvg")) {
              return "vendor-canvg";
            } else if (id.includes("jspdf")) {
              return "vendor-jspdf";
            } else if (id.includes("file-saver")) {
              return "vendor-file-saver";
            }
            return 'vendor';
          }
          
          // const heavyDirs = ['Input', 'Output'];
          // for (const dir of heavyDirs) {
          //   /* Subdirectories in each dir */
          //   const subMatch = id.match(new RegExp(`/components/${dir}/([^/]+)/`));
          //   if (subMatch) {
          //     return `component_${dir.toLowerCase()}_${subMatch[1].toLowerCase()}`;
          //   }
          //   /* Root files in each dir */
          //   if (id.match(new RegExp(`/components/${dir}/[^/]+\\.(jsx?|tsx?)$`))) {
          //     return `component_${dir.toLowerCase()}_root`;
          //   }
          // }

          const matchComponent = id.match(/\/components\/([^/]+)\//);
          if (matchComponent) {
            const [, folder, subFolder] = matchComponent;
            return `component_${folder.toLowerCase()}_${subFolder ? subFolder.toLowerCase() : 'core'}`;
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
