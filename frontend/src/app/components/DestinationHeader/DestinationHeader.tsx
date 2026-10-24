import { BedDouble, CalendarDays, History, MapPin, Route, Thermometer, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/app/hooks/useLanguage";
import { diffInDays, formatDate, formatDateRange, parseDateRange } from "@/app/utils/format";
import type { ResultKind, ResultMeta } from "@/app/utils/resultView";

const KIND_ICONS: Record<ResultKind, LucideIcon> = {
  current: Thermometer,
  forecast: CalendarDays,
  history: History,
  hotels: BedDouble,
  combined: Route,
};

export function DestinationHeader({ kind, meta }: { kind: ResultKind; meta: ResultMeta }) {
  const { t, tp, locale } = useLanguage();
  const KindIcon = KIND_ICONS[kind];
  const range = parseDateRange(meta.dateRange);

  let when: string | null = null;
  if (range) {
    const span = diffInDays(range.start, range.end);
    // Stays count nights; weather counts calendar days (both ends inclusive).
    const length = kind === "hotels" ? (span > 0 ? tp("plural.night", span) : null) : tp("plural.day", span + 1);
    when = [formatDateRange(range.start, range.end, locale), length].filter(Boolean).join(" · ");
  } else if (meta.date) {
    when = formatDate(meta.date, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <header>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-ink">
        <KindIcon className="size-3.5" aria-hidden="true" />
        {t(`kind.${kind}`)}
      </span>
      <h2 className="mt-3 flex items-center gap-2 text-3xl font-bold text-ink sm:text-4xl">
        <MapPin className="size-6 shrink-0 text-ink-muted sm:size-7" aria-hidden="true" />
        <span className="min-w-0 break-words">{meta.city ?? t("weather.unknown")}</span>
      </h2>
      {when && (
        <p className="mt-2 flex items-center gap-1.5 text-ink-secondary">
          <CalendarDays className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
          <span className="first-letter:uppercase">{when}</span>
        </p>
      )}
    </header>
  );
}
