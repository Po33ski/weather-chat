import type { AiChatData, AiKind, AiMeta, AiWeatherKind, ParsedAiMessage } from "@/app/types/aiChat";
import type { CurrentDataDay, HistoryAndForecastDay } from "@/app/types/interfaces";
import type { Hotel } from "@/app/types/hotelTypes";
import { normalizeIsoDate, safeHttpUrl } from "./format";

type FenceType = "combined-json" | "weather-json" | "hotel-json";

// Order matters: a combined reply is checked first so its nested weather data
// is never mistaken for a single-intent weather-json block.
const FENCES: [FenceType, RegExp][] = [
  ["combined-json", /```\s*combined-json[\r\n]+([\s\S]*?)```/i],
  ["weather-json", /```\s*weather-json[\r\n]+([\s\S]*?)```/i],
  ["hotel-json", /```\s*hotel-json[\r\n]+([\s\S]*?)```/i],
];

const AI_KINDS: readonly NonNullable<AiKind>[] = ["current", "forecast", "history", "hotels", "combined"];
const WEATHER_KINDS: readonly NonNullable<AiWeatherKind>[] = ["current", "forecast", "history"];

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asObject = (value: unknown): JsonObject => (isObject(value) ? value : {});

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

// The backend validates floats, but numeric strings ("1013") are accepted too
// so a lenient payload still renders instead of showing dashes.
function asNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function extractBlock(text: string): {
  jsonText: string | null;
  fenceType: FenceType | null;
  humanText: string;
} {
  for (const [fenceType, pattern] of FENCES) {
    const match = text.match(pattern);
    if (match) {
      return { jsonText: match[1], fenceType, humanText: text.replace(pattern, "").trim() };
    }
  }
  return { jsonText: null, fenceType: null, humanText: text.trim() };
}

function mapCurrent(raw: unknown): CurrentDataDay {
  const c = asObject(raw);
  return {
    temp: asNumber(c.temp),
    tempmax: asNumber(c.tempmax),
    tempmin: asNumber(c.tempmin),
    winddir: asNumber(c.winddir),
    windspeed: asNumber(c.windspeed),
    conditions: asString(c.conditions),
    sunrise: asString(c.sunrise),
    sunset: asString(c.sunset),
    pressure: asNumber(c.pressure),
    humidity: asNumber(c.humidity),
  };
}

function mapDays(raw: unknown[]): HistoryAndForecastDay[] {
  const days = raw.filter(isObject).map((d) => ({
    ...mapCurrent(d),
    datetime: normalizeIsoDate(d.datetime),
  }));
  // Charts read left to right in time; keep the agent's order only if a date is missing.
  return days.every((d) => d.datetime)
    ? [...days].sort((a, b) => (a.datetime as string).localeCompare(b.datetime as string))
    : days;
}

function mapHotels(raw: unknown[]): Hotel[] {
  return raw.filter(isObject).map((h) => {
    const rating = asNumber(h.rating);
    const reviews = asNumber(h.reviews_count);
    const price = typeof h.price_per_night === "number" ? String(h.price_per_night) : h.price_per_night;
    return {
      name: asString(h.name) ?? "",
      price_per_night: asString(price) ?? "",
      currency: asString(h.currency)?.toUpperCase() ?? "",
      availability: h.availability === "available" ? "available" : "unknown",
      rating: rating !== null && rating >= 0 && rating <= 10 ? rating : null,
      reviews_count: reviews !== null && reviews >= 0 ? Math.round(reviews) : null,
      highlights: Array.isArray(h.highlights)
        ? h.highlights.map(asString).filter((s): s is string => s !== null)
        : [],
      url: safeHttpUrl(asString(h.url))?.href ?? "",
    };
  });
}

function asKind<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

export function parseAiMessage(text: string): ParsedAiMessage {
  const { jsonText, fenceType, humanText } = extractBlock(text || "");
  if (!jsonText) return { humanText, metaData: null, aiChatData: null };

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { humanText, metaData: null, aiChatData: null };
  }
  if (!isObject(parsed)) return { humanText, metaData: null, aiChatData: null };

  const rawMeta = asObject(parsed.meta);
  const meta: AiMeta = {
    city: asString(rawMeta.city),
    date: normalizeIsoDate(rawMeta.date),
    date_range: asString(rawMeta.date_range),
    kind: asKind(rawMeta.kind, AI_KINDS),
    language: asString(rawMeta.language),
  };

  let aiChatData: AiChatData | null = null;

  if (fenceType === "combined-json" || meta.kind === "combined") {
    const weather = asObject(parsed.weather);
    const weatherKind = asKind(weather.kind, WEATHER_KINDS);
    const combined: AiChatData = { weatherKind };
    if (weatherKind === "current" && isObject(weather.current)) {
      combined.current = mapCurrent(weather.current);
    } else if ((weatherKind === "forecast" || weatherKind === "history") && Array.isArray(weather.days)) {
      combined.days = mapDays(weather.days);
    }
    if (Array.isArray(parsed.hotels)) {
      combined.hotels = mapHotels(parsed.hotels);
    }
    aiChatData = combined;
  } else if (fenceType === "hotel-json" || meta.kind === "hotels") {
    if (Array.isArray(parsed.hotels)) {
      aiChatData = { hotels: mapHotels(parsed.hotels) };
    }
  } else if (meta.kind === "current" && isObject(parsed.current)) {
    aiChatData = { current: mapCurrent(parsed.current) };
  } else if ((meta.kind === "forecast" || meta.kind === "history") && Array.isArray(parsed.days)) {
    aiChatData = { days: mapDays(parsed.days) };
  }

  return { humanText, metaData: meta, aiChatData };
}
