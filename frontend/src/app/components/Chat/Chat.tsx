import { useState, useRef, useEffect, useContext } from 'react';
import { Message } from '../../types/interfaces';
import { weatherApi } from '../../services/weatherApi';
import { LanguageContext } from '@/app/contexts/LanguageContext';
import { parseAiMessage } from '@/app/utils/parseAiMessage';
import type { AiMeta, AiChatData } from '@/app/types/aiChat';
import { BACKEND_API_URL } from '@/app/constants/apiConstants';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';

export const Chat: React.FC<{
  onMetaChange?: (m: AiMeta | null) => void;
  onDataChange?: (d: AiChatData | null) => void;
}> = ({ onMetaChange, onDataChange }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lang = useContext(LanguageContext);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkBackendConnection = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const poll = async () => {
      const connected = await checkBackendConnection();
      if (cancelled) return;
      setIsConnected(connected);
      // Keep retrying on failure (e.g. backend still cold-starting),
      // and keep polling on success too, so a later disconnect is reflected.
      timeoutId = setTimeout(poll, connected ? 15000 : 2000);
    };

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

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
        setErrorMessage(null);
        const parsed = parseAiMessage(response.data.message);
        onMetaChange?.(parsed.metaData);
        onDataChange?.(parsed.aiChatData);
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: parsed.humanText || response.data.message,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const errorText = response.error || 'Failed to fetch chat response';
        setErrorMessage(errorText);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: `Error: ${errorText}`,
            sender: 'ai',
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      const errorText =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again later.';
      setErrorMessage(errorText);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `Error: ${errorText}`,
          sender: 'ai',
          timestamp: new Date(),
        },
      ]);
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
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <>
      {errorMessage && (
        <ErrorMessage onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </ErrorMessage>
      )}

      <div className="flex flex-col h-[58vh] lg:h-[calc(100vh-8.5rem)] max-h-[700px] w-full bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-white/[0.05] border-b border-white/10 px-5 py-3.5 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-white">{lang?.t('chat.title')}</h2>
            <p className="hidden sm:block text-xs text-sky-300/60 mt-0.5">{lang?.t('chat.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]'
                  : 'bg-red-400'
              }`}
            />
            <span className="hidden sm:block text-xs text-sky-300/60">
              {isConnected ? lang?.t('chat.connected') : lang?.t('chat.disconnected')}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-60">
              <span className="text-4xl">🌤️</span>
              <p className="text-sky-300/80 text-sm max-w-[220px] leading-relaxed">
                {lang?.t('chat.subtitle')}
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[78%] px-4 py-2.5 rounded-2xl break-words ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm shadow-lg shadow-blue-900/30'
                    : message.text.startsWith('Error:')
                    ? 'bg-red-900/40 text-red-200 border border-red-500/30 rounded-bl-sm'
                    : 'bg-white/10 text-white border border-white/[0.12] rounded-bl-sm'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                  {message.text}
                </p>
                <p
                  className={`text-[10px] mt-1 ${
                    message.sender === 'user' ? 'text-blue-200/50 text-right' : 'text-sky-400/40'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 border border-white/[0.12] px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" />
                  </div>
                  <span className="text-xs text-sky-300/70">{lang?.t('chat.sending')}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white/[0.04] border-t border-white/10 p-4 flex-shrink-0">
          <div className="flex gap-2.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={lang?.t('chat.placeholder')}
              className="flex-1 bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 text-white text-sm placeholder-sky-400/40 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-2xl flex items-center justify-center text-white transition-all duration-200 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-900/40"
              aria-label="Send"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
