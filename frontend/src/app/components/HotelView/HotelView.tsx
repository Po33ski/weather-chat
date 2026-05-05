import { useContext } from "react";
import { LanguageContext } from "@/app/contexts/LanguageContext";
import type { Hotel } from "@/app/types/hotelTypes";

function StarRating({ rating }: { rating: number }) {
  const clamped = Math.min(10, Math.max(0, rating));
  const outOf10 = clamped.toFixed(1);
  const colorClass =
    clamped >= 9 ? "text-emerald-400" :
    clamped >= 8 ? "text-green-400" :
    clamped >= 7 ? "text-amber-400" :
    "text-orange-400";

  return (
    <span className={`font-bold text-lg tabular-nums ${colorClass}`}>
      {outOf10}
      <span className="text-sky-400/40 text-xs font-normal">/10</span>
    </span>
  );
}

function HotelCard({ hotel, index }: { hotel: Hotel; index: number }) {
  const lang = useContext(LanguageContext);
  const hasPrice = hotel.price_per_night !== "" && hotel.price_per_night !== null;

  return (
    <div className="bg-white/[0.08] hover:bg-white/[0.11] backdrop-blur-xl border border-white/[0.12] hover:border-white/[0.22] rounded-3xl p-5 transition-all duration-300">
      {/* Top row: index + name + availability badge */}
      <div className="flex items-start gap-3 mb-4">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/25 text-blue-300 text-xs font-bold flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-bold text-base leading-snug">{hotel.name}</h4>
        </div>
        {hotel.availability === "available" ? (
          <span className="flex-shrink-0 text-emerald-400 text-[11px] font-semibold bg-emerald-400/15 border border-emerald-400/20 px-2.5 py-1 rounded-full">
            {lang?.t("hotel.available") || "Available"}
          </span>
        ) : (
          <span className="flex-shrink-0 text-sky-400/50 text-[11px] font-medium bg-white/[0.06] px-2.5 py-1 rounded-full">
            {lang?.t("hotel.unavailable") || "Unknown"}
          </span>
        )}
      </div>

      {/* Price + Rating row */}
      <div className="flex items-end justify-between gap-4 mb-4 pb-4 border-b border-white/[0.07]">
        {/* Price */}
        <div>
          {hasPrice ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-white tabular-nums leading-none">
                {hotel.price_per_night}
              </span>
              {hotel.currency && (
                <span className="text-sky-300/70 text-sm font-semibold">{hotel.currency}</span>
              )}
              <span className="text-sky-400/50 text-xs">{lang?.t("hotel.perNight") || "/ night"}</span>
            </div>
          ) : (
            <span className="text-sky-400/40 text-sm italic">
              {lang?.t("hotel.noPrice") || "Price not available"}
            </span>
          )}
        </div>

        {/* Rating + reviews */}
        {hotel.rating !== null && (
          <div className="flex flex-col items-end gap-0.5">
            <StarRating rating={hotel.rating} />
            {hotel.reviews_count !== null && (
              <span className="text-sky-400/50 text-[11px]">
                {hotel.reviews_count.toLocaleString()} {lang?.t("hotel.reviews") || "reviews"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Highlights */}
      {hotel.highlights.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {hotel.highlights.map((h, i) => (
            <span
              key={i}
              className="text-[11px] text-sky-300/75 bg-sky-400/[0.09] border border-sky-400/10 rounded-lg px-2.5 py-1 leading-none"
            >
              {h}
            </span>
          ))}
        </div>
      )}

      {/* Booking link */}
      {hotel.url && (
        <a
          href={hotel.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/20 hover:border-blue-400/35 rounded-xl px-3.5 py-2 transition-all duration-200"
        >
          {lang?.t("hotel.book") || "View offer"}
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  );
}

export function HotelView({ hotels, city, dateRange }: { hotels: Hotel[]; city: string | null; dateRange: string | null }) {
  const lang = useContext(LanguageContext);

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-2xl">🏨</span>
        <div>
          <p className="text-[11px] text-sky-400/60 font-semibold uppercase tracking-wider">
            {lang?.t("hotel.resultsFor") || "Hotels in"}
          </p>
          {city && <p className="text-white font-bold text-lg leading-tight">{city}</p>}
          {dateRange && (
            <p className="text-sky-300/50 text-xs mt-0.5">{dateRange}</p>
          )}
        </div>
      </div>

      {/* Hotel cards */}
      {hotels.map((hotel, i) => (
        <HotelCard key={i} hotel={hotel} index={i} />
      ))}
    </div>
  );
}
