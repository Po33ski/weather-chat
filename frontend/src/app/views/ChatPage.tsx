"use client";
import { useState, useEffect } from "react";
import React from "react";
import { Chat } from "../components/Chat/Chat";
import { AuthLoading } from '../components/AuthLoading/AuthLoading';
import { AuthWindow } from '../components/AuthWindow/AuthWindow';

export const ChatPage = () => {

  // All browser-dependent hooks and logic go here
  const { useIsAuthenticated } = require('../hooks/useIsAuthenticated');
  const { useAuthService } = require('../hooks/authService');
  const isAuthenticated = useIsAuthenticated();
  const {
    handleGoogleSignIn,
    validateSession,
    logout,
    getUser,
    getSessionId,
    setupTotp,
    verifyTotp,
    checkTotpStatus,
  } = useAuthService();
  const [googleReady, setGoogleReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const googleButtonRef = React.useRef<HTMLDivElement>(null);

  // Google OAuth initialization
  useEffect(() => {
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (typeof window !== 'undefined' && GOOGLE_CLIENT_ID) {
      if ((window as any).google) {
        initializeGoogleOAuth();
        setGoogleReady(true);
      } else {
        setAuthLoading(true);
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initializeGoogleOAuth();
          setGoogleReady(true);
        };
        script.onerror = () => {
          setAuthLoading(false);
        };
        document.head.appendChild(script);
      }
    } else {
      setAuthLoading(false);
    }
    // Validate session if present
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      validateSession(sessionId).finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
    // Check backend connection
    checkBackendConnection();
  }, []);

  useEffect(() => {
    if (!isAuthenticated && googleReady) {
      (window as any).google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signin_with',
      });
    }
  }, [isAuthenticated, googleReady]);

  const initializeGoogleOAuth = () => {
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (typeof window !== 'undefined' && (window as any).google && GOOGLE_CLIENT_ID) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      } catch {}
    }
  };


  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'development'
      ? 'http://localhost:8000'
      : '');

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setIsConnected(true);
      }
    } catch {
      setIsConnected(false);
    }
  };

  if (authLoading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return (
      <AuthWindow
        isConnected={isConnected}
        googleButtonRef={googleButtonRef}
        setupTotp={setupTotp}
        verifyTotp={verifyTotp}
        checkTotpStatus={checkTotpStatus}
      />
    );
  }

  return (
    <>
      <div className="chat-page">
        <Chat />
      </div>
    </>
  );
};