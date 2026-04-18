// src/hooks/useAnalytics.js
import { useEffect } from 'react';
import { useLocation } from 'react-router';

const GA_ID = import.meta.env.VITE_GA_ID;
const gtagUrl = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
const isPreview = import.meta.env.VITE_IS_PREVIEW === 'true';
/** Wether to enable GA4 (`true` if GA ID is provided and not in dev mode). */
const shouldTrack = !!GA_ID && !import.meta.env.DEV && !import.meta.env.VITEST;

const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (!shouldTrack) return;

    /* Initialization (singleton) */
    if (!window.gtag) {
      const script = document.createElement('script');
      script.src = gtagUrl;
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());

      window.gtag('config', GA_ID, {
        /* Disable Google signal to prevent the collection of advertising profiles based on gender, age, etc. */
        allow_google_signals: false,
        /* Disable personalized ads */
        allow_ad_personalization_signals: false,
        /* For Preview branch, enable debug mode */
        debug_mode: isPreview,
        page_location: window.location.href,
        app_env: isPreview ? 'preview' : 'production',
        /* Disable automatic sending on init - will be done manually from below */
        send_page_view: false,
      });
    }

    /* Listen for rout changes and send page_view */
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_title: document.title,
      app_env: isPreview ? 'preview' : 'production',
    });
  }, [location]);
};

export default useAnalytics;
