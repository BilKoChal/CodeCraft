import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import './styles/editor.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Cannot mount CodeCraft.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
