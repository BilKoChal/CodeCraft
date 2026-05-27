/**
 * CodeCraft — Application Entry Point
 *
 * Initializes React with HashRouter (for GitHub Pages compatibility),
 * registers the service worker for PWA/offline support.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/codecraft/sw.js').catch(() => {
      // Service worker registration failed — app still works without it
    });
  });
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
