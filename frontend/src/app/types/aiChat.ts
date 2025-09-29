import type { CurrentDataDay, HistoryAndForecastDay } from "@/app/types/interfaces";

export type AiKind = 'current' | 'forecast' | 'history' | null;

export type AiMeta = {
  city: string | null;
  date: string | null;
  date_range: string | null;
  kind: AiKind;
  language?: string | null;
  unit_system?: string | null;
};

export type AiChatData = {
  current?: CurrentDataDay;
  days?: HistoryAndForecastDay[];
};

export type ParsedAiMessage = {
  humanText: string;
  metaData: AiMeta | null;
  aiChatData: AiChatData | null;
};


