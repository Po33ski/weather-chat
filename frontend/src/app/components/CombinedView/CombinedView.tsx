import { BedDouble, CloudSun } from "lucide-react";
import { HotelList } from "@/app/components/HotelList/HotelList";
import { WeatherResult } from "@/app/components/WeatherResult/WeatherResult";
import { useLanguage } from "@/app/hooks/useLanguage";
import type { Hotel } from "@/app/types/hotelTypes";
import type { WeatherResult as WeatherResultData } from "@/app/utils/resultView";

/**
 * Trip plan: weather and stays as two stacked sections of one board. Either
 * half may be missing (the agent falls back on partial failures).
 */
export function CombinedView({
  weather,
  hotels,
  dateRange,
}: {
  weather: WeatherResultData | null;
  hotels: Hotel[];
  dateRange: string | null;
}) {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <section aria-labelledby="combined-weather" className="space-y-4">
        <h3 id="combined-weather" className="flex items-center gap-2 text-xl font-semibold">
          <CloudSun className="size-5 text-ink-muted" aria-hidden="true" />
          {t("combined.weather")}
        </h3>
        {weather ? (
          <WeatherResult weather={weather} />
        ) : (
          <p className="card p-5 text-ink-secondary">{t("combined.noWeather")}</p>
        )}
      </section>

      <section aria-labelledby="combined-stays" className="space-y-4">
        <h3 id="combined-stays" className="flex items-center gap-2 text-xl font-semibold">
          <BedDouble className="size-5 text-ink-muted" aria-hidden="true" />
          {t("combined.stays")}
          {hotels.length > 0 && <span className="text-base font-normal text-ink-muted">({hotels.length})</span>}
        </h3>
        <HotelList hotels={hotels} dateRange={dateRange} />
      </section>
    </div>
  );
}
