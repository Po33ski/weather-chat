import { describe, expect, it } from "vitest";
import type { ParsedAiMessage } from "@/app/types/aiChat";
import type { CurrentDataDay } from "@/app/types/interfaces";
import { resultKind, toResultView } from "./resultView";

const CURRENT: CurrentDataDay = {
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
};
const DAY = { ...CURRENT, datetime: "2026-08-08" };

const parsed = (
  kind: NonNullable<ParsedAiMessage["metaData"]>["kind"],
  data: ParsedAiMessage["aiChatData"],
): ParsedAiMessage => ({
  humanText: "",
  metaData: { city: "Warsaw", date: null, date_range: "2026-08-08..2026-08-10", kind },
  aiChatData: data,
});

describe("toResultView", () => {
  it("returns null for text-only replies", () => {
    expect(toResultView({ humanText: "Hi", metaData: null, aiChatData: null })).toBeNull();
  });

  it("maps current weather", () => {
    const view = toResultView(parsed("current", { current: CURRENT }));
    expect(view).toMatchObject({ type: "weather", weather: { kind: "current" }, meta: { city: "Warsaw" } });
    expect(view && resultKind(view)).toBe("current");
  });

  it("maps forecast and history days", () => {
    expect(toResultView(parsed("forecast", { days: [DAY] }))).toMatchObject({ weather: { kind: "forecast" } });
    const history = toResultView(parsed("history", { days: [DAY] }));
    expect(history && resultKind(history)).toBe("history");
    expect(history?.meta.dateRange).toBe("2026-08-08..2026-08-10");
  });

  it("ignores an empty day list", () => {
    expect(toResultView(parsed("forecast", { days: [] }))).toBeNull();
  });

  it("maps hotels, including an empty result", () => {
    expect(toResultView(parsed("hotels", { hotels: [] }))).toMatchObject({ type: "hotels", hotels: [] });
  });

  it("maps combined replies and tolerates a missing weather half", () => {
    const full = toResultView(parsed("combined", { weatherKind: "history", days: [DAY], hotels: [] }));
    expect(full).toMatchObject({ type: "combined", weather: { kind: "history" } });

    const partial = toResultView(parsed("combined", { weatherKind: null, hotels: [] }));
    expect(partial).toMatchObject({ type: "combined", weather: null, hotels: [] });
  });
});
