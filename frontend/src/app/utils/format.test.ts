import { describe, expect, it } from "vitest";
import {
  addDays,
  diffInDays,
  displayHost,
  formatClock,
  formatDuration,
  formatPrice,
  normalizeIsoDate,
  parseAmount,
  parseClock,
  parseDateRange,
  parseIsoDate,
  safeHttpUrl,
  todayIso,
} from "./format";

describe("parseIsoDate", () => {
  it("parses a calendar date as a local date", () => {
    const date = parseIsoDate("2026-08-08");
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(7);
    expect(date?.getDate()).toBe(8);
  });

  it("ignores a trailing time part", () => {
    expect(normalizeIsoDate("2026-08-08T00:00:00")).toBe("2026-08-08");
  });

  it("rejects impossible and malformed dates", () => {
    expect(parseIsoDate("2026-02-31")).toBeNull();
    expect(parseIsoDate("08/08/2026")).toBeNull();
    expect(parseIsoDate(null)).toBeNull();
    expect(normalizeIsoDate(20260808)).toBeNull();
  });
});

describe("date arithmetic", () => {
  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("counts whole days, including across a DST switch", () => {
    expect(diffInDays("2026-03-28", "2026-03-30")).toBe(2);
    expect(diffInDays("2026-10-30", "2026-10-24")).toBe(-6);
  });

  it("formats today from the local clock", () => {
    expect(todayIso(new Date(2026, 9, 24, 23, 59))).toBe("2026-10-24");
  });
});

describe("parseDateRange", () => {
  it("parses a valid range", () => {
    expect(parseDateRange("2026-08-08..2026-08-10")).toEqual({ start: "2026-08-08", end: "2026-08-10" });
  });

  it("rejects reversed, invalid or missing ranges", () => {
    expect(parseDateRange("2026-08-10..2026-08-08")).toBeNull();
    expect(parseDateRange("2026-02-30..2026-03-02")).toBeNull();
    expect(parseDateRange("next week")).toBeNull();
    expect(parseDateRange(null)).toBeNull();
  });
});

describe("clock values", () => {
  it("parses HH:MM and HH:MM:SS", () => {
    expect(parseClock("06:12")).toBe(372);
    expect(parseClock("19:18:00")).toBe(1158);
  });

  it("rejects out-of-range times", () => {
    expect(parseClock("24:00")).toBeNull();
    expect(parseClock("12:60")).toBeNull();
    expect(parseClock("noon")).toBeNull();
  });

  it("formats in 24 h or 12 h style", () => {
    expect(formatClock("19:05", "en-GB", false)).toBe("19:05");
    expect(formatClock("19:05", "en-US", true)).toMatch(/^7:05\s?PM$/);
    expect(formatClock("bad", "en-GB", false)).toBeNull();
  });

  it("formats durations per language", () => {
    expect(formatDuration(786, "en")).toBe("13 h 06 min");
    expect(formatDuration(786, "pl")).toBe("13 godz. 06 min");
  });
});

describe("parseAmount", () => {
  it.each([
    ["450", 450],
    ["120.5", 120.5],
    ["1,200", 1200],
    ["1.200", 1200],
    ["1 234,50", 1234.5],
    ["1.234,50", 1234.5],
    ["1,234.50", 1234.5],
    ["99,9", 99.9],
  ])("parses %s", (input, expected) => {
    expect(parseAmount(input)).toBe(expected);
  });

  it.each(["", "from 120", "-5", "abc", "12-15"])("rejects %j", (input) => {
    expect(parseAmount(input)).toBeNull();
  });
});

describe("formatPrice", () => {
  it("formats known ISO currencies with the locale", () => {
    expect(formatPrice(450, "PLN", "pl-PL").replace(/\s/g, " ")).toBe("450 zł");
    expect(formatPrice(120, "usd", "en-US")).toBe("$120");
    expect(formatPrice(99.5, "EUR", "en-GB")).toBe("€99.50");
  });

  it("falls back to amount + code for unknown codes", () => {
    expect(formatPrice(80, "points", "en-GB")).toBe("80 POINTS");
    expect(formatPrice(80, "", "en-GB")).toBe("80");
  });
});

describe("safeHttpUrl", () => {
  it("accepts http(s) links only", () => {
    expect(safeHttpUrl("https://www.booking.com/hotel/pl/x.html")?.hostname).toBe("www.booking.com");
    expect(safeHttpUrl("javascript:alert(1)")).toBeNull();
    expect(safeHttpUrl("data:text/html,hi")).toBeNull();
    expect(safeHttpUrl("not a url")).toBeNull();
    expect(safeHttpUrl("")).toBeNull();
  });

  it("strips www. for display", () => {
    expect(displayHost(new URL("https://www.booking.com/x"))).toBe("booking.com");
  });
});
