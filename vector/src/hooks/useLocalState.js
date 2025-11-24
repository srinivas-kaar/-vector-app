import { useState, useEffect } from "react";

export function useLocalState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue !== null
        ? JSON.parse(storedValue)
        : defaultValue;
    } catch (err) {
      console.error("useLocalState: Error reading localStorage", err);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.error("useLocalState: Error writing localStorage", err);
    }
  }, [key, state]);

  return [state, setState];
}
