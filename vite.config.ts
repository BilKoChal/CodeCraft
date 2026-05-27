import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from .env files
  const env = loadEnv(mode, process.cwd(), '');

  return {
  // GitHub Pages base path — use repo name for project pages
  // Set GITHUB_PAGES=true in GitHub Actions env to activate
  base: env.GITHUB_PAGES ? '/codecraft/' : '/',

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
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        // Cache-first for static assets, precache app shell
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        runtimeCaching: [
          {
            // Language packages loaded at runtime
            urlPattern: /\/assets\/lang-.*\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'lang-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },

      devOptions: {
        enabled: false, // Don't enable service worker in dev
      },
    }),
  ],

  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,

    // Rollup options for code splitting
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

    // Asset optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    chunkSizeWarningLimit: 500,
  },

  // Dev server
  server: {
    port: 3000,
    open: true,
  },
  };
});
