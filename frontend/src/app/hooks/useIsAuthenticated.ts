import { useState, useEffect } from 'react';

export function useIsAuthenticated() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const getAuth = () =>
      typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(getAuth());

    const handler = () => setIsAuthenticated(getAuth());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [localStorage.getItem('isAuthenticated')]);

  return isAuthenticated;
}