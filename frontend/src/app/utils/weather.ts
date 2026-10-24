import type { HistoryAndForecastDay, UnitSystem } from "@/app/types/interfaces";
import type { Lang } from "@/app/types/types";
import { formatNumber, parseClock } from "./format";

// ---------------------------------------------------------------------------
// Units — every payload is metric; convert only for display.
// ---------------------------------------------------------------------------

export function convertTemperature(celsius: number, units: UnitSystem): number {
  return units.temperature === "°F" ? (celsius * 9) / 5 + 32 : celsius;
}

export function convertSpeed(kmh: number, units: UnitSystem): number {
  return units.distance === "mph" ? kmh / 1.609344 : kmh;
}

/** Whole units for display; `|| 0` turns Math.round(-0.4) = -0 into 0 (Intl prints "-0"). */
export function roundForDisplay(value: number): number {
  return Math.round(value) || 0;
}

/** "18°" — the unit letter is shown once per view, not on every number. */
export function formatTemperature(
  celsius: number | null,
  units: UnitSystem,
  locale: string,
): string {
  if (celsius === null) return "—";
  return `${formatNumber(roundForDisplay(convertTemperature(celsius, units)), locale)}°`;
}

export function formatSpeed(kmh: number | null, units: UnitSystem, locale: string): string {
  if (kmh === null) return "—";
  return formatNumber(roundForDisplay(convertSpeed(kmh, units)), locale);
}

// ---------------------------------------------------------------------------
// Wind direction
// ---------------------------------------------------------------------------

export const CARDINALS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
export type Cardinal = (typeof CARDINALS)[number];

/** Meteorological direction (where the wind blows *from*) on an 8-point rose. */
export function toCardinal(degrees: number | null): Cardinal | null {
  if (degrees === null || !Number.isFinite(degrees)) return null;
  const normalized = ((degrees % 360) + 360) % 360;
  return CARDINALS[Math.round(normalized / 45) % 8];
}

// ---------------------------------------------------------------------------
// Conditions
// ---------------------------------------------------------------------------

export type ConditionIcon =
  | "clear"
  | "partly"
  | "cloudy"
  | "drizzle"
  | "rain"
  | "showers"
  | "thunder"
  | "snow"
  | "sleet"
  | "fog"
  | "wind"
  | "unknown";

// Visual Crossing reports English condition names, but the agent sometimes
// translates them for Polish replies — so match English and Polish stems.
const has = (text: string, stems: string[]) => stems.some((stem) => text.includes(stem));
const THUNDER = ["thunder", "storm", "lightning", "tornado", "burz", "błyskawic"];
const FROZEN = ["snow", "sleet", "hail", "ice", "freezing", "śnieg", "grad", "marzn", "gołoledź"];
const RAIN = ["rain", "deszcz", "opad"];
const SHOWERS = ["shower", "przelotn"];
const DRIZZLE = ["drizzle", "mżaw"];
const FOG = ["fog", "mist", "haze", "smoke", "mgł", "mgieł", "zamgl", "zadymien"];
const PARTLY = ["partially", "partly", "mostly sunny", "częściow", "przejaśn", "umiarkowan"];
const CLOUDY = ["overcast", "cloud", "pochmur", "zachmurz"];
const CLEAR = ["clear", "sunny", "fair", "bezchmur", "słonecz", "pogodn"];
const WINDY = ["wind", "squall", "breez", "wietrz", "szkwał"];

export function conditionIcon(conditions: string | null): ConditionIcon {
  if (!conditions) return "unknown";
  const text = conditions.toLowerCase();
  if (has(text, THUNDER)) return "thunder";
  if (has(text, ["freezing fog", "marznąca mgła"])) return "fog";
  if (has(text, FROZEN)) {
    // "opady śniegu" is plain snow — only explicit rain/drizzle/hail makes it sleet.
    return has(text, ["rain", "deszcz", "drizzle", "mżaw", "sleet", "hail", "grad"])
      ? "sleet"
      : "snow";
  }
  if (has(text, SHOWERS)) return "showers";
  if (has(text, RAIN)) return has(text, PARTLY) ? "showers" : "rain";
  if (has(text, DRIZZLE)) return "drizzle";
  if (has(text, FOG)) return "fog";
  if (has(text, PARTLY)) return "partly";
  if (has(text, CLOUDY)) return "cloudy";
  if (has(text, CLEAR)) return "clear";
  if (has(text, WINDY)) return "wind";
  return "unknown";
}

export function isWet(conditions: string | null): boolean {
  if (!conditions) return false;
  const text = conditions.toLowerCase();
  return has(text, [...RAIN, ...SHOWERS, ...DRIZZLE, ...THUNDER, ...FROZEN]);
}

