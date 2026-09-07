import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

async function registerLinkUpServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.register('/sw.js');

  const notifyUpdate = () => {
    navigator.serviceWorker.controller?.postMessage({ type: 'LINKUP_UPDATE_READY' });
    window.dispatchEvent(new Event('linkup:update-ready'));
  };

  if (registration.waiting) notifyUpdate();

  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    if (!worker) return;
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) {
        notifyUpdate();
      }
    });
  });
}

window.addEventListener('load', () => {
  void registerLinkUpServiceWorker().catch(() => undefined);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
);
