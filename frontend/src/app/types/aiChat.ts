import type { CurrentDataDay, HistoryAndForecastDay } from "@/app/types/interfaces";
import type { Hotel } from "@/app/types/hotelTypes";

export type AiKind = 'current' | 'forecast' | 'history' | 'hotels' | 'combined' | null;

export type AiWeatherKind = 'current' | 'forecast' | 'history' | null;

export type AiMeta = {
  city: string | null;
  date: string | null;
  date_range: string | null;
  kind: AiKind;
  language?: string | null;
};

export type AiChatData = {
  current?: CurrentDataDay;
  days?: HistoryAndForecastDay[];
  hotels?: Hotel[];
  // Only set for combined ('kind: combined') responses, to disambiguate
  // whether `current` or `days` holds the weather half of the payload.
  weatherKind?: AiWeatherKind;
};

export type ParsedAiMessage = {
  humanText: string;
  metaData: AiMeta | null;
  aiChatData: AiChatData | null;
};
