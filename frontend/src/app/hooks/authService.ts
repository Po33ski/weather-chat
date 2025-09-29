"use client";
import { useEffect, useState } from 'react';
import { User, AuthState, GoogleAuthRes, TotpAuthRes } from '../types/interfaces';


// Builds the API base URL for the browser:
// - prefers NEXT_PUBLIC_API_URL when provided (same-origin in prod recommended)
// - falls back to http://localhost:8000 in development
// The value is baked by Next.js during build for client bundles.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '');

// Runtime guard to avoid using browser-only APIs (window/localStorage) during SSR/SSG
const isBrowser = typeof window !== 'undefined';

/**
 * React hook that centralizes authentication state and actions for the app.
 *
 * Responsibilities:
 * - Hydrate auth state from localStorage on first mount (client only)
 * - Keep an in-memory source of truth for { isAuthenticated, user, sessionId }
 * - Perform auth flows (Google sign-in, TOTP verify, logout)
 * - Validate and refresh session details from the backend
 * - Broadcast state changes by dispatching a 'storage' event, so other tabs/components can react
 */
export const useAuthService = () => {

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    sessionId: null,
    loading: true,
  });

  // Hydrate auth state from localStorage on first mount (client only).
  // This allows the UI to reflect persisted sessions immediately, then optionally
  // validates the session with the backend in the background for freshness.
  useEffect(() => {
    if (!isBrowser) {
      setAuthState((s) => ({ ...s, loading: false }));
      return;
    }
    const sessionId = window.localStorage.getItem('sessionId');
    const userRaw = window.localStorage.getItem('user');
    if (sessionId) {
      let user: User | null = null;
      if (userRaw) {
        try {
          const parsed = JSON.parse(userRaw);
          user = {
            user_id: parsed.id || parsed.user_id || '',
            email: parsed.email || '',
            name: parsed.name || '',
            picture: parsed.picture || '',
          };
        } catch {}
      }
      setAuthState({
        isAuthenticated: true,
        user,
        sessionId,
        loading: false,
      });
      // Optionally refresh session info in the background so the user data stays current
      validateSession(sessionId).catch(() => {});
    } else {
      setAuthState((s) => ({ ...s, loading: false }));
    }
  }, []);


  /**
   * Handles Google Identity Services sign-in response.
   * On success, persists session to localStorage, notifies listeners via 'storage',
   * and updates in-memory auth state.
   */
  const handleGoogleSignIn = async (response: any) => {
    try {
      const authResponse = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: response.credential,
        }),
      });

      const data: GoogleAuthRes = await authResponse.json();

      if (data.success && data.session_id && isBrowser) {
        window.localStorage.setItem('sessionId', data.session_id);
        window.localStorage.setItem('user', JSON.stringify({data: data.user_info, id: data.user_id, email: data.user_info?.email, name: data.user_info?.name, picture: data.user_info?.picture}));
        window.localStorage.setItem('isAuthenticated', 'true');
        // Dispatching a 'storage' event ensures same-tab listeners react immediately,
        // not only other tabs (native event normally fires across tabs).
        try {
          window.dispatchEvent(new StorageEvent('storage', { key: 'isAuthenticated', newValue: 'true' }));
        } catch {}
        setAuthState({
          isAuthenticated: true,
          user: data.user_info ? {
            user_id: data.user_id || '',
            email: data.user_info.email,
            name: data.user_info.name,
            picture: data.user_info.picture,
          } : null,
          sessionId: data.session_id,
          loading: false,
        });
      } else {
        console.error('Google authentication failed:', data.error);
        localStorage.setItem('isAuthenticated', 'false');
      }
    } catch (error) {
      console.error('Google authentication error:', error);
    }
  };

  /**
   * Validates the current session with the backend and updates in-memory state accordingly.
   * Clears persisted session on error or invalidation to keep the UI consistent.
   */
  const validateSession = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/session/${sessionId}`);
      if (response.ok) {
        const sessionInfo = await response.json();
        setAuthState({
          isAuthenticated: true,
          user: sessionInfo.user || null,
          sessionId,
          loading: false,
        });
      } else {
        if (isBrowser) {
          window.localStorage.removeItem('sessionId');
          window.localStorage.removeItem('user');
        }
        setAuthState({
          isAuthenticated: false,
          user: null,
          sessionId: null,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Session validation error:', error);
      if (isBrowser) {
        window.localStorage.removeItem('sessionId');
        window.localStorage.removeItem('user');
      }
      setAuthState({
        isAuthenticated: false,
        user: null,
        sessionId: null,
        loading: false,
      });
    }
  };

  /**
   * Logs out from the backend (best-effort), disables Google auto-select, clears persisted
   * session, broadcasts change, and resets in-memory auth state.
   */
  const logout = async (): Promise<void> => {
    const sessionId = isBrowser ? window.localStorage.getItem('sessionId') : null;
    if (sessionId) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session_id: sessionId }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    // Ensure Google auto sign-in is disabled so button doesn't auto-login user again
    try {
      if (isBrowser && (window as any).google?.accounts?.id?.disableAutoSelect) {
        (window as any).google.accounts.id.disableAutoSelect();
      }
    } catch {}
    if (isBrowser) {
      window.localStorage.setItem('isAuthenticated', 'false');
      window.localStorage.removeItem('sessionId');
      window.localStorage.removeItem('user');
      try {
        window.dispatchEvent(new StorageEvent('storage', { key: 'isAuthenticated', newValue: 'false' }));
      } catch {}
    }
    setAuthState({
      isAuthenticated: false,
      user: null,
      sessionId: null,
      loading: false,
    });
    // Optionally, force a reload to ensure UI updates everywhere
    // window.location.reload();
  };

  /** Returns the current session id from localStorage (client only). */
  const getSessionId = (): string | null => {
    return isBrowser ? window.localStorage.getItem('sessionId') : null;
  };

  /**
   * Returns the current user: prefers in-memory state and falls back to localStorage.
   * Ensures the returned object matches the expected User shape.
   */
  const getUser = (): User | null => {
    // First try to get from authState (current session)
    if (authState.user) {
      return authState.user;
    }
    
    // Fallback to localStorage
    const user = isBrowser ? window.localStorage.getItem('user') : null;
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        // Return the user data in the correct format
        return {
          user_id: parsedUser.id || parsedUser.user_id || '',
          email: parsedUser.email || '',
          name: parsedUser.name || '',
          picture: parsedUser.picture || '',
        };
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        return null;
      }
    }
    return null;
  };

  // TOTP Authentication Functions
  /** Requests TOTP setup and returns a blob URL with the QR code (or null on error). */
  const setupTotp = async (email: string): Promise<string | null> => {
    try {
      const formData = new URLSearchParams();
      formData.append('email', email);

      const response = await fetch(`${API_BASE_URL}/api/auth/totp/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        return url; // Return the QR code URL
      } else {
        const errorData = await response.json();
        console.error('TOTP setup failed:', errorData.error);
        return null;
      }
    } catch (error) {
      console.error('TOTP setup error:', error);
      return null;
    }
  };

  /**
   * Verifies a TOTP code; on success persists session and updates state
   * analogous to the Google sign-in flow.
   */
  const verifyTotp = async (email: string, code: string): Promise<TotpAuthRes> => {
    try {
      const formData = new URLSearchParams();
      formData.append('email', email);
      formData.append('code', code);

      const response = await fetch(`${API_BASE_URL}/api/auth/totp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const data: TotpAuthRes = await response.json();

      if (data.success && data.session_id && isBrowser) {
        window.localStorage.setItem('sessionId', data.session_id);
        window.localStorage.setItem('user', JSON.stringify({
          data: data.user_info, 
          id: data.user_id, 
          email: data.user_info?.email, 
          name: data.user_info?.name, 
          picture: data.user_info?.picture
        }));
        window.localStorage.setItem('isAuthenticated', 'true');
        try {
          window.dispatchEvent(new StorageEvent('storage', { key: 'isAuthenticated', newValue: 'true' }));
        } catch {}
        setAuthState({
          isAuthenticated: true,
          user: data.user_info ? {
            user_id: data.user_id || '',
            email: data.user_info.email,
            name: data.user_info.name,
            picture: data.user_info.picture,
          } : null,
          sessionId: data.session_id,
          loading: false,
        });
      }

      return data;
    } catch (error) {
      console.error('TOTP verification error:', error);
      return {
        success: false,
        error: 'TOTP verification failed'
      };
    }
  };

  /** Checks whether a user has TOTP enabled. */
  const checkTotpStatus = async (email: string): Promise<{ success: boolean; has_totp: boolean; error?: string }> => {
    try {
      const encodedEmail = encodeURIComponent(email);
      const response = await fetch(`${API_BASE_URL}/api/auth/totp/status/${encodedEmail}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('TOTP status check error:', error);
      return { success: false, has_totp: false, error: 'Status check failed' };
    }
  };

  return {
    ...authState,
    handleGoogleSignIn,
    validateSession,
    logout,
    getSessionId,
    getUser,
    setupTotp,
    verifyTotp,
    checkTotpStatus,
  };
}; 