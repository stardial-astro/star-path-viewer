// src/hooks/useQueryOnlineManager.js
import { useEffect } from 'react';
import { onlineManager } from '@tanstack/react-query';

/**
 * Makes resumed query delayed on reconnect.
 * @param {number} [delay=1_000] - Delay in milliseconds. Defaults to 1 second.
 */
const useQueryOnlineManager = (delay = 1_000) => {
  useEffect(() => {
    /** @type {number} */
    let timeoutId;

    const handleOnline = () => {
      timeoutId = setTimeout(() => {
        onlineManager.setOnline(true);
      }, delay);
    };

    const handleOffline = () => {
      clearTimeout(timeoutId);
      onlineManager.setOnline(false); // immediate
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [delay]);
};

export default useQueryOnlineManager;
