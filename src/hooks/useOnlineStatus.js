// src/hooks/useOnlineStatus.js
import { useEffect, useState } from 'react';

/**
 * Tracks online/offline status.
 * Reference: https://github.com/rajatrawal/check-online-offline
 * @param {ReactSetState<boolean>} setIsDelayedOnline
 * @param {number} [delay=3_000] - Delay in milliseconds. Defaults to 3 seconds.
 * @returns {boolean} `true` if online.
 */
const useOnlineStatus = (setIsDelayedOnline, delay = 3_000) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    /** @type {number} */
    let timeoutId;

    const handleOnline = () => {
      timeoutId = setTimeout(() => {
        setIsDelayedOnline(true);
      }, delay);
      setIsOnline(true);
    };
    const handleOffline = () => {
      clearTimeout(timeoutId);
      setIsDelayedOnline(false); // immediate
      setIsOnline(false);
    };

    /* Add event listeners for online and offline events */
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    /* Remove event listeners when the component unmounts */
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [delay, setIsDelayedOnline]);

  return isOnline;
};

export default useOnlineStatus;
