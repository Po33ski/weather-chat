import type { AiMeta, AiChatData, ParsedAiMessage } from "@/app/types/aiChat";
import type { CurrentDataDay, HistoryAndForecastDay } from "@/app/types/interfaces";
import type { Hotel } from "@/app/types/hotelTypes";

const COMBINED_FENCE = /```\s*combined-json[\r\n]+([\s\S]*?)```/i;
const WEATHER_FENCE = /```\s*weather-json[\r\n]+([\s\S]*?)```/i;
const HOTEL_FENCE = /```\s*hotel-json[\r\n]+([\s\S]*?)```/i;

function extractBlock(text: string): { jsonText: string | null; fenceType: 'combined-json' | 'weather-json' | 'hotel-json' | null; humanText: string } {
  const cm = text.match(COMBINED_FENCE);
  if (cm) {
    const human = text.replace(COMBINED_FENCE, '').trim();
    return { jsonText: cm[1], fenceType: 'combined-json', humanText: human };
  }
  const wm = text.match(WEATHER_FENCE);
  if (wm) {
    const human = text.replace(WEATHER_FENCE, '').trim();
    return { jsonText: wm[1], fenceType: 'weather-json', humanText: human };
  }
  const hm = text.match(HOTEL_FENCE);
  if (hm) {
    const human = text.replace(HOTEL_FENCE, '').trim();
    return { jsonText: hm[1], fenceType: 'hotel-json', humanText: human };
  }
  return { jsonText: null, fenceType: null, humanText: text.trim() };
}

function mapCurrent(c: any): CurrentDataDay {
  return {
    description: c?.conditions ?? null,
    temp: typeof c?.temp === 'number' ? c.temp : null,
    tempmax: typeof c?.tempmax === 'number' ? c.tempmax : null,
    tempmin: typeof c?.tempmin === 'number' ? c.tempmin : null,
    winddir: typeof c?.winddir === 'number' ? c.winddir : null,
    windspeed: typeof c?.windspeed === 'number' ? c.windspeed : null,
    conditions: c?.conditions ?? null,
    sunrise: c?.sunrise ?? null,
    sunset: c?.sunset ?? null,
    pressure: typeof c?.pressure === 'number' ? c.pressure : null,
    humidity: typeof c?.humidity === 'number' ? c.humidity : null,
    hours: [{ temp: null, conditions: null, winddir: null, windspeed: null, pressure: null, humidity: null }],
  };
}

function mapDays(days: any[]): HistoryAndForecastDay[] {
  return days.map((d: any) => ({
    datetime: d?.datetime ?? null,
    temp: typeof d?.temp === 'number' ? d.temp : null,
    tempmax: typeof d?.tempmax === 'number' ? d.tempmax : null,
    tempmin: typeof d?.tempmin === 'number' ? d.tempmin : null,
    winddir: typeof d?.winddir === 'number' ? d.winddir : null,
    windspeed: typeof d?.windspeed === 'number' ? d.windspeed : null,
    conditions: d?.conditions ?? null,
    sunrise: d?.sunrise ?? null,
    sunset: d?.sunset ?? null,
    pressure: typeof d?.pressure === 'number' ? String(d.pressure) : d?.pressure ?? null,
    humidity: typeof d?.humidity === 'number' ? String(d.humidity) : d?.humidity ?? null,
  }));
}

function mapHotels(hotels: any[]): Hotel[] {
  return hotels.map((h: any) => ({
    name: h?.name ?? '',
    price_per_night: h?.price_per_night ?? '',
    currency: h?.currency ?? '',
    availability: h?.availability ?? 'unknown',
    rating: typeof h?.rating === 'number' ? h.rating : null,
    reviews_count: typeof h?.reviews_count === 'number' ? h.reviews_count : null,
    highlights: Array.isArray(h?.highlights) ? h.highlights : [],
    url: h?.url ?? '',
  }));
}

export function parseAiMessage(text: string): ParsedAiMessage {
  const { jsonText, fenceType, humanText } = extractBlock(text || '');
  if (!jsonText) return { humanText, metaData: null, aiChatData: null };

  try {
    const parsed = JSON.parse(jsonText);
    const meta: AiMeta = {
      city: parsed?.meta?.city ?? null,
      date: parsed?.meta?.date ?? null,
      date_range: parsed?.meta?.date_range ?? null,
      kind: (parsed?.meta?.kind ?? null) as AiMeta['kind'],
      language: parsed?.meta?.language ?? null,
    };

    let aiChatData: AiChatData | null = null;

    if (fenceType === 'combined-json' || meta.kind === 'combined') {
      const weatherKind = parsed?.weather?.kind ?? null;
      const combined: AiChatData = { weatherKind };
      if (weatherKind === 'current' && parsed.weather?.current) {
        combined.current = mapCurrent(parsed.weather.current);
      } else if ((weatherKind === 'forecast' || weatherKind === 'history') && Array.isArray(parsed.weather?.days)) {
        combined.days = mapDays(parsed.weather.days);
      }
      if (Array.isArray(parsed.hotels)) {
        combined.hotels = mapHotels(parsed.hotels);
      }
      aiChatData = combined;
    } else if (fenceType === 'hotel-json' || meta.kind === 'hotels') {
      if (Array.isArray(parsed.hotels)) {
        aiChatData = { hotels: mapHotels(parsed.hotels) };
      }
    } else if (meta.kind === 'current' && parsed.current) {
      aiChatData = { current: mapCurrent(parsed.current) };
    } else if ((meta.kind === 'forecast' || meta.kind === 'history') && Array.isArray(parsed.days)) {
      aiChatData = { days: mapDays(parsed.days) };
    }

    return { humanText, metaData: meta, aiChatData };
  } catch {
    return { humanText, metaData: null, aiChatData: null };
  }
}
