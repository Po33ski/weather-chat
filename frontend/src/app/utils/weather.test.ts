import { describe, expect, it } from "vitest";
import { UNIT_SYSTEMS } from "@/app/constants/unitSystems";
import type { HistoryAndForecastDay } from "@/app/types/interfaces";
import {
  conditionIcon,
  convertSpeed,
  convertTemperature,
  daylightMinutes,
  formatTemperature,
  isWet,
  packingInputFromDays,
  packingTips,
  summarizeDays,
  toCardinal,
  translateConditions,
} from "./weather";

const day = (overrides: Partial<HistoryAndForecastDay>): HistoryAndForecastDay => ({
  datetime: "2026-08-08",
  temp: 20,
  tempmax: 24,
  tempmin: 15,
  winddir: 180,
  windspeed: 10,
  conditions: "Clear",
  sunrise: "05:30",
  sunset: "20:15",
  pressure: 1013,
  humidity: 60,
  ...overrides,
});

describe("unit conversion", () => {
  it("converts temperature only for °F systems", () => {
    expect(convertTemperature(20, UNIT_SYSTEMS.US)).toBe(68);
    expect(convertTemperature(20, UNIT_SYSTEMS.UK)).toBe(20);
    expect(formatTemperature(-0.4, UNIT_SYSTEMS.METRIC, "en-GB")).toBe("0°");
    expect(formatTemperature(-2.6, UNIT_SYSTEMS.METRIC, "en-GB")).toBe("-3°");
    expect(formatTemperature(null, UNIT_SYSTEMS.METRIC, "en-GB")).toBe("—");
  });

  it("converts speed for mph systems", () => {
    expect(convertSpeed(16.09344, UNIT_SYSTEMS.UK)).toBeCloseTo(10);
    expect(convertSpeed(10, UNIT_SYSTEMS.METRIC)).toBe(10);
  });
});

describe("toCardinal", () => {
  it.each([
    [0, "N"],
    [22, "N"],
    [23, "NE"],
    [180, "S"],
    [350, "N"],
    [-90, "W"],
    [405, "NE"],
  ])("%d° → %s", (degrees, expected) => {
    expect(toCardinal(degrees)).toBe(expected);
  });

  it("returns null without a value", () => {
    expect(toCardinal(null)).toBeNull();
    expect(toCardinal(Number.NaN)).toBeNull();
  });
});

describe("conditionIcon", () => {
  it.each([
    ["Clear", "clear"],
    ["Sunny", "clear"],
    ["Partially cloudy", "partly"],
    ["Overcast", "cloudy"],
    ["Rain, Overcast", "rain"],
    ["Rain, Partially cloudy", "showers"],
    ["Light drizzle", "drizzle"],
    ["Snow, Overcast", "snow"],
    ["Snow, Rain, Overcast", "sleet"],
    ["Thunderstorm", "thunder"],
    ["Freezing fog", "fog"],
    ["Mist", "fog"],
    // The agent sometimes translates conditions for Polish replies.
    ["Częściowe zachmurzenie", "partly"],
    ["Pochmurno", "cloudy"],
    ["Deszcz", "rain"],
    ["Opady śniegu", "snow"],
    ["Burza z piorunami", "thunder"],
    ["Bezchmurnie", "clear"],
    ["Something else", "unknown"],
  ])("%s → %s", (conditions, expected) => {
    expect(conditionIcon(conditions)).toBe(expected);
  });

  it("handles missing conditions", () => {
    expect(conditionIcon(null)).toBe("unknown");
  });
});

describe("isWet", () => {
  it("detects precipitation in English and Polish", () => {
    expect(isWet("Rain, Partially cloudy")).toBe(true);
    expect(isWet("Przelotne opady")).toBe(true);
    expect(isWet("Partially cloudy")).toBe(false);
    expect(isWet(null)).toBe(false);
  });
});

describe("translateConditions", () => {
  it("keeps English as-is", () => {
    expect(translateConditions(" Rain, Overcast ", "en")).toBe("Rain, Overcast");
  });

  it("translates comma-joined terms one by one", () => {
    expect(translateConditions("Rain, Overcast", "pl")).toBe("Deszcz, pochmurno");
    expect(translateConditions("Snow, Rain, Partially cloudy", "pl")).toBe(
      "Śnieg, deszcz, częściowe zachmurzenie",
    );
  });

  it("prefers a whole-phrase translation", () => {
    expect(translateConditions("Thunderstorm Without Precipitation", "pl")).toBe("Burza bez opadów");
  });

  it("keeps unknown terms and empty input", () => {
    expect(translateConditions("Clear, Volcanic ash", "pl")).toBe("Bezchmurnie, volcanic ash");
    expect(translateConditions(null, "pl")).toBe("");
  });
});

describe("daylightMinutes", () => {
  it("computes the length of the day", () => {
    expect(daylightMinutes("06:12", "19:18")).toBe(786);
  });

  it("rejects missing or inverted times", () => {
    expect(daylightMinutes(null, "19:18")).toBeNull();
    expect(daylightMinutes("19:18", "06:12")).toBeNull();
  });
});

describe("summarizeDays", () => {
  it("averages, counts wet days and finds the warmest", () => {
    const summary = summarizeDays([
      day({ datetime: "2026-08-08", tempmax: 20, tempmin: 10, conditions: "Rain" }),
      day({ datetime: "2026-08-09", tempmax: 26, tempmin: 14, conditions: "Clear" }),
      day({ datetime: "2026-08-10", tempmax: null, tempmin: 12, conditions: "Snow" }),
    ]);
    expect(summary.avgHigh).toBe(23);
    expect(summary.avgLow).toBe(12);
    expect(summary.wetDays).toBe(2);
    expect(summary.total).toBe(3);
    expect(summary.warmest?.datetime).toBe("2026-08-09");
  });

  it("handles missing values", () => {
    const summary = summarizeDays([day({ tempmax: null, tempmin: null })]);
    expect(summary.avgHigh).toBeNull();
    expect(summary.warmest).toBeNull();
  });
});

describe("packingTips", () => {
  it("suggests rain and cold-weather gear", () => {
    expect(packingTips({ minTemp: 2, maxTemp: 6, maxWind: 35, conditions: ["Rain, Overcast"] })).toEqual([
      "umbrella",
      "warmCoat",
      "windbreaker",
    ]);
  });

  it("suggests sun protection on hot clear days", () => {
    expect(packingTips({ minTemp: 21, maxTemp: 32, maxWind: 5, conditions: ["Clear"] })).toEqual([
      "sunscreen",
      "water",
      "sunglasses",
    ]);
  });

  it("covers snow and falls back to light layers", () => {
    expect(packingTips({ minTemp: -3, maxTemp: 1, maxWind: 10, conditions: ["Snow"] })).toEqual([
      "boots",
      "warmCoat",
    ]);
    expect(packingTips({ minTemp: 16, maxTemp: 22, maxWind: 10, conditions: ["Overcast"] })).toEqual(["layers"]);
  });

  it("derives inputs from the extremes of the period", () => {
    const input = packingInputFromDays([
      day({ tempmin: 9, tempmax: 18, windspeed: 12 }),
      day({ tempmin: 4, tempmax: 27, windspeed: 31 }),
    ]);
    expect(input).toMatchObject({ minTemp: 4, maxTemp: 27, maxWind: 31 });
  });
});
