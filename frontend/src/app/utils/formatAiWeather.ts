export type AiWeatherMeta = {
  city: string | null;
  kind: 'current' | 'forecast' | 'history' | string | null;
  date: string | null;
  date_range: string | null;
  language: string | null;
  unit_system: 'US' | 'METRIC' | 'UK' | string | null;
};

export type AiWeatherItem = {
  label: string;
  value?: string;
  emoji?: string;
};

export type AiWeatherPayload = {
  meta: AiWeatherMeta;
  items: AiWeatherItem[];
};

// Extract fenced block labeled weather-json and parse JSON. Returns null if none.
export function extractWeatherJsonBlock(text: string): AiWeatherPayload | null {
  if (!text) return null;
  const fence = /```\s*weather-json\s*\n([\s\S]*?)\n```/i;
  const m = text.match(fence);
  if (!m) return null;
  try {
    const parsed = JSON.parse(m[1]);
    if (parsed && typeof parsed === 'object' && parsed.items) {
      return parsed as AiWeatherPayload;
    }
  } catch {}
  return null;
}

// Remove fenced weather-json block from the text, leaving only the human message.
export function stripWeatherJsonBlock(text: string): string {
  return text.replace(/```\s*weather-json[\s\S]*?```/gi, '').trim();
}

