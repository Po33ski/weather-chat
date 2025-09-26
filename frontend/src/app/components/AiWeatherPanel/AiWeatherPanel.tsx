"use client";
import { useMemo } from "react";
import type { AiWeatherPayload, AiWeatherItem } from "@/app/utils/formatAiWeather";
import { WeatherView } from "@/app/components/WeatherView/WeatherView";
import { Brick } from "@/app/components/Brick/Brick";
import { List } from "@/app/components/List/List";
import type { HistoryAndForecastDay } from "@/app/types/interfaces";
import { useContext } from "react";
import { LanguageContext } from "@/app/contexts/LanguageContext";

// Map common labels to Brick kindOfData keys
const KIND_MAP: Array<{ match: RegExp; kind: string }> = [
  { match: /temp(?!.*min|max)|temperatura|temperature/i, kind: "temp" },
  { match: /temp\s*max|max(imum)?\s*temp|max\.? temperature|max\. temp/i, kind: "tempmax" },
  { match: /temp\s*min|min(imum)?\s*temp|min\.? temperature|min\. temp/i, kind: "tempmin" },
  { match: /wind\s*speed|wiatr|windspeed/i, kind: "windspeed" },
  { match: /wind\s*dir|kierunek|winddir/i, kind: "winddir" },
  { match: /pressure|ciśnienie|cisnienie/i, kind: "pressure" },
  { match: /humidity|wilgotność|wilgotnosc/i, kind: "humidity" },
  { match: /sunrise|wschód|wschod/i, kind: "sunrise" },
  { match: /sunset|zachód|zachod/i, kind: "sunset" },
  { match: /conditions|warunki/i, kind: "conditions" },
];

function toKind(label: string): string | null {
  for (const m of KIND_MAP) {
    if (m.match.test(label)) return m.kind;
  }
  return null;
}

function parseNumberLike(value?: string): number | null {
  if (!value) return null;
  // Extract first number (handles "18°C", "22 km/h", "65%", etc.)
  const m = value.match(/-?\d+(?:[\.,]\d+)?/);
  if (!m) return null;
  const asNum = Number(m[0].replace(",", "."));
  return isFinite(asNum) ? asNum : null;
}

export function AiWeatherPanel({ payload }: { payload: AiWeatherPayload | null }) {
  const lang = useContext(LanguageContext);
  const kind = payload?.meta?.kind ?? null;

  // Build a partial CurrentDataDay object from items (best-effort)
  const currentData = useMemo(() => {
    if (!payload || kind !== "current") return null;
    const base = {
      description: null as string | null,
      temp: null as number | null,
      tempmax: null as number | null,
      tempmin: null as number | null,
      winddir: null as number | null,
      windspeed: null as number | null,
      conditions: null as string | null,
      sunrise: null as string | null,
      sunset: null as string | null,
      pressure: null as number | null,
      humidity: null as number | null,
      hours: [{ temp: null, conditions: null, winddir: null, windspeed: null, pressure: null, humidity: null }],
    };
    for (const it of (payload.items || []) as AiWeatherItem[]) {
      const k = toKind(it.label || "");
      if (!k) continue;
      switch (k) {
        case "temp": base.temp = parseNumberLike(it.value); break;
        case "tempmax": base.tempmax = parseNumberLike(it.value); break;
        case "tempmin": base.tempmin = parseNumberLike(it.value); break;
        case "windspeed": base.windspeed = parseNumberLike(it.value); break;
        case "winddir": base.winddir = parseNumberLike(it.value); break;
        case "pressure": base.pressure = parseNumberLike(it.value); break;
        case "humidity": base.humidity = parseNumberLike(it.value); break;
        case "sunrise": base.sunrise = it.value ?? null; break;
        case "sunset": base.sunset = it.value ?? null; break;
        case "conditions": base.conditions = it.value ?? null; break;
      }
    }
    return base;
  }, [payload, kind]);

  if (!payload) {
    return <div className="text-sm text-gray-500">{lang?.t('chat.subtitle')}</div>;
  }

  // Preferred rich rendering for current weather using existing tiles
  if (kind === "current" && currentData) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          {payload.meta?.city && <span className="font-semibold">{payload.meta.city}</span>}
          {payload.meta?.date && <div>{payload.meta.date}</div>}
        </div>
        <WeatherView data={currentData as any} address={payload.meta?.city ?? null} />
      </div>
    );
  }

  // Fallback: render items as Brick tiles side-by-side using label/value
  // If forecast/history with days[] -> render List
  if ((kind === "forecast" || kind === "history") && Array.isArray((payload as any).days)) {
    const days: HistoryAndForecastDay[] = ((payload as any).days || []).map((d: any) => ({
      datetime: d.datetime ?? null,
      temp: parseNumberLike(d.temp),
      tempmax: parseNumberLike(d.tempmax),
      tempmin: parseNumberLike(d.tempmin),
      winddir: parseNumberLike(d.winddir),
      windspeed: parseNumberLike(d.windspeed),
      conditions: d.conditions ?? null,
      sunrise: d.sunrise ?? null,
      sunset: d.sunset ?? null,
      pressure: d.pressure ?? null,
      humidity: d.humidity ?? null,
    }));
    return (
      <div className="space-y-4">
        <List data={days as any} />
      </div>
    );
  }

  return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          {payload.meta?.city && <span className="font-semibold">{payload.meta.city}</span>}
          {payload.meta?.date && <div>{payload.meta.date}</div>}
          {payload.meta?.date_range && <div>{payload.meta.date_range}</div>}
        </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(payload.items || []).map((it, idx) => {
          const kindOfData = toKind(it.label || "") || "conditions";
          return (
            <div key={idx} className="flex justify-self-center">
              <Brick
                data={it.value || null}
                kindOfData={kindOfData}
                title={it.label}
                desc={null}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}


