import { useEffect, useState } from "react";

/**
 * True only after `value` has stayed true for `delayMs`. Used to suppress
 * loading affordances that would otherwise flash on near-instant work.
 */
export function useDelayedFlag(value: boolean, delayMs: number) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!value) {
      setActive(false);
      return;
    }
    const timer = setTimeout(() => setActive(true), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return active;
}
