import { useEffect, useState } from "react";

/**
 * Holds a value still for `delay` ms of quiet. Used to keep the preview from
 * re-rendering on every keystroke — it's a server round-trip through the mailer.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
