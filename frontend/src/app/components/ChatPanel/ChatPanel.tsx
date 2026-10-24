import { useEffect, useRef } from "react";
import { Compass, SquarePen } from "lucide-react";
import { ChatComposer } from "@/app/components/ChatComposer/ChatComposer";
import { ChatMessage, TypingIndicator } from "@/app/components/ChatMessage/ChatMessage";
import { useLanguage } from "@/app/hooks/useLanguage";
import type { ChatController } from "@/app/hooks/useChat";

const SUGGESTIONS = ["chat.suggestion.1", "chat.suggestion.2", "chat.suggestion.3", "chat.suggestion.4"] as const;

export function ChatPanel({
  chat,
  onShowResult,
  className = "",
}: {
  chat: ChatController;
  onShowResult: () => void;
  className?: string;
}) {
  const { t } = useLanguage();
  const logRef = useRef<HTMLDivElement>(null);
  const isEmpty = chat.messages.length === 0;

  // Scroll the log itself — scrollIntoView would also scroll the page on mobile.
  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    log.scrollTo({ top: log.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [chat.messages.length, chat.isSending]);

  return (
    <section
      aria-labelledby="chat-title"
      className={`card flex min-h-[28rem] flex-col overflow-hidden ${className}`}
    >
      <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-white" aria-hidden="true">
            <Compass className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 id="chat-title" className="truncate font-semibold text-ink">
              {t("chat.title")}
            </h2>
            <p className="truncate text-sm text-ink-muted">{t("chat.subtitle")}</p>
          </div>
        </div>
        {!isEmpty && (
          <button
            type="button"
            onClick={chat.reset}
            className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
          >
            <SquarePen className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t("chat.newChat")}</span>
            <span className="sr-only sm:hidden">{t("chat.newChat")}</span>
          </button>
        )}
      </header>

      <div ref={logRef} className="scrollbar-thin flex-1 overflow-y-auto px-4 py-5 sm:px-5">
        {isEmpty ? (
          <div className="flex h-full flex-col">
            <div className="flex gap-3">
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-accent text-white" aria-hidden="true">
                <Compass className="size-4" />
              </span>
              <p className="max-w-[85%] rounded-3xl rounded-tl-lg bg-surface-muted px-4 py-3 text-[15px] leading-relaxed text-ink">
                {t("chat.greeting")}
              </p>
            </div>
            <div className="mt-auto pt-6">
              <p className="eyebrow">{t("chat.suggestions")}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {SUGGESTIONS.map((key) => (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => void chat.send(t(key))}
                      disabled={chat.isSending}
                      className="focus-ring rounded-full border border-line-strong bg-surface px-3.5 py-2 text-left text-sm text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {t(key)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <ol className="space-y-5" role="log" aria-live="polite" aria-relevant="additions">
            {chat.messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onRetry={chat.retry}
                onShowResult={onShowResult}
                retryDisabled={chat.isSending}
              />
            ))}
            {chat.isSending && <TypingIndicator />}
          </ol>
        )}
      </div>

      <ChatComposer onSend={chat.send} isSending={chat.isSending} />
    </section>
  );
}
