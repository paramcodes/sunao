import { useEffect, useState } from "react";

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
