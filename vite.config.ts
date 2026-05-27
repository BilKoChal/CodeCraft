import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // Base path for GitHub Pages deployment
  // Use '/codecraft/' for github.io subdirectory, '/' for custom domain
  base: '/codecraft/',

  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      workbox: {
        // Cache static assets with cache-first strategy
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Allow caching of larger WASM files (up to 20 MB for Pyodide)
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
        // Runtime caching for dynamically loaded chunks
        runtimeCaching: [
          {
            // Cache WASM files (Pyodide, etc.) with stale-while-revalidate
            urlPattern: /\.wasm$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'wasm-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Cache language mode chunks with cache-first
            urlPattern: /\/assets\/lang-.*\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'lang-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
      manifest: {
        name: 'CodeCraft — Lightweight Code Editor',
        short_name: 'CodeCraft',
        description:
          'A lightweight, browser-based code editor with multi-file projects, syntax highlighting, and code execution.',
        theme_color: '#f0a500',
        background_color: '#1a1a2e',
        display: 'standalone',
        start_url: '/codecraft/',
        icons: [
          {
            src: '/codecraft/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      // Path aliases for clean imports
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@services': path.resolve(__dirname, './src/services'),
      '@themes': path.resolve(__dirname, './src/themes'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@workers': path.resolve(__dirname, './src/workers'),
      '@execution': path.resolve(__dirname, './src/execution'),
    },
  },

  build: {
    // Target modern browsers for smaller bundles
    target: 'esnext',
    // Disable sourcemaps in production for smaller output
    sourcemap: false,
    // Terser minification with console/debugger removal
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true },
    },
    // Manual chunk splitting for optimal loading performance
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // React core — loaded immediately
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'react-vendor';
          }
          // CodeMirror core — loaded immediately on editor mount
          if (id.includes('node_modules/codemirror/') || id.includes('node_modules/@codemirror/state/') || id.includes('node_modules/@codemirror/view/')) {
            return 'codemirror-core';
          }
          // CodeMirror extensions — loaded with editor
          if (id.includes('node_modules/@codemirror/language/') || id.includes('node_modules/@codemirror/autocomplete/') || id.includes('node_modules/@codemirror/search/') || id.includes('node_modules/@codemirror/lint/')) {
            return 'codemirror-extensions';
          }
          // Storage — lazy loaded on first project access
          if (id.includes('node_modules/dexie/') || id.includes('node_modules/jszip/')) {
            return 'storage';
          }
          // State management — included in app shell
          if (id.includes('node_modules/zustand/')) {
            return 'state';
          }
          // Drag and drop — lazy loaded
          if (id.includes('node_modules/@dnd-kit/')) {
            return 'dnd-kit';
          }
        },
      },
    },
  },

  optimizeDeps: {
    // Pre-bundle these for faster dev server
    include: ['react', 'react-dom', 'zustand', 'codemirror'],
  },
});
