// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - Debounce Utility
// Prevent rapid button presses and form submissions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a debounced function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms (default 300)
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

/**
 * Create a throttled function (limits calls to once per interval)
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in ms
 */
export const throttle = (func, limit = 1000) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Hook for preventing double-tap on buttons
 * Returns [isDisabled, wrappedHandler]
 */
import { useState, useCallback, useRef } from 'react';

export const useDebounce = (callback, delay = 1000) => {
  const [isDisabled, setIsDisabled] = useState(false);
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback(
    async (...args) => {
      if (isDisabled) return;

      setIsDisabled(true);
      
      try {
        await callback(...args);
      } finally {
        // Re-enable after delay
        timeoutRef.current = setTimeout(() => {
          setIsDisabled(false);
        }, delay);
      }
    },
    [callback, delay, isDisabled]
  );

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return [isDisabled, debouncedCallback, cleanup];
};

/**
 * Simple debounced value hook for search inputs
 */
export const useDebouncedValue = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default { debounce, throttle, useDebounce, useDebouncedValue };
