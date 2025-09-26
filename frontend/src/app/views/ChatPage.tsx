"use client";
import { useState, useEffect } from "react";
import React from "react";
import { Chat } from "../components/Chat/Chat";
import { AiWeatherPanel } from "../components/AiWeatherPanel/AiWeatherPanel";
import type { AiMeta, AiChatData } from "@/app/types/aiChat";
import { AuthLoading } from '../components/AuthLoading/AuthLoading';
import { AuthWindow } from '../components/AuthWindow/AuthWindow';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { LanguageContext } from '../contexts/LanguageContext';


export const ChatPage = () => {
  const [aiMeta, setAiMeta] = useState<AiMeta | null>(null);
  const [aiData, setAiData] = useState<AiChatData | null>(null);

  // All browser-dependent hooks and logic go here
  const auth = useContext(AuthContext);
  const lang = useContext(LanguageContext);
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
    // Validate session if present, but only if not already authenticated
    const sessionId = typeof window !== 'undefined' ? localStorage.getItem('sessionId') : null;
    if (!auth?.isAuthenticated && sessionId) {
      auth?.validateSession(sessionId).finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
    // Check backend connection
    checkBackendConnection();
  }, []);

  useEffect(() => {
    if (!(auth?.isAuthenticated) && googleReady) {
      (window as any).google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 300,
        text: 'signin_with',
      });
    }
  }, [auth?.isAuthenticated, googleReady]);

  const initializeGoogleOAuth = () => {
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (typeof window !== 'undefined' && (window as any).google && GOOGLE_CLIENT_ID) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: auth?.handleGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      } catch {}
    }
  };


  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '');

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
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

  if (!(auth?.isAuthenticated)) {
    return (
      <AuthWindow
        isConnected={isConnected}
        googleButtonRef={googleButtonRef}
        setupTotp={auth?.setupTotp}
        verifyTotp={auth?.verifyTotp}
        checkTotpStatus={auth?.checkTotpStatus}
      />
    );
  }

  return (
    <>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Chat (shorter) */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-[45vh] overflow-y-auto">
          <Chat onMetaChange={setAiMeta} onDataChange={setAiData} />
        </div>
        {/* AI Weather Panel below chat */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <AiWeatherPanel meta={aiMeta} data={aiData} />
        </div>
      </div>
    </>
  );
};