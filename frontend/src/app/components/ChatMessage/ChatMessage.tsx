import { ArrowRight, CircleAlert, Compass, RotateCcw } from "lucide-react";
import { RichText } from "@/app/components/RichText/RichText";
import { useLanguage } from "@/app/hooks/useLanguage";
import type { ChatMessage as ChatMessageData } from "@/app/types/interfaces";
import { describeChatError } from "@/app/utils/chatErrors";

function AssistantAvatar() {
  return (
    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-accent text-white" aria-hidden="true">
      <Compass className="size-4" />
    </span>
  );
}

export function ChatMessage({
  message,
  onRetry,
  onShowResult,
  retryDisabled,
}: {
  message: ChatMessageData;
  onRetry: (id: string) => void;
  onShowResult: () => void;
  retryDisabled: boolean;
}) {
  const { t, locale } = useLanguage();
  const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(message.createdAt);

  if (message.role === "user") {
    return (
      <li className="flex animate-fade-in-up justify-end">
        <div className="max-w-[85%]">
          <p className="sr-only">{t("chat.you")}:</p>
          <div className="whitespace-pre-wrap break-words rounded-3xl rounded-br-lg bg-ink px-4 py-2.5 text-[15px] leading-relaxed text-surface [overflow-wrap:anywhere]">
            {message.text}
          </div>
          <p className="mt-1 text-right text-[11px] text-ink-muted">{time}</p>
        </div>
      </li>
    );
  }

  if (message.role === "error" && message.error) {
    const { title, detail } = describeChatError(message.error, t);
    return (
      <li className="flex animate-fade-in-up gap-3">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-danger-soft text-danger" aria-hidden="true">
          <CircleAlert className="size-4" />
        </span>
        <div className="max-w-[85%] rounded-3xl rounded-tl-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm">
          <p className="font-semibold text-danger">{title}</p>
          <p className="mt-0.5 text-ink-secondary">{detail}</p>
          {message.retryText && (
            <button
              type="button"
              onClick={() => onRetry(message.id)}
              disabled={retryDisabled}
              className="focus-ring mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              {t("chat.retry")}
            </button>
          )}
        </div>
      </li>
    );
  }

  const text = message.text || (message.hasResult ? t("chat.resultOnly") : t("chat.emptyReply"));
  return (
    <li className="flex animate-fade-in-up gap-3">
      <AssistantAvatar />
      <div className="min-w-0 max-w-[85%]">
        <p className="sr-only">{t("chat.assistant")}:</p>
        <div className="rounded-3xl rounded-tl-lg bg-surface-muted px-4 py-3 text-[15px] leading-relaxed text-ink">
          <RichText text={text} />
        </div>
        <div className="mt-1 flex items-center gap-3">
          <p className="text-[11px] text-ink-muted">{time}</p>
          {message.hasResult && (
            <button
              type="button"
              onClick={onShowResult}
              className="focus-ring inline-flex items-center gap-1 rounded-full text-xs font-semibold text-accent-ink hover:underline"
            >
              {t("chat.showResult")}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

export function TypingIndicator() {
  const { t } = useLanguage();
  return (
    <li className="flex animate-fade-in-up gap-3" role="status">
      <AssistantAvatar />
      <div className="flex items-center gap-2.5 rounded-3xl rounded-tl-lg bg-surface-muted px-4 py-3">
        <span className="flex gap-1" aria-hidden="true">
          <span className="size-1.5 animate-bounce rounded-full bg-ink-muted [animation-delay:-0.3s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-ink-muted [animation-delay:-0.15s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-ink-muted" />
        </span>
        <span className="text-sm text-ink-secondary">{t("chat.thinking")}</span>
      </div>
    </li>
  );
}
