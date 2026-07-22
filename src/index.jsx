// src/index.jsx
import '@fontsource/roboto/100.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/400-italic.css';
import './index.css';
import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import { registerSW } from 'virtual:pwa-register';
import { i18nPromise } from '@lib/i18n';
import queryClient from '@lib/queryClient';
import { trackEvent } from '@utils/analytics';
import PwaUpdater from '@components/pwa/PwaUpdater';
import AppThemeProvider from '@components/providers/AppThemeProvider';
import App from './App';

/* Ensure i18n is ready before mounting */
await i18nPromise;

// registerSW({
//   immediate: true,
//   onNeedRefresh() {
//     window.location.reload();
//   },
// });

/* A dynamically-imported chunk failed to load (version skew after a deploy:
 * the hash no longer exists on the server). Reload once to pick up the fresh
 * index.html + new hashes. Guard against a reload loop if it keeps failing. */
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const KEY = 'chunk-reload-at';
  const last = Number(sessionStorage.getItem(KEY) || 0);
  if (Date.now() - last < 10000) return; // already reloaded very recently — give up
  sessionStorage.setItem(KEY, String(Date.now()));
  window.location.reload();
});

window.addEventListener('error', (event) => {
  /* Send event to GA4 */
  trackEvent('app_error', {
    error_type: 'uncaught_error',
    error_message: event.message,
    error_source: event.filename,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  /* Send event to GA4 */
  trackEvent('app_error', {
    error_type: 'unhandled_rejection',
    error_message: event.reason?.message ?? String(event.reason),
  });
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <BrowserRouter basename="/">
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={null}>
          <AppThemeProvider>
            <App />
            <PwaUpdater />
          </AppThemeProvider>
        </Suspense>
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
