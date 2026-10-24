import { useCallback, useRef } from "react";
import { ChatPanel } from "@/app/components/ChatPanel/ChatPanel";
import { ErrorMessage } from "@/app/components/ErrorMessage/ErrorMessage";
import { ResultsPanel } from "@/app/components/ResultsPanel/ResultsPanel";
import { TripSearch } from "@/app/components/TripSearch/TripSearch";
import { useChat } from "@/app/hooks/useChat";
import { useLanguage } from "@/app/hooks/useLanguage";
import { describeChatError } from "@/app/utils/chatErrors";

export function PlannerPage() {
  const { t } = useLanguage();
  const chat = useChat();
  const resultsRef = useRef<HTMLElement>(null);

  // On phones the board sits below the chat; jump there and move focus with it.
  const showResult = useCallback(() => {
    const results = resultsRef.current;
    if (!results) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    results.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    results.focus({ preventScroll: true });
  }, []);

  const error = chat.error ? describeChatError(chat.error, t) : null;

  return (
    <>
      {error && <ErrorMessage title={error.title} detail={error.detail} onClose={chat.dismissError} />}

      <div className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1440px] px-4 pb-6 pt-8 sm:px-6 md:pb-8 md:pt-10 lg:px-10">
          <div className="mb-6 text-center md:mb-7">
            <h1 className="text-3xl font-bold text-ink sm:text-4xl">{t("hero.title")}</h1>
            <p className="mx-auto mt-2 max-w-xl text-balance text-ink-secondary">{t("hero.subtitle")}</p>
          </div>
          <TripSearch onSearch={chat.send} disabled={chat.isSending} />
        </div>
      </div>

      <div className="mx-auto grid max-w-[1440px] items-start gap-6 px-4 py-6 sm:px-6 md:py-8 lg:grid-cols-[minmax(22rem,5fr)_7fr] lg:gap-8 lg:px-10">
        <ChatPanel
          chat={chat}
          onShowResult={showResult}
          className="h-[min(70dvh,40rem)] lg:sticky lg:top-24 lg:h-[calc(100dvh-8rem)] lg:max-h-[52rem]"
        />
        <ResultsPanel ref={resultsRef} result={chat.result} isLoading={chat.isSending} onPrompt={chat.send} />
      </div>
    </>
  );
}
