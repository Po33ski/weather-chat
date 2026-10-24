import { useEffect, useState } from "react";

type Updater = (prev: string | null) => unknown;

function readStorage(key: string, defaultValue: string | null): string | null {
  if (typeof window === "undefined") return defaultValue;
  try {
    const value: string | null = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.warn(`useLocalStorage: ignoring unreadable value for "${key}"`, error);
    return defaultValue;
  }
}

export function useLocalStorage(key: string, defaultValue: string | null) {
  // The lazy initializer already reads storage on mount (client-only SPA), so
  // the effect below only has to subscribe to later changes.
  const [data, setData] = useState<string | null>(() => readStorage(key, defaultValue));

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) {
        setData(readStorage(key, defaultValue));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key, defaultValue]);

  const setToLocalStorage = (newData: unknown) => {
    try {
      const valueToStore = typeof newData === "function" ? (newData as Updater)(data) : newData;
      if (typeof valueToStore === "string" || valueToStore === null) {
        setData(valueToStore);
      }
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      // Emit storage event for same-tab listeners
      try {
        window.dispatchEvent(
          new StorageEvent("storage", { key, newValue: JSON.stringify(valueToStore) }),
        );
      } catch {
        // Some environments may not allow constructing StorageEvent
      }
    } catch (error) {
      console.warn(`useLocalStorage: could not persist "${key}"`, error);
    }
  };

  return { data, setToLocalStorage };
}
