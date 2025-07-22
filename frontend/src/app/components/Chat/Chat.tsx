"use client";
import { useState, useRef, useEffect, useContext } from 'react';
import { useAuthService } from '../../hooks/authService';
import { Message} from '../../types/interfaces';
import { weatherApi } from '../../services/weatherApi';
import { UnitSystemContext } from '@/app/contexts/UnitSystemContext';
import { UnitSystemContextType } from '../../types/types';
import { TotpAuth } from '../TotpAuth/TotpAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const { isAuthenticated, user, sessionId, handleGoogleSignIn, validateSession, logout, getUser, setupTotp, verifyTotp, checkTotpStatus } = useAuthService();
  const [isClient, setIsClient] = useState(false);
  const [googleButtonRendered, setGoogleButtonRendered] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unitSystemContext = useContext(UnitSystemContext) as UnitSystemContextType | null;
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Fix hydration issue by ensuring client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize Google OAuth and session validation
  useEffect(() => {
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    console.log('Google OAuth initialization - CLIENT_ID:', GOOGLE_CLIENT_ID);
    
    if (typeof window !== 'undefined' && GOOGLE_CLIENT_ID) {
      console.log('Window exists and CLIENT_ID is set');
      // Check if Google script is already loaded
      if ((window as any).google) {
        console.log('Google script already loaded');
        initializeGoogleOAuth();
        setGoogleReady(true);
      } else {
        console.log('Loading Google OAuth script...');
        // Load Google OAuth script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log('Google OAuth script loaded successfully');
          initializeGoogleOAuth();
          setGoogleReady(true);
        };
        script.onerror = () => {
          console.error('Failed to load Google OAuth script');
          setAuthLoading(false);
        };
        document.head.appendChild(script);
      }
    } else {
      console.log('Missing requirements for Google OAuth:', {
        windowExists: typeof window !== 'undefined',
        clientId: GOOGLE_CLIENT_ID
      });
      setAuthLoading(false);
    }

    // Check for existing session
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      validateSession(sessionId).finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  // Render Google button when needed
  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, googleReady, googleButtonRendered });
    
    if (!isAuthenticated && googleReady && googleButtonRef.current && !googleButtonRendered) {
      console.log('Rendering Google button');
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        renderGoogleButton();
        setGoogleButtonRendered(true);
      }, 100);
    }
    
    // Reset button state when authenticated
    if (isAuthenticated && googleButtonRendered) {
      console.log('User authenticated, resetting button state');
      setGoogleButtonRendered(false);
    }
  }, [isAuthenticated, googleReady, googleButtonRendered]);



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
      } catch (error) {
        console.error('Error initializing Google OAuth:', error);
      }
    }
  };

  const renderGoogleButton = () => {
    console.log('Attempting to render Google button');
    console.log('Google object exists:', typeof window !== 'undefined' && (window as any).google);
    console.log('Button ref exists:', googleButtonRef.current);
    console.log('Google ready state:', googleReady);
    console.log('Is authenticated:', isAuthenticated);
    
    if (typeof window !== 'undefined' && (window as any).google && googleButtonRef.current) {
      try {
        // Make sure Google OAuth is initialized
        const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        console.log('Using CLIENT_ID for button render:', GOOGLE_CLIENT_ID);
        
        if (GOOGLE_CLIENT_ID) {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
        }
        
        // Render the button
        (window as any).google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with'
        });
        
        console.log('Google button rendered successfully');
      } catch (error) {
        console.error('Error rendering Google button:', error);
      }
    } else {
      console.log('Cannot render Google button - missing requirements:', {
        windowExists: typeof window !== 'undefined',
        googleExists: typeof window !== 'undefined' && (window as any).google,
        buttonRefExists: !!googleButtonRef.current
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Check backend connection on component mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  // Check if the backend is connected
  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setIsConnected(true);
      }
    } catch (error) {
      console.warn('Backend not connected:', error);
      setIsConnected(false);
    }
  };



  // Send message to the backend
  const handleSendMessage = async () => {
      // Get current unit system and user id
      const unitSystem = unitSystemContext?.unitSystem.data || "METRIC";
      const userId = getUser()?.user_id || "";
    if (!inputText.trim() || !isAuthenticated) return;

    const userMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
      unitSystem: unitSystem,
      userId: userId
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare conversation history for the API
      const conversationHistory = messages.map(msg => ({
        text: msg.text,
        sender: msg.sender,
        unitSystem: msg.unitSystem || unitSystem,
        userId: msg.userId || userId,
      }));

      const response = await weatherApi.getChatResponse(
        userMessage.text,
        conversationHistory,
        sessionId || "",
        unitSystem,
        userId
      );
      if (response.success && response.data) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.message,
          sender: 'ai',
          timestamp: new Date(),
          unitSystem: unitSystem,
          userId: userId
        };
        console.log(aiMessage);
        
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(response.error || 'Failed to fetch chat response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again later.',
        sender: 'ai',
        timestamp: new Date(),
        unitSystem: unitSystem,
        userId: userId
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    if (!isClient) return ''; // Return empty string during SSR to prevent hydration mismatch
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AI Chat Assistant</h1>
              <p className="text-sm text-gray-600">Powered by Google ADK</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication if user is not logged in
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AI Chat Assistant</h1>
              <p className="text-sm text-gray-600">Powered by Google ADK</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-500">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sign in to use AI Chat
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose your authentication method
                </p>
                
                {/* Google OAuth Button */}
                <div className="mb-4">
                  <div ref={googleButtonRef}></div>
                  
                  {/* Debug info */}
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                    <p>Debug Info:</p>
                    <p>googleReady: {googleReady.toString()}</p>
                    <p>CLIENT_ID set: {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'Yes' : 'No'}</p>
                    <p>isAuthenticated: {isAuthenticated.toString()}</p>
                    <p>googleButtonRendered: {googleButtonRendered.toString()}</p>
                  </div>
                  
                  {/* Fallback button for debugging */}
                  {!googleReady && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                    <button
                      onClick={() => {
                        console.log('Manual Google OAuth test');
                        if (typeof window !== 'undefined' && (window as any).google) {
                          (window as any).google.accounts.id.prompt();
                        } else {
                          console.log('Google OAuth not available');
                        }
                      }}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Test Google OAuth (Debug)
                    </button>
                  )}
                  
                  {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-600">
                        Google OAuth is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID.
                      </p>
                    </div>
                  )}
                  {!googleReady && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-600">
                        Loading Google Sign-In... (googleReady: {googleReady.toString()})
                      </p>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                {/* TOTP Authentication */}
                <TotpAuth
                  setupTotp={setupTotp}
                  verifyTotp={verifyTotp}
                  checkTotpStatus={checkTotpStatus}
                  onSuccess={() => {
                    // Reset button state after TOTP success
                    setGoogleButtonRendered(false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main chat interface
  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AI Chat Assistant</h1>
              <p className="text-sm text-gray-600">Powered by Google ADK</p>
            </div>
            {getUser() && (
              <div className="flex items-center space-x-2">
                {getUser()?.picture && (
                  <img 
                    src={getUser()?.picture} 
                    alt={getUser()?.name} 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm text-gray-700">{getUser()?.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-500">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={async () => {
                await logout();
                // Reset button state and re-render Google button after logout
                setGoogleButtonRendered(false);
                if (googleButtonRef.current) {
                  googleButtonRef.current.innerHTML = '';
                  setTimeout(() => {
                    renderGoogleButton();
                  }, 100);
                }
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>Start a conversation with the AI assistant!</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
