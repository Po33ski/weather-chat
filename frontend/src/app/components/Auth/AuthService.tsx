"use client";
import { useState, useEffect } from 'react';

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
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export const useAuthService = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    sessionId: null,
    loading: true,
  });
  const [googleReady, setGoogleReady] = useState(false);

  // Initialize Google OAuth
  useEffect(() => {
    if (typeof window !== 'undefined' && GOOGLE_CLIENT_ID) {
      // Load Google OAuth script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeGoogleOAuth();
        setGoogleReady(true);
      };
      script.onerror = () => {
        console.error('Failed to load Google OAuth script');
        setAuthState(prev => ({ ...prev, loading: false }));
      };
      document.head.appendChild(script);
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      validateSession(sessionId);
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const initializeGoogleOAuth = () => {
    if (typeof window !== 'undefined' && (window as any).google) {
      try {
      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
        
        // Render the Google Sign-In button
        const buttonContainer = document.getElementById('google-signin-button');
        if (buttonContainer) {
          (window as any).google.accounts.id.renderButton(buttonContainer, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with'
          });
        }
      } catch (error) {
        console.error('Error initializing Google OAuth:', error);
      }
    }
  };

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
          user: null, // We'll need to get user info separately
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

  // Removed signInWithGoogle function - we only use the rendered button now

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
    googleReady,
    logout,
    getSessionId,
  };
};

export const AuthLogin: React.FC = () => {
  const [error, setError] = useState('');
  const { loading, googleReady } = useAuthService();

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Weather Center Chat</h1>
            <p className="text-sm text-gray-600">Sign in with Google to access AI chat features</p>
          </div>
        </div>
      </div>

      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Sign In with Google
              </h2>
              <p className="text-sm text-gray-600">
                Use your Google account to access the AI chat feature
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Google Sign In Button */}
            <div className="space-y-4">
              {/* Google's official button - this is the only button we need */}
              <div id="google-signin-button"></div>
            </div>

            {!GOOGLE_CLIENT_ID && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-600">
                  Google OAuth is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID.
                </p>
              </div>
            )}

            {!googleReady && GOOGLE_CLIENT_ID && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-600">
                  Loading Google Sign-In...
                </p>
              </div>
            )}

            {/* Additional info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Click the Google button above to sign in securely
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 