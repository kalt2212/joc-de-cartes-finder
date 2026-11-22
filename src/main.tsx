import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register the service worker only where it is meant to run (not on local dev servers), scoped to the GitHub Pages base path.
if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/joc-de-cartes-finder/sw.js', { scope: '/joc-de-cartes-finder/' }).catch(() => {
      // Offline caching is an enhancement; the app works without it.
    });
  });
}
