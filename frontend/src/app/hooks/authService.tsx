"use client";
import { useState } from 'react';

interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  sessionId: string | null;
  loading: boolean;
}

interface GoogleAuthResponse {
  success: boolean;
  session_id?: string;
  user_id?: string;
  user_info?: {
    email: string;
    name: string;
    picture?: string;
  };
  message?: string;
  error?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const useAuthService = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    sessionId: null,
    loading: false,
  });

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

      const data: GoogleAuthResponse = await authResponse.json();

      if (data.success && data.session_id) {
        localStorage.setItem('sessionId', data.session_id);
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
      }
    } catch (error) {
      console.error('Google authentication error:', error);
    }
  };

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
        localStorage.removeItem('sessionId');
        setAuthState({
          isAuthenticated: false,
          user: null,
          sessionId: null,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Session validation error:', error);
      localStorage.removeItem('sessionId');
      setAuthState({
        isAuthenticated: false,
        user: null,
        sessionId: null,
        loading: false,
      });
    }
  };

  const logout = async (): Promise<void> => {
    const sessionId = localStorage.getItem('sessionId');
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

    localStorage.removeItem('sessionId');
    setAuthState({
      isAuthenticated: false,
      user: null,
      sessionId: null,
      loading: false,
    });
  };

  const getSessionId = (): string | null => {
    return localStorage.getItem('sessionId');
  };

  return {
    ...authState,
    handleGoogleSignIn,
    validateSession,
    logout,
    getSessionId,
  };
}; 