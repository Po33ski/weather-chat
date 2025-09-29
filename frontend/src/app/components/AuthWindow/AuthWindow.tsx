"use client";
import React from 'react';
import { TotpAuth } from '../TotpAuth/TotpAuth';
import { useContext } from 'react';
import { LanguageContext } from '@/app/contexts/LanguageContext';
import type { AuthWindowProps } from '@/app/types/types';

export const AuthWindow: React.FC<AuthWindowProps> = ({
  isConnected,
  googleButtonRef,
  setupTotp,
  verifyTotp,
  checkTotpStatus,
}) => {
  const lang = useContext(LanguageContext);
  return (
    <div className="flex flex-col h-screen w-full max-w-4xl mx-auto bg-gradient-to-b from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-sm">
      <div className="bg-white/80 backdrop-blur border-b border-blue-200 px-4 py-3 sm:px-6 sm:py-4 rounded-t-2xl">
        <div className="grid grid-cols-[1fr_auto] items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{lang?.t('chat.title')}</h1>
            <p className="hidden sm:block text-xs sm:text-sm text-gray-600">{lang?.t('chat.subtitle')}</p>
          </div>
          <div className="justify-self-end flex items-center space-x-2">
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="hidden sm:inline text-xs text-gray-500">
              {isConnected ? lang?.t('chat.connected') : lang?.t('chat.disconnected')}
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-2 sm:p-6">
        <div className="w-full max-w-xs sm:max-w-md mx-auto">
          <div className="p-3 sm:p-5 bg-white rounded-2xl shadow-md border border-blue-100">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-1 sm:mb-2">{lang?.t('auth.signinTitle')}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">{lang?.t('auth.chooseMethod')}</p>
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
                  <span className="px-2 bg-white text-gray-400">{lang?.t('auth.or')}</span>
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
};