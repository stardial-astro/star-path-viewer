// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Sets a timeout to debounce a value.
 * @param {*} value - The initial value.
 * @param {number} [delay=300] - Delay in milliseconds. Defaults to 300.
 * @returns {*} The debounced value. If `value` is a string, returns a trimmed one.
 */
const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (typeof value === 'string') {
        setDebouncedValue(value.trim());
      } else {
        setDebouncedValue(value);
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
