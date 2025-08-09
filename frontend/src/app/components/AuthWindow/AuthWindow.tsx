import React from 'react';
import { TotpAuth } from '../TotpAuth/TotpAuth';

interface AuthWindowProps {
  isConnected: boolean;
  googleButtonRef: React.RefObject<HTMLDivElement>;
  setupTotp: any;
  verifyTotp: any;
  checkTotpStatus: any;
}

export const AuthWindow: React.FC<AuthWindowProps> = ({
  isConnected,
  googleButtonRef,
  setupTotp,
  verifyTotp,
  checkTotpStatus,
}) => (
  <div className="flex flex-col h-screen w-full max-w-4xl mx-auto bg-gray-50">
    <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">AI Chat Assistant</h1>
          <p className="text-xs sm:text-sm text-gray-600">Powered by Google ADK</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </div>
    <div className="flex-1 flex items-center justify-center p-2 sm:p-6">
      <div className="w-full max-w-xs sm:max-w-md mx-auto">
        <div className="p-3 sm:p-4 bg-white rounded-2xl shadow-md border border-gray-100">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-1 sm:mb-2">
              Sign in to use AI Chat
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">
              Choose your authentication method
            </p>
            {/* Google OAuth Button */}
            <div className="mb-3 sm:mb-4 flex flex-col items-center">
              <div ref={googleButtonRef} className="w-full flex justify-center" />
            </div>
            {/* Divider */}
            <div className="relative mb-3 sm:mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-white text-gray-400">or</span>
              </div>
            </div>
            {/* TOTP Authentication */}
            <TotpAuth
              setupTotp={setupTotp}
              verifyTotp={verifyTotp}
              checkTotpStatus={checkTotpStatus}
              onSuccess={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);