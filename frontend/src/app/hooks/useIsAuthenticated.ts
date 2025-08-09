import { useState, useEffect } from 'react';

export function useIsAuthenticated() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const isBrowser = typeof window !== 'undefined';
    const getAuth = () => (isBrowser ? window.localStorage.getItem('isAuthenticated') === 'true' : false);

    // Initialize from storage only on client
    setIsAuthenticated(getAuth());

    if (!isBrowser) return;

    const handler = () => setIsAuthenticated(getAuth());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return isAuthenticated;
}