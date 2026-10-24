import type { ParsedAiMessage } from "@/app/types/aiChat";
import type { CurrentDataDay, HistoryAndForecastDay } from "@/app/types/interfaces";
import type { Hotel } from "@/app/types/hotelTypes";

export type WeatherResult =
  | { kind: "current"; current: CurrentDataDay }
  | { kind: "forecast" | "history"; days: HistoryAndForecastDay[] };

export interface ResultMeta {
  city: string | null;
  date: string | null;
  dateRange: string | null;
}

/** What the results panel renders — one variant per view, no guessing in components. */
export type ResultView =
  | { type: "weather"; meta: ResultMeta; weather: WeatherResult }
  | { type: "hotels"; meta: ResultMeta; hotels: Hotel[] }
  | { type: "combined"; meta: ResultMeta; weather: WeatherResult | null; hotels: Hotel[] };

export type ResultKind = "current" | "forecast" | "history" | "hotels" | "combined";

export function resultKind(view: ResultView): ResultKind {
  if (view.type === "weather") return view.weather.kind;
  return view.type;
}

export function toResultView({ metaData, aiChatData }: ParsedAiMessage): ResultView | null {
  if (!aiChatData) return null;

  const meta: ResultMeta = {
    city: metaData?.city ?? null,
    date: metaData?.date ?? null,
    dateRange: metaData?.date_range ?? null,
  };

  const days = aiChatData.days?.length ? aiChatData.days : null;
  const daysKind = metaData?.kind === "history" || aiChatData.weatherKind === "history" ? "history" : "forecast";

  if (metaData?.kind === "combined" || aiChatData.weatherKind !== undefined) {
    const weather: WeatherResult | null =
      aiChatData.weatherKind === "current" && aiChatData.current
        ? { kind: "current", current: aiChatData.current }
        : days
          ? { kind: daysKind, days }
          : null;
    return { type: "combined", meta, weather, hotels: aiChatData.hotels ?? [] };
  }

  if (aiChatData.hotels) return { type: "hotels", meta, hotels: aiChatData.hotels };
  if (aiChatData.current) return { type: "weather", meta, weather: { kind: "current", current: aiChatData.current } };
  if (days) return { type: "weather", meta, weather: { kind: daysKind, days } };
  return null;
}
