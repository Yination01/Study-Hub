import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Register service worker for PWA install + offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // always check for SW updates
      });

      // When a new SW is waiting, activate it immediately
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available — skip waiting silently
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });

      console.log('StudyHub SW registered:', reg.scope);
    } catch (err) {
      console.warn('SW registration failed:', err);
    }
  });

  // Reload page when new SW takes control (seamless update)
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
