// import type { CurrentDataDay, HistoryAndForecastDay } from "@/app/types/interfaces";
// export type AiWeatherMeta = {
//   city: string | null;
//   kind: 'current' | 'forecast' | 'history' | string | null;
//   date: string | null;
//   date_range: string | null;
//   language: string | null;
//   unit_system: 'US' | 'METRIC' | 'UK' | string | null;
// };

// export type AiWeatherItem = {
//   label: string;
//   value?: string;
//   emoji?: string;
// };

// export type AiWeatherPayload = {
//   meta: AiWeatherMeta;
//   items: AiWeatherItem[];
// };

// // Extract fenced block labeled weather-json and parse JSON. Returns null if none.
// export function extractWeatherJsonBlock(text: string): AiWeatherPayload | null {
//   if (!text) return null;
//   // Accept CRLF or LF and optional spaces; closing fence may not be preceded by a newline
//   const fence = /```\s*weather-json[\r\n]+([\s\S]*?)```/i;
//   const m = text.match(fence);
//   if (!m) return null;
//   try {
//     const parsed = JSON.parse(m[1]);
//     if (parsed && typeof parsed === 'object' && parsed.items) {
//       return parsed as AiWeatherPayload;
//     }
//   } catch {}
//   return null;
// }

// // Remove fenced weather-json block from the text, leaving only the human message.
// export function stripWeatherJsonBlock(text: string): string {
//   return text.replace(/```\s*weather-json[\s\S]*?```/gi, '').trim();
// }

// // Fallback: derive a simple payload from bold sections like **Label: value**
// export function derivePayloadFromBoldSections(text: string): AiWeatherPayload | null {
//   if (!text) return null;
//   const regex = /\*\*(.+?)\*\*/g;
//   const chunks: string[] = [];
//   let m: RegExpExecArray | null;
//   while ((m = regex.exec(text)) !== null) {
//     if (m[1]) chunks.push(m[1].trim());
//     // Prevent infinite loops with zero-width matches
//     if (m.index === regex.lastIndex) regex.lastIndex++;
//   }
//   if (!chunks.length) return null;
//   const items = chunks.map((chunk) => {
//     const [labelRaw, ...rest] = chunk.split(':');
//     const label = labelRaw.trim();
//     const value = rest.join(':').trim();
//     return { label, value } as AiWeatherItem;
//   });
//   return {
//     meta: {
//       city: null,
//       kind: null,
//       date: null,
//       date_range: null,
//       language: null,
//       unit_system: null,
//     },
//     items,
//   };
// }

// // Normalize the AI payload into frontend-friendly structures (meta + weather-only data)
// export type MetaBrief = { city: string | null; date: string | null; date_range: string | null };
// export type NormalizedAi = {
//   kind: string | null;
//   meta: MetaBrief;
//   current?: CurrentDataDay;
//   days?: HistoryAndForecastDay[];
// };

// export function normalizeAiPayload(payload: any): NormalizedAi | null {
//   if (!payload || typeof payload !== 'object') return null;
//   const kind: string | null = payload?.meta?.kind ?? null;
//   const meta: MetaBrief = {
//     city: payload?.meta?.city ?? null,
//     date: payload?.meta?.date ?? null,
//     date_range: payload?.meta?.date_range ?? null,
//   };

//   if (kind === 'current' && payload.current && typeof payload.current === 'object') {
//     const c = payload.current;
//     const current: CurrentDataDay = {
//       description: c.conditions ?? null,
//       temp: typeof c.temp === 'number' ? c.temp : null,
//       tempmax: typeof c.tempmax === 'number' ? c.tempmax : null,
//       tempmin: typeof c.tempmin === 'number' ? c.tempmin : null,
//       winddir: typeof c.winddir === 'number' ? c.winddir : null,
//       windspeed: typeof c.windspeed === 'number' ? c.windspeed : null,
//       conditions: c.conditions ?? null,
//       sunrise: c.sunrise ?? null,
//       sunset: c.sunset ?? null,
//       pressure: typeof c.pressure === 'number' ? c.pressure : null,
//       humidity: typeof c.humidity === 'number' ? c.humidity : null,
//       hours: [{ temp: null, conditions: null, winddir: null, windspeed: null, pressure: null, humidity: null }],
//     };
//     return { kind, meta, current };
//   }

//   if ((kind === 'forecast' || kind === 'history') && Array.isArray(payload.days)) {
//     const days: HistoryAndForecastDay[] = payload.days.map((d: any) => ({
//       datetime: d?.datetime ?? null,
//       temp: typeof d?.temp === 'number' ? d.temp : null,
//       tempmax: typeof d?.tempmax === 'number' ? d.tempmax : null,
//       tempmin: typeof d?.tempmin === 'number' ? d.tempmin : null,
//       winddir: typeof d?.winddir === 'number' ? d.winddir : null,
//       windspeed: typeof d?.windspeed === 'number' ? d.windspeed : null,
//       conditions: d?.conditions ?? null,
//       sunrise: d?.sunrise ?? null,
//       sunset: d?.sunset ?? null,
//       pressure: typeof d?.pressure === 'number' ? String(d.pressure) : d?.pressure ?? null,
//       humidity: typeof d?.humidity === 'number' ? String(d.humidity) : d?.humidity ?? null,
//     }));
//     return { kind, meta, days };
//   }

//   // Legacy fallback: flatten items if provided
//   if (Array.isArray(payload.items)) {
//     return { kind, meta };
//   }
//   return { kind, meta };
// }

