import { useEffect, useState } from "react";

export function useLocalStorage(key: string, defaultValue: string | null) {
  const isBrowser = typeof window !== "undefined"; // return true if window is defined

  const readValue = (): string | null => {
    if (!isBrowser) return defaultValue; // return defaultValue if window is not defined
    try {
      const value: string | null = window.localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.log(error); 
      return defaultValue;
    }
  };

  const [data, setData] = useState<string | null>(() => readValue());

  useEffect(() => {
    if (!isBrowser) return;
    // Sync initial value on mount (in case SSR provided default)
    setData(readValue());

    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) {
        setData(readValue());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key, isBrowser]);

  const setToLocalStorage = (newData: string | null | unknown) => {
    try {
      const valueToStore = newData instanceof Function ? (newData as any)(data) : newData;
      // Update state optimistically
      if (typeof valueToStore === "string" || valueToStore === null) {
        setData(valueToStore as string | null);
      }
      if (isBrowser) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Emit storage event for same-tab listeners
        try {
          window.dispatchEvent(
            new StorageEvent("storage", { key, newValue: JSON.stringify(valueToStore) })
          );
        } catch {
          // Some environments may not allow constructing StorageEvent
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return { data, setToLocalStorage };
}
