"use client";
import React from "react";
import { User } from "../types/interfaces";

export type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  sessionId: string | null;
  loading: boolean;
  handleGoogleSignIn: (response: any) => Promise<void>;
  validateSession: (sessionId: string) => Promise<void>;
  logout: () => Promise<void>;
  getSessionId: () => string | null;
  getUser: () => User | null;
  setupTotp: (email: string) => Promise<string | null>;
  verifyTotp: (email: string, code: string) => Promise<{
    success: boolean;
    session_id?: string;
    user_id?: string;
    user_info?: { email: string; name: string; picture?: string };
    message?: string;
    error?: string;
  }>;
  checkTotpStatus: (
    email: string
  ) => Promise<{ success: boolean; has_totp: boolean; error?: string }>;
};

export const AuthContext = React.createContext<AuthContextType | null>(null);


