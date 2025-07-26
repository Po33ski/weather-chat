import { useState } from "react";

export function useLocalStorage(key: string, defaultValue: string | null) {
  const getFromLocalStorage = () => {
    try {
      // Check if we're in a browser environment
      if (typeof window !== "undefined") {
      const value: string | null = window.localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
      }
      return defaultValue;
    } catch (error) {
      console.log(error);
      return defaultValue;
    }
  };

  const [data, setData] = useState<string | null>(() => getFromLocalStorage());

  const setToLocalStorage = (newData: string | null | unknown) => {
    try {
      const dataToStore = newData instanceof Function ? newData(data) : newData;
      if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(dataToStore));
      }
      typeof newData === "string" && setData(newData);
    } catch (error) {
      console.log(error);
    }
  };

  return { data, setToLocalStorage };
}
