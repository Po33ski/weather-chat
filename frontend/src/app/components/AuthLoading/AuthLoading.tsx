import React from 'react';

export const AuthLoading: React.FC = () => (
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