import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages base path — matches the repo name
  // https://BilKoChal.github.io/CodeCraft/
  base: '/CodeCraft/',

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],

      manifest: {
        name: 'CodeCraft — Browser Code Editor',
        short_name: 'CodeCraft',
        description:
          'Fast, zero-install, browser-based code editor for multi-file projects',
        theme_color: '#1e1e2e',
        background_color: '#1e1e2e',
        display: 'standalone',
        scope: '/CodeCraft/',
        start_url: '/CodeCraft/',
        icons: [
          {
            src: '/CodeCraft/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/CodeCraft/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/CodeCraft/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        runtimeCaching: [
          {
            urlPattern: /\/assets\/lang-.*\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'lang-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },

      devOptions: {
        enabled: false,
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,

    rollupOptions: {
      output: {
        manualChunks: {
          'codemirror-core': [
            '@codemirror/view',
            '@codemirror/state',
            '@codemirror/language',
          ],
          'codemirror-extensions': [
            '@codemirror/autocomplete',
            '@codemirror/commands',
            '@codemirror/search',
            '@codemirror/lint',
          ],
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },

    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    chunkSizeWarningLimit: 500,
  },

  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
