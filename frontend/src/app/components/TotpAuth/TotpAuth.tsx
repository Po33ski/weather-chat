"use client";
import { useState } from 'react';

interface TotpAuthProps {
  setupTotp: (email: string) => Promise<string | null>;
  verifyTotp: (email: string, code: string) => Promise<any>;
  checkTotpStatus: (email: string) => Promise<{ success: boolean; has_totp: boolean; error?: string }>;
  onSuccess: () => void;
}

export const TotpAuth: React.FC<TotpAuthProps> = ({ setupTotp, verifyTotp, checkTotpStatus, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSetup = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const qrUrl = await setupTotp(email);
      if (qrUrl) {
        setQrCodeUrl(qrUrl);
        setSuccess('QR code generated! Scan it with Google Authenticator app.');
        setIsSetupMode(false);
      } else {
        setError('Failed to generate QR code');
      }
    } catch (error) {
      setError('Setup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!email || !code) {
      setError('Please enter both email and code');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await verifyTotp(email, code);
      if (result.success) {
        setSuccess('Authentication successful!');
        onSuccess();
      } else {
        setError(result.error || 'Invalid code');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const status = await checkTotpStatus(email);
      if (status.success) {
        if (status.has_totp) {
          setIsSetupMode(false);
          setSuccess('TOTP is already set up for this email. Enter your code to login.');
        } else {
          setIsSetupMode(true);
          setSuccess('TOTP is not set up. Click "Setup TOTP" to get started.');
        }
      } else {
        setError(status.error || 'Failed to check status');
      }
    } catch (error) {
      setError('Status check failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isSetupMode ? 'Setup TOTP Authentication' : 'Verify TOTP Code'}
        </h3>
        <p className="text-sm text-gray-600">
          {isSetupMode 
            ? 'Enter your email to get a QR code for Google Authenticator'
            : 'Enter the 6-digit code from your Google Authenticator app'
          }
        </p>
      </div>

      {/* Email Input */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your email"
        />
      </div>

      {/* Action Buttons */}
      <div className="mb-4 space-y-2">
        <button
          onClick={handleCheckStatus}
          disabled={isLoading || !email}
          className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
        >
          Check TOTP Status
        </button>
        
        {isSetupMode ? (
          <button
            onClick={handleSetup}
            disabled={isLoading || !email}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Setting up...' : 'Setup TOTP'}
          </button>
        ) : (
          <>
            {/* Code Input */}
            <div className="mb-4">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                TOTP Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
            
            <button
              onClick={handleVerify}
              disabled={isLoading || !email || !code}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </>
        )}
      </div>

      {/* QR Code Display */}
      {qrCodeUrl && (
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600 mb-2">Scan this QR code with Google Authenticator:</p>
          <img 
            src={qrCodeUrl} 
            alt="TOTP QR Code" 
            className="mx-auto border border-gray-300 rounded-md"
            style={{ maxWidth: '200px' }}
          />
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Switch Mode Button */}
      <div className="text-center">
        <button
          onClick={() => {
            setIsSetupMode(!isSetupMode);
            setQrCodeUrl(null);
            setCode('');
            setError(null);
            setSuccess(null);
          }}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {isSetupMode ? 'Already have TOTP? Verify here' : 'Need to setup TOTP? Click here'}
        </button>
      </div>
    </div>
  );
}; 