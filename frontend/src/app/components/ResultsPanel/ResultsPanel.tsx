import { forwardRef } from "react";
import { ArrowRight, BedDouble, CloudSun, Lightbulb, type LucideIcon } from "lucide-react";
import { CombinedView } from "@/app/components/CombinedView/CombinedView";
import { DestinationHeader } from "@/app/components/DestinationHeader/DestinationHeader";
import { HotelList } from "@/app/components/HotelList/HotelList";
import { WeatherResult } from "@/app/components/WeatherResult/WeatherResult";
import { useLanguage } from "@/app/hooks/useLanguage";
import { resultKind, type ResultView } from "@/app/utils/resultView";

const STARTERS: { icon: LucideIcon; key: "weather" | "ideas" | "stays" }[] = [
  { icon: CloudSun, key: "weather" },
  { icon: Lightbulb, key: "ideas" },
  { icon: BedDouble, key: "stays" },
];

function EmptyBoard({ onPrompt, disabled }: { onPrompt: (text: string) => void; disabled: boolean }) {
  const { t } = useLanguage();
  return (
    <div>
      <h2 className="text-2xl font-bold">{t("results.empty.title")}</h2>
      <p className="mt-1 max-w-xl text-balance text-ink-secondary">{t("results.empty.subtitle")}</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        {STARTERS.map(({ icon: Icon, key }) => {
          const prompt = t(`results.empty.${key}.prompt`);
          return (
            <li key={key}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPrompt(prompt)}
                className="focus-ring group flex h-full w-full flex-col rounded-3xl border border-line bg-surface p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-pill-hover disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-accent-soft text-accent-ink">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="mt-4 font-semibold text-ink">{t(`results.empty.${key}.title`)}</span>
                <span className="mt-1 text-sm text-ink-secondary">{t(`results.empty.${key}.text`)}</span>
                {/* mt-auto pins the example to the bottom so the three cards line up. */}
                <span className="mt-auto block pt-5">
                  <span className="eyebrow block">{t("results.empty.try")}</span>
                  <span className="mt-2 flex items-start gap-2 rounded-2xl bg-surface-muted px-3.5 py-3 text-sm text-ink">
                    <span className="flex-1">“{prompt}”</span>
                    <ArrowRight
                      className="mt-0.5 size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function LoadingBoard() {
  const { t } = useLanguage();
  return (
    <div role="status" className="space-y-4">
      <span className="sr-only">{t("results.loading")}</span>
      <div className="h-6 w-28 animate-pulse rounded-full bg-surface-muted" />
      <div className="h-10 w-2/3 animate-pulse rounded-xl bg-surface-muted" />
      <div className="h-52 animate-pulse rounded-3xl bg-surface-muted" />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-muted" />
        ))}
      </div>
    </div>
  );
}

export const ResultsPanel = forwardRef<
  HTMLElement,
  { result: ResultView | null; isLoading: boolean; onPrompt: (text: string) => void }
>(function ResultsPanel({ result, isLoading, onPrompt }, ref) {
  const { t } = useLanguage();

  let content;
  if (!result) {
    content = isLoading ? <LoadingBoard /> : <EmptyBoard onPrompt={onPrompt} disabled={isLoading} />;
  } else {
    content = (
      // While a new answer loads, the previous board stays in place, dimmed — no layout jump.
      <div className={`space-y-6 transition-opacity ${isLoading ? "opacity-60" : ""}`} aria-busy={isLoading}>
        <DestinationHeader kind={resultKind(result)} meta={result.meta} />
        {result.type === "weather" && <WeatherResult weather={result.weather} />}
        {result.type === "hotels" && <HotelList hotels={result.hotels} dateRange={result.meta.dateRange} />}
        {result.type === "combined" && (
          <CombinedView weather={result.weather} hotels={result.hotels} dateRange={result.meta.dateRange} />
        )}
      </div>
    );
  }

  return (
    <section ref={ref} tabIndex={-1} aria-label={t("results.label")} className="min-w-0 scroll-mt-24 outline-none">
      {content}
    </section>
  );
});
