export type UnitSystemId = "US" | "METRIC" | "UK";

export interface UnitSystem {
  unit: UnitSystemId;
  temperature: "°C" | "°F";
  distance: "km/h" | "mph";
}

// Weather values arrive in metric units (°C, km/h, hPa, %) — conversion to the
// selected unit system happens only at display time.
export interface CurrentDataDay {
  temp: number | null;
  tempmax: number | null;
  tempmin: number | null;
  winddir: number | null;
  windspeed: number | null;
  conditions: string | null;
  sunrise: string | null;
  sunset: string | null;
  pressure: number | null;
  humidity: number | null;
}

export interface HistoryAndForecastDay extends CurrentDataDay {
  datetime: string | null;
}

export type MessageRole = "user" | "ai" | "error";

export type ChatErrorKind =
  | "network"
  | "timeout"
  | "rateLimited"
  | "server"
  | "invalidResponse"
  | "backend";

export interface ChatError {
  kind: ChatErrorKind;
  // Backend-provided reason (already human readable); null for transport errors.
  detail: string | null;
  status?: number;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  createdAt: Date;
  // Set on AI replies that carried structured data shown in the results panel.
  hasResult?: boolean;
  // Set on error entries so the failed message can be re-sent.
  error?: ChatError;
  retryText?: string;
}

export type ChatResult =
  | { ok: true; message: string; sessionId: string | null }
  | { ok: false; error: ChatError | { kind: "aborted" }; sessionId: string | null };
