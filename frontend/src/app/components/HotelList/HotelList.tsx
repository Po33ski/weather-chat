import { BedDouble } from "lucide-react";
import { HotelCard } from "@/app/components/HotelCard/HotelCard";
import { useLanguage } from "@/app/hooks/useLanguage";
import type { Hotel } from "@/app/types/hotelTypes";
import { diffInDays, parseDateRange } from "@/app/utils/format";

export function HotelList({ hotels, dateRange }: { hotels: Hotel[]; dateRange: string | null }) {
  const { t } = useLanguage();
  const range = parseDateRange(dateRange);
  const nights = range ? diffInDays(range.start, range.end) : null;

  if (hotels.length === 0) {
    return (
      <div className="card flex items-center gap-3 p-5 text-ink-secondary">
        <BedDouble className="size-5 shrink-0 text-ink-muted" aria-hidden="true" />
        {t("hotel.none")}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {hotels.map((hotel, i) => (
        <li key={`${hotel.name}-${i}`}>
          <HotelCard hotel={hotel} nights={nights && nights > 0 ? nights : null} />
        </li>
      ))}
    </ul>
  );
}
