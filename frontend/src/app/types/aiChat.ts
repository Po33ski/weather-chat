import type { CurrentDataDay, HistoryAndForecastDay } from "@/app/types/interfaces";
import type { Hotel } from "@/app/types/hotelTypes";

export type AiKind = 'current' | 'forecast' | 'history' | 'hotels' | null;

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
};

export type ParsedAiMessage = {
  humanText: string;
  metaData: AiMeta | null;
  aiChatData: AiChatData | null;
};
