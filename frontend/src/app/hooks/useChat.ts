import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_MESSAGE_LENGTH } from "@/app/constants/chat";
import { weatherApi } from "@/app/services/weatherApi";
import type { ChatError, ChatMessage } from "@/app/types/interfaces";
import { parseAiMessage } from "@/app/utils/parseAiMessage";
import { toResultView, type ResultView } from "@/app/utils/resultView";

let idCounter = 0;
const nextId = () => `msg-${Date.now().toString(36)}-${(idCounter += 1)}`;

export interface ChatController {
  messages: ChatMessage[];
  isSending: boolean;
  error: ChatError | null;
  // Latest structured answer. A text-only reply (e.g. travel advice) keeps the
  // previous board visible, since it usually talks about the same trip.
  result: ResultView | null;
  // Resolves to false only when the message is refused before sending (blank,
  // too long, or another request in flight) so the caller can keep the draft.
  send: (text: string) => Promise<boolean>;
  retry: (errorMessageId: string) => void;
  reset: () => void;
  dismissError: () => void;
}

export function useChat(): ChatController {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const [result, setResult] = useState<ResultView | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  // State updates are async; the ref blocks a double submit within one frame.
  const inFlightRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(async (raw: string): Promise<boolean> => {
    const text = raw.trim();
    if (!text || text.length > MAX_MESSAGE_LENGTH || inFlightRef.current) return false;

    inFlightRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    setIsSending(true);
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text, createdAt: new Date() }]);

    try {
      const response = await weatherApi.getChatResponse(text, sessionIdRef.current, {
        signal: controller.signal,
      });
      // Reset or unmount happened while waiting — this answer belongs to a dead conversation.
      if (controller.signal.aborted) return true;
      if (response.sessionId) sessionIdRef.current = response.sessionId;

      if (response.ok) {
        const parsed = parseAiMessage(response.message);
        const view = toResultView(parsed);
        if (view) setResult(view);
        setError(null);
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "ai",
            text: parsed.humanText,
            createdAt: new Date(),
            hasResult: Boolean(view),
          },
        ]);
        return true;
      }

      if (response.error.kind === "aborted") return true;
      const chatError = response.error;
      setError(chatError);
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "error", text: "", createdAt: new Date(), error: chatError, retryText: text },
      ]);
      return true;
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        inFlightRef.current = false;
        setIsSending(false);
      }
    }
  }, []);

  const retry = useCallback(
    (errorMessageId: string) => {
      const index = messages.findIndex((m) => m.id === errorMessageId);
      const retryText = messages[index]?.retryText;
      if (index === -1 || !retryText || inFlightRef.current) return;
      // Drop the failed user message and its error entry; send() re-adds the
      // message, and both updaters apply in order within the same batch.
      const failedUserId = messages[index - 1]?.role === "user" ? messages[index - 1].id : null;
      setMessages((prev) => prev.filter((m) => m.id !== errorMessageId && m.id !== failedUserId));
      void send(retryText);
    },
    [messages, send],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    inFlightRef.current = false;
    sessionIdRef.current = null;
    setIsSending(false);
    setMessages([]);
    setResult(null);
    setError(null);
  }, []);

  const dismissError = useCallback(() => setError(null), []);

  return { messages, isSending, error, result, send, retry, reset, dismissError };
}