const PL_CONDITIONS: Record<string, string> = {
  clear: "bezchmurnie",
  sunny: "słonecznie",
  "partially cloudy": "częściowe zachmurzenie",
  "partly cloudy": "częściowe zachmurzenie",
  "mostly cloudy": "duże zachmurzenie",
  cloudy: "pochmurno",
  overcast: "pochmurno",
  rain: "deszcz",
  "light rain": "lekki deszcz",
  "heavy rain": "ulewny deszcz",
  "rain showers": "przelotne opady deszczu",
  showers: "przelotne opady",
  drizzle: "mżawka",
  "light drizzle": "lekka mżawka",
  "heavy drizzle": "gęsta mżawka",
  "drizzle/rain": "mżawka lub deszcz",
  "light drizzle/rain": "lekka mżawka lub deszcz",
  "heavy drizzle/rain": "gęsta mżawka lub deszcz",
  snow: "śnieg",
  "light snow": "lekki śnieg",
  "heavy snow": "intensywne opady śniegu",
  "snow showers": "przelotne opady śniegu",
  "blowing or drifting snow": "zamieć śnieżna",
  sleet: "deszcz ze śniegiem",
  "rain and snow": "deszcz ze śniegiem",
  "light rain and snow": "lekki deszcz ze śniegiem",
  "heavy rain and snow": "intensywny deszcz ze śniegiem",
  "freezing drizzle/freezing rain": "marznący deszcz",
  "light freezing drizzle/freezing rain": "lekki marznący deszcz",
  "heavy freezing drizzle/freezing rain": "intensywny marznący deszcz",
  "freezing rain": "marznący deszcz",
  "freezing drizzle": "marznąca mżawka",
  ice: "gołoledź",
  hail: "grad",
  "hail showers": "przelotny grad",
  thunderstorm: "burza",
  "thunderstorm without precipitation": "burza bez opadów",
  "lightning without thunder": "błyskawice",
  fog: "mgła",
  "freezing fog": "marznąca mgła",
  mist: "zamglenie",
  "smoke or haze": "zadymienie",
  haze: "mgiełka",
  "dust storm": "burza pyłowa",
  squalls: "szkwały",
  windy: "wietrznie",
  "precipitation in vicinity": "opady w pobliżu",
  "sky coverage increasing": "rosnące zachmurzenie",
  "sky coverage decreasing": "malejące zachmurzenie",
};

/**
 * Localize a condition string. Visual Crossing joins several terms with commas
 * ("Rain, Partially cloudy"), so translate term by term; unknown terms are kept.
 */
export function translateConditions(conditions: string | null, lang: Lang): string {
  const text = conditions?.trim() ?? "";
  if (!text || lang === "en") return text;

  const whole = PL_CONDITIONS[text.toLowerCase()];
  const translated =
    whole ??
    text
      .split(",")
      .map((term) => term.trim())
      .filter(Boolean)
      .map((term) => PL_CONDITIONS[term.toLowerCase()] ?? term.toLowerCase())
      .join(", ");
  return translated.charAt(0).toUpperCase() + translated.slice(1);
}

// ---------------------------------------------------------------------------
// Derived values
// ---------------------------------------------------------------------------

export function daylightMinutes(sunrise: string | null, sunset: string | null): number | null {
  const rise = parseClock(sunrise);
  const set = parseClock(sunset);
  if (rise === null || set === null || set <= rise) return null;
  return set - rise;
}

function average(values: (number | null)[]): number | null {
  const numbers = values.filter((v): v is number => v !== null);
  return numbers.length ? numbers.reduce((sum, v) => sum + v, 0) / numbers.length : null;
}

export interface DaysSummary {
  avgHigh: number | null;
  avgLow: number | null;
  wetDays: number;
  total: number;
  warmest: HistoryAndForecastDay | null;
}

export function summarizeDays(days: HistoryAndForecastDay[]): DaysSummary {
  let warmest: HistoryAndForecastDay | null = null;
  for (const day of days) {
    if (day.tempmax !== null && (warmest?.tempmax == null || day.tempmax > warmest.tempmax)) {
      warmest = day;
    }
  }
  return {
    avgHigh: average(days.map((d) => d.tempmax)),
    avgLow: average(days.map((d) => d.tempmin)),
    wetDays: days.filter((d) => isWet(d.conditions)).length,
    total: days.length,
    warmest,
  };
}

export type PackingTip =
  | "umbrella"
  | "boots"
  | "warmCoat"
  | "jacket"
  | "sunscreen"
  | "water"
  | "sunglasses"
  | "windbreaker"
  | "layers";

export interface PackingInput {
  minTemp: number | null; // °C
  maxTemp: number | null; // °C
  maxWind: number | null; // km/h
  conditions: (string | null)[];
}

/** Deterministic packing hints derived from the weather data shown on screen. */
export function packingTips({ minTemp, maxTemp, maxWind, conditions }: PackingInput): PackingTip[] {
  const tips: PackingTip[] = [];
  const icons = conditions.map(conditionIcon);

  if (icons.some((i) => ["rain", "showers", "drizzle", "thunder", "sleet"].includes(i))) {
    tips.push("umbrella");
  }
  if (icons.some((i) => i === "snow" || i === "sleet")) tips.push("boots");
  if (minTemp !== null) {
    if (minTemp < 5) tips.push("warmCoat");
    else if (minTemp < 15) tips.push("jacket");
  }
  if (maxTemp !== null && maxTemp >= 25) tips.push("sunscreen");
  if (maxTemp !== null && maxTemp >= 30) tips.push("water");
  if (maxTemp !== null && maxTemp >= 18 && icons.some((i) => i === "clear" || i === "partly")) {
    tips.push("sunglasses");
  }
  if (maxWind !== null && maxWind >= 30) tips.push("windbreaker");

  return tips.length ? tips : ["layers"];
}

function extremum(values: (number | null)[], kind: "min" | "max"): number | null {
  const numbers = values.filter((v): v is number => v !== null);
  if (!numbers.length) return null;
  return kind === "min" ? Math.min(...numbers) : Math.max(...numbers);
}

export function packingInputFromDays(days: HistoryAndForecastDay[]): PackingInput {
  return {
    minTemp: extremum(
      days.map((d) => d.tempmin),
      "min",
    ),
    maxTemp: extremum(
      days.map((d) => d.tempmax),
      "max",
    ),
    maxWind: extremum(
      days.map((d) => d.windspeed),
      "max",
    ),
    conditions: days.map((d) => d.conditions),
  };
}
