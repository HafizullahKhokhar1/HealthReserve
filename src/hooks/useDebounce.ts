import { useState, useEffect } from 'react';

/**
 * Hook to debounce a value with a configurable delay
 * Prevents excessive re-renders when typing in search inputs
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timer
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    // Cleanup timer on value change or unmount
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
