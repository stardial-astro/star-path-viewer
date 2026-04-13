// src/hooks/useThrottledScroll.js
import { useState, useEffect, useRef } from 'react';

/**
 * Throttles a scroll using `requestAnimationFrame`.
 * @param {number} [threshold=100] - The threshold of pixels to trigger the scroll.
 *                                 Defaults to 100.
 */
const useThrottledScroll = (threshold = 100) => {
  const [trigger, setTrigger] = useState(false);
  /** @type {ReactRef<number | null>} */
  const rafIdRef = useRef(null);

  /* Only read the layout once every few frames */
  useEffect(() => {
    const handleScroll = () => {
      /* If a frame is already scheduled, skip */
      if (rafIdRef.current) return;

      /* Schedule the update */
      rafIdRef.current = requestAnimationFrame(() => {
        const currentScrollY =
          window.pageYOffset || document.documentElement.scrollTop;
        /* Update state and ref */
        setTrigger(currentScrollY > threshold);
        rafIdRef.current = null;
      });
    };

    /* passive: true - Tells the browser not to call preventDefault(),
       allowing it to scroll the page instantly without waiting for the JS */
    window.addEventListener('scroll', handleScroll, { passive: true });

    /* Initial check */
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      /* Cancel any pending frame and reset rafIdRef */
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [threshold]);

  return trigger;
};

export default useThrottledScroll;
