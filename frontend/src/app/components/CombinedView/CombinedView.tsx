import { useContext, useState } from "react";
import { LanguageContext } from "@/app/contexts/LanguageContext";
import { WeatherView } from "@/app/components/WeatherView/WeatherView";
import { List } from "@/app/components/List/List";
import { HotelView } from "@/app/components/HotelView/HotelView";
import type { AiWeatherKind } from "@/app/types/aiChat";
import type { CurrentDataDay, HistoryAndForecastDay } from "@/app/types/interfaces";
import type { Hotel } from "@/app/types/hotelTypes";

type CombinedTab = "weather" | "hotels";

export function CombinedView({
  weatherKind,
  current,
  days,
  hotels,
  city,
  date,
  dateRange,
}: {
  weatherKind: AiWeatherKind;
  current?: CurrentDataDay;
  days?: HistoryAndForecastDay[];
  hotels: Hotel[];
  city: string | null;
  date: string | null;
  dateRange: string | null;
}) {
  const lang = useContext(LanguageContext);
  const hasWeather = (weatherKind === "current" && !!current) || (Array.isArray(days) && days.length > 0);
  const hasHotels = hotels.length > 0;
  const [activeTab, setActiveTab] = useState<CombinedTab>(hasWeather ? "weather" : "hotels");

  return (
    <div className="space-y-3">
      {/* Weather / Hotels toggle */}
      <div className="flex bg-white/[0.06] border border-white/[0.1] rounded-2xl p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("weather")}
          disabled={!hasWeather}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
            activeTab === "weather"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
              : "text-sky-300/60 hover:text-white"
          }`}
        >
          {lang?.t("combined.weatherTab") || "Weather"}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("hotels")}
          disabled={!hasHotels}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
            activeTab === "hotels"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
              : "text-sky-300/60 hover:text-white"
          }`}
        >
          {lang?.t("combined.hotelsTab") || "Hotels"}
          {hasHotels && ` (${hotels.length})`}
        </button>
      </div>

      {activeTab === "weather" ? (
        hasWeather ? (
          <div className="space-y-4">
            {(city || date || dateRange) && (
              <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-3xl px-6 py-5 flex items-center justify-between gap-4">
                <div>
                  {city && <h3 className="text-xl font-bold text-white">{city}</h3>}
                  {(date || dateRange) && (
                    <p className="text-sky-300/60 text-sm mt-0.5">{date || dateRange}</p>
                  )}
                </div>
                <span className="text-2xl opacity-40 select-none flex-shrink-0">📍</span>
              </div>
            )}
            {weatherKind === "current" && current ? (
              <WeatherView data={current} address={city} whereFrom="chat" />
            ) : Array.isArray(days) && days.length > 0 ? (
              <List data={days} />
            ) : null}
          </div>
        ) : (
          <p className="text-sky-400/40 text-sm italic px-1">
            {lang?.t("combined.noWeather") || "No weather data available"}
          </p>
        )
      ) : hasHotels ? (
        <HotelView hotels={hotels} city={city} dateRange={dateRange} />
      ) : (
        <p className="text-sky-400/40 text-sm italic px-1">
          {lang?.t("combined.noHotels") || "No hotels found"}
        </p>
      )}
    </div>
  );
}
