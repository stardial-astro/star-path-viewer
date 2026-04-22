// src/hooks/useAnalytics.js
import { useEffect } from 'react';
import { useLocation } from 'react-router';

const GA_ID = import.meta.env.VITE_GA_ID;
const gtagUrl = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
const isPreview = import.meta.env.VITE_IS_PREVIEW === 'true';
/** Whether to enable GA4 (`true` if GA ID is provided and not in dev mode). */
const shouldTrack =
  !!GA_ID &&
  !import.meta.env.DEV &&
  !import.meta.env.VITEST &&
  import.meta.env.MODE === 'production';

const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (!shouldTrack) {
      console.debug('------ GA4 Disabled ------');
      return;
    }

    /* Initialization (singleton) */
    if (!window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());

      const script = document.createElement('script');
      script.src = gtagUrl;
      script.async = true;
      document.head.appendChild(script);

      window.gtag('config', GA_ID, {
        /* Disable Google signal to prevent the collection of advertising profiles based on gender, age, etc. */
        allow_google_signals: false,
        /* Disable personalized ads */
        allow_ad_personalization_signals: false,
        /* For Preview branch, enable debug mode (omit the field entirely when false) */
        ...(isPreview && { debug_mode: true }),
        /* Set app_env as a default for all subsequent events */
        app_env: isPreview ? 'preview' : 'production',
        /* Disable automatic sending on init - will be done manually below */
        send_page_view: false,
      });
    }

    /* Listen for route changes and send page_view
     * Deferred by one tick so document.title is updated before we read it
     */
    const timer = setTimeout(() => {
      window.gtag('event', 'page_view', {
        page_location: window.location.href,
        page_title: document.title,
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [location]);
};

export default useAnalytics;
