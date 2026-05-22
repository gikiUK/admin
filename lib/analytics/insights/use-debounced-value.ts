"use client";

import { useEffect, useState } from "react";

/**
 * Returns a value that lags behind `value` by `delay` ms. Use this to throttle
 * how often query inputs change without slowing the UI controls themselves.
 *
 * Re-runs on every render of the parent; the timer is cleared on each change so
 * fast successive updates collapse into one debounced flush.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
