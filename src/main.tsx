import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Registro del service worker solo fuera de desarrollo local. Base path del despliegue en GitHub Pages.
const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
if ('serviceWorker' in navigator && !isLocalDev) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/joc-de-cartes-finder/sw.js').catch(() => {
      // Sin SW la app sigue funcionando online.
    });
  });
}
