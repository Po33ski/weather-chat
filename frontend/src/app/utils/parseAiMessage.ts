import type { AiMeta, AiChatData, ParsedAiMessage } from "@/app/types/aiChat";
import type { CurrentDataDay, HistoryAndForecastDay } from "@/app/types/interfaces";

function extractBlock(text: string): { jsonText: string | null; humanText: string } {
  const fence = /```\s*weather-json[\r\n]+([\s\S]*?)```/i;
  const m = text.match(fence);
  if (!m) return { jsonText: null, humanText: text.trim() };
  const human = text.replace(fence, '').trim();
  return { jsonText: m[1], humanText: human };
}

export function parseAiMessage(text: string): ParsedAiMessage {
  const { jsonText, humanText } = extractBlock(text || '');
  if (!jsonText) return { humanText, metaData: null, aiChatData: null };
  try {
    const parsed = JSON.parse(jsonText);
    const meta: AiMeta = {
      city: parsed?.meta?.city ?? null,
      date: parsed?.meta?.date ?? null,
      date_range: parsed?.meta?.date_range ?? null,
      kind: (parsed?.meta?.kind ?? null) as AiMeta['kind'],
      language: parsed?.meta?.language ?? null,
      unit_system: parsed?.meta?.unit_system ?? null,
    };

    let aiChatData: AiChatData | null = null;
    if (meta.kind === 'current' && parsed.current) {
      const c = parsed.current;
      const current: CurrentDataDay = {
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
      aiChatData = { current };
    } else if ((meta.kind === 'forecast' || meta.kind === 'history') && Array.isArray(parsed.days)) {
      const days: HistoryAndForecastDay[] = parsed.days.map((d: any) => ({
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
      aiChatData = { days };
    }
    return { humanText, metaData: meta, aiChatData };
  } catch {
    return { humanText, metaData: null, aiChatData: null };
  }
}


