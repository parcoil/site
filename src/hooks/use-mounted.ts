import { useEffect, useState } from "react";

/**
 * False during server rendering and the first client render. Use it to hold
 * back output that depends on the visitor's clock, locale or time zone, which
 * would otherwise cause hydration mismatches.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
