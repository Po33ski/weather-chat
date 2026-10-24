import { ExternalLink, Star } from "lucide-react";
import { useLanguage } from "@/app/hooks/useLanguage";
import type { Hotel } from "@/app/types/hotelTypes";
import type { TranslationKey } from "@/app/i18n/translations";
import { displayHost, formatNumber, formatPrice, parseAmount, safeHttpUrl } from "@/app/utils/format";

// Decorative cover tints (not data) picked by a stable hash of the name, so a
// hotel keeps its color across renders and re-searches.
const COVERS = [
  "bg-[#f3ece2] text-[#7a5b3a] dark:bg-[#3a3128] dark:text-[#e8d5bd]",
  "bg-[#e6eee8] text-[#3f6650] dark:bg-[#24332a] dark:text-[#c3dccb]",
  "bg-[#e5edf5] text-[#3c5a7a] dark:bg-[#232f3b] dark:text-[#c2d4e6]",
  "bg-[#f4e6e8] text-[#86414d] dark:bg-[#3a2529] dark:text-[#ecc6cc]",
];

function coverFor(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return COVERS[hash % COVERS.length];
}

function initials(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w && !/^(hotel|the|apartments?|hostel)$/i.test(w));
  const letters = (words.length ? words : name.split(/\s+/)).slice(0, 2).map((w) => w.charAt(0));
  return letters.join("").toUpperCase() || "H";
}

function ratingLabel(rating: number): TranslationKey {
  if (rating >= 9) return "hotel.rating.exceptional";
  if (rating >= 8) return "hotel.rating.veryGood";
  if (rating >= 7) return "hotel.rating.good";
  return "hotel.rating.other";
}

export function HotelCard({ hotel, nights }: { hotel: Hotel; nights: number | null }) {
  const { t, tp, locale } = useLanguage();
  const amount = parseAmount(hotel.price_per_night);
  const url = safeHttpUrl(hotel.url);
  const highlights = [...new Set(hotel.highlights.map((h) => h.trim()).filter(Boolean))].slice(0, 4);

  return (
    <article className="card flex flex-col gap-4 p-4 transition-shadow hover:shadow-pill-hover sm:flex-row sm:p-5">
      <div
        className={`grid h-28 shrink-0 place-items-center rounded-2xl text-2xl font-bold tracking-wide sm:h-auto sm:w-28 ${coverFor(hotel.name)}`}
        aria-hidden="true"
      >
        {initials(hotel.name)}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-base font-semibold leading-snug text-ink">{hotel.name}</h4>
          {hotel.rating !== null && (
            <p
              className="flex shrink-0 items-center gap-1 text-sm font-semibold text-ink"
              aria-label={t("hotel.rating", { value: formatNumber(hotel.rating, locale, 1) })}
            >
              <Star className="size-3.5 fill-current" aria-hidden="true" />
              {formatNumber(hotel.rating, locale, 1)}
            </p>
          )}
        </div>

        <p className="mt-1 text-sm text-ink-muted">
          {hotel.rating !== null && t(ratingLabel(hotel.rating))}
          {hotel.rating !== null && hotel.reviews_count !== null && " · "}
          {hotel.reviews_count !== null && tp("plural.review", hotel.reviews_count)}
        </p>

        {highlights.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {highlights.map((highlight) => (
              <li key={highlight} className="rounded-full bg-surface-muted px-2.5 py-1 text-xs text-ink-secondary">
                {highlight}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-line pt-4">
          <div>
            {amount !== null ? (
              <>
                <p className="text-ink">
                  <span className="text-lg font-semibold">{formatPrice(amount, hotel.currency, locale)}</span>
                  <span className="text-sm text-ink-secondary"> / {t("hotel.perNight")}</span>
                </p>
                {nights !== null && nights > 1 && (
                  <p className="text-sm text-ink-muted">
                    {t("hotel.total", { amount: formatPrice(amount * nights, hotel.currency, locale) })} ·{" "}
                    {tp("plural.night", nights)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-ink-muted">{t("hotel.noPrice")}</p>
            )}
            <p
              className={`mt-1 inline-flex items-center gap-1.5 text-xs font-medium ${
                hotel.availability === "available" ? "text-success" : "text-ink-muted"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${hotel.availability === "available" ? "bg-success" : "bg-ink-muted"}`}
                aria-hidden="true"
              />
              {hotel.availability === "available" ? t("hotel.available") : t("hotel.unknown")}
            </p>
          </div>

          {url && (
            <a
              href={url.href}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-surface transition-opacity hover:opacity-90"
            >
              {displayHost(url) ? t("hotel.view", { host: displayHost(url) }) : t("hotel.viewGeneric")}
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
