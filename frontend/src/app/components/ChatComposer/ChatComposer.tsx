import { useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";
import { MAX_MESSAGE_LENGTH, MESSAGE_COUNTER_THRESHOLD } from "@/app/constants/chat";
import { useLanguage } from "@/app/hooks/useLanguage";
import { formatNumber } from "@/app/utils/format";

const MAX_TEXTAREA_HEIGHT = 160;

export function ChatComposer({
  onSend,
  isSending,
}: {
  onSend: (text: string) => Promise<boolean>;
  isSending: boolean;
}) {
  const { t, locale } = useLanguage();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const trimmed = value.trim();
  // Typing stays enabled while a reply is pending; only submitting is blocked.
  const canSend = trimmed.length > 0 && trimmed.length <= MAX_MESSAGE_LENGTH && !isSending;

  // Grow with the content up to a cap, then scroll inside.
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [value]);

  const submit = () => {
    if (!canSend) return;
    const text = value;
    setValue("");
    void onSend(text).then((accepted) => {
      // A refused submit (e.g. a race with another send) must not lose the draft.
      if (!accepted) setValue((current) => current || text);
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Don't hijack Enter while an IME (e.g. Japanese, Chinese) is composing.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  const showCounter = value.length >= MESSAGE_COUNTER_THRESHOLD;

  return (
    <form onSubmit={handleSubmit} className="border-t border-line p-3 sm:p-4">
      <div className="flex items-end gap-2 rounded-3xl border border-line-strong bg-surface py-1.5 pl-4 pr-1.5 transition-shadow focus-within:border-ink focus-within:shadow-pill">
        <label htmlFor="chat-input" className="sr-only">
          {t("chat.inputLabel")}
        </label>
        <textarea
          id="chat-input"
          ref={textareaRef}
          rows={1}
          value={value}
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("chat.placeholder")}
          aria-describedby="chat-input-hint"
          className="scrollbar-thin max-h-40 min-h-[2.5rem] flex-1 resize-none bg-transparent py-2 text-[15px] leading-6 text-ink outline-none placeholder:text-ink-muted"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label={t("chat.send")}
          className="focus-ring grid size-10 shrink-0 place-items-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-ink-muted"
        >
          <ArrowUp className="size-5" strokeWidth={2.25} aria-hidden="true" />
        </button>
      </div>
      <div className="mt-1.5 flex justify-between gap-3 px-2 text-[11px] text-ink-muted">
        <p id="chat-input-hint" className="hidden sm:block">
          {t("chat.keyboardHint")}
        </p>
        {showCounter && (
          <p className="ml-auto tabular-nums" aria-live="polite">
            {t("chat.charCount", {
              count: formatNumber(value.length, locale),
              max: formatNumber(MAX_MESSAGE_LENGTH, locale),
            })}
          </p>
        )}
      </div>
    </form>
  );
}
