import { useState, useRef, useEffect, useContext } from 'react';
import { Message } from '../../types/interfaces';
import { weatherApi } from '../../services/weatherApi';
import { LanguageContext } from '@/app/contexts/LanguageContext';
import { parseAiMessage } from '@/app/utils/parseAiMessage';
import type { AiMeta, AiChatData } from '@/app/types/aiChat';
import { BACKEND_API_URL } from '@/app/constants/apiConstants';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';



export const Chat: React.FC<{ onMetaChange?: (m: AiMeta | null) => void; onDataChange?: (d: AiChatData | null) => void }> = ({ onMetaChange, onDataChange }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lang = useContext(LanguageContext);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/health`);
      if (response.ok) {
        setIsConnected(true);
      }
    } catch (error) {
      setIsConnected(false);
    }
  };

  // Send message to the backend
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const activeSessionId = sessionId || undefined;

    const userMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((msg) => ({
        text: msg.text,
        sender: msg.sender,
      }));

      const response = await weatherApi.getChatResponse(
        userMessage.text,
        conversationHistory,
        activeSessionId,
      );
      if (response.session_id && response.session_id !== sessionId) {
        setSessionId(response.session_id);
      }

      if (response.success && response.data) {
        console.log(response.data);
        // Clear any previous error messages
        setErrorMessage(null);
        const parsed = parseAiMessage(response.data.message);
        onMetaChange && onMetaChange(parsed.metaData);
        onDataChange && onDataChange(parsed.aiChatData);
        const humanText = parsed.humanText;
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: humanText || response.data.message,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Extract error message from response
        const errorText = response.error || 'Failed to fetch chat response';
        setErrorMessage(errorText);
        // Also show error in chat message
        const errorChatMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Error: ${errorText}`,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorChatMessage]);
        console.error('Chat API error:', errorText);
      }
    } catch (error) {
      // Handle network errors or other exceptions
      const errorText = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again later.';
      setErrorMessage(errorText);
      const errorChatMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${errorText}`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorChatMessage]);
      console.error('Chat request failed:', error);
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
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <>
      {errorMessage && (
        <ErrorMessage onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </ErrorMessage>
      )}
      <div className="flex flex-col h-[55vh] md:h-[50vh] lg:h-[45vh] w-full md:max-w-4xl mx-auto bg-gradient-to-b from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-sm">
        {/* Header */}
      <div className="bg-white/80 backdrop-blur border-b border-blue-200 px-6 py-4 rounded-t-2xl">
        <div className="grid grid-cols-[1fr_auto] items-center">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{lang?.t('chat.title')}</h1>
              <p className="hidden sm:block text-sm text-gray-600">{lang?.t('chat.subtitle')}</p>
            </div>
          </div>
          <div className="justify-self-end flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-500">
                {isConnected ? lang?.t('chat.connected') : lang?.t('chat.disconnected')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 mt-8">
            <p>{lang?.t('chat.subtitle')}</p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-md md:max-w-lg lg:max-w-xl px-3 sm:px-4 py-2 rounded-2xl sm:rounded-xl shadow-sm break-words ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.text.startsWith('Error:')
                  ? 'bg-red-50 text-red-800 border border-red-300'
                  : 'bg-white text-gray-800 border border-blue-200'
              }`}
            >
              <p className="text-sm sm:text-base leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap">{message.text}</p>
              <p className={`text-[10px] sm:text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-blue-200 px-3 sm:px-4 py-2 rounded-xl shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                 <span className="text-xs sm:text-sm">{lang?.t('chat.sending')}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white/80 backdrop-blur border-t border-blue-200 p-3 sm:p-4 rounded-b-2xl">
        <div className="flex gap-2 sm:gap-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={lang?.t('chat.placeholder')}
            className="flex-1 px-3 sm:px-4 py-2 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
    </>
  );
};
