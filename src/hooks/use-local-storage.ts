import { useCallback, useEffect, useState } from "react";

/** useState that persists to localStorage. Falls back to memory when storage is unavailable. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);

  // Read after mount so server and client render the same initial value.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) setValue(JSON.parse(stored));
    } catch {
      // Private mode or corrupt data: keep the default.
    }
  }, [key]);

  const update = useCallback(
    (next: T | ((previous: T) => T)) => {
      setValue((previous) => {
        const resolved = next instanceof Function ? next(previous) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Storage full or blocked; the in-memory value still updates.
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update] as const;
}
