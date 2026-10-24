import { describe, expect, it } from "vitest";
import { buildTripPrompt, hasErrors, validateTripSearch, type TripSearchInput } from "./tripPrompt";

const TODAY = "2026-10-24";

const input = (overrides: Partial<TripSearchInput>): TripSearchInput => ({
  intent: "weather",
  destination: "Kraków",
  startDate: "",
  endDate: "",
  ...overrides,
});

describe("validateTripSearch — destination", () => {
  it("accepts real place names", () => {
    for (const destination of ["Kraków", "Saint-Étienne", "Xi'an", "Washington, D.C.", "  Paris,  France "]) {
      expect(validateTripSearch(input({ destination }), TODAY)).toEqual({});
    }
  });

  it("rejects empty, symbolic and over-long input", () => {
    expect(validateTripSearch(input({ destination: "   " }), TODAY).destination).toBe("destinationRequired");
    expect(validateTripSearch(input({ destination: "<script>" }), TODAY).destination).toBe("destinationInvalid");
    expect(validateTripSearch(input({ destination: "12345" }), TODAY).destination).toBe("destinationInvalid");
    expect(validateTripSearch(input({ destination: "a".repeat(81) }), TODAY).destination).toBe("destinationTooLong");
  });
});

describe("validateTripSearch — weather dates", () => {
  it("allows no dates (current weather), a past range and a forecast range", () => {
    expect(hasErrors(validateTripSearch(input({}), TODAY))).toBe(false);
    expect(validateTripSearch(input({ startDate: "2026-10-01", endDate: "2026-10-07" }), TODAY)).toEqual({});
    expect(validateTripSearch(input({ startDate: "2026-10-24", endDate: "2026-11-07" }), TODAY)).toEqual({});
  });

  it("requires a start date when only the end is set", () => {
    expect(validateTripSearch(input({ endDate: "2026-10-30" }), TODAY)).toEqual({ startDate: "startRequired" });
  });

  it("rejects reversed, too long, straddling and out-of-horizon ranges", () => {
    expect(validateTripSearch(input({ startDate: "2026-10-28", endDate: "2026-10-26" }), TODAY)).toEqual({
      endDate: "endBeforeStart",
    });
    expect(validateTripSearch(input({ startDate: "2026-09-01", endDate: "2026-09-20" }), TODAY)).toEqual({
      endDate: "rangeTooLong",
    });
    expect(validateTripSearch(input({ startDate: "2026-10-20", endDate: "2026-10-27" }), TODAY)).toEqual({
      endDate: "mixedRange",
    });
    expect(validateTripSearch(input({ startDate: "2026-11-01", endDate: "2026-11-08" }), TODAY)).toEqual({
      endDate: "beyondForecast",
    });
    expect(validateTripSearch(input({ startDate: "2026-11-20" }), TODAY)).toEqual({ startDate: "beyondForecast" });
  });

  it("flags unparseable dates", () => {
    expect(validateTripSearch(input({ startDate: "2026-02-31" }), TODAY)).toEqual({ startDate: "invalidDate" });
  });
});

describe("validateTripSearch — stays and trips", () => {
  it("rejects a past check-in and a non-positive stay", () => {
    const stays = (startDate: string, endDate = "") => validateTripSearch(input({ intent: "stays", startDate, endDate }), TODAY);
    expect(stays("2026-10-20")).toEqual({ startDate: "pastDate" });
    expect(stays("2026-10-25", "2026-10-25")).toEqual({ endDate: "checkoutAfterCheckin" });
    expect(stays("2026-10-25", "2026-10-22")).toEqual({ endDate: "checkoutAfterCheckin" });
    expect(stays("2026-10-25", "2026-12-01")).toEqual({ endDate: "stayTooLong" });
  });

  it("allows hotel dates beyond the weather horizon", () => {
    expect(validateTripSearch(input({ intent: "stays", startDate: "2027-01-10", endDate: "2027-01-14" }), TODAY)).toEqual({});
  });

  it("keeps trips within the forecast window", () => {
    expect(validateTripSearch(input({ intent: "trip", startDate: "2026-10-01" }), TODAY)).toEqual({ startDate: "pastDate" });
    expect(validateTripSearch(input({ intent: "trip", startDate: "2026-10-30", endDate: "2026-11-10" }), TODAY)).toEqual({
      endDate: "beyondForecast",
    });
    expect(validateTripSearch(input({ intent: "trip", startDate: "2026-10-26", endDate: "2026-10-30" }), TODAY)).toEqual({});
  });
});

describe("buildTripPrompt", () => {
  it("builds English prompts for each intent", () => {
    expect(buildTripPrompt(input({ destination: "  Lisbon " }), "en", TODAY)).toBe("What is the current weather in Lisbon?");
    expect(buildTripPrompt(input({ startDate: TODAY }), "en", TODAY)).toBe("What is the current weather in Kraków?");
    expect(buildTripPrompt(input({ startDate: "2026-10-20" }), "en", TODAY)).toBe(
      "What was the weather in Kraków on 2026-10-20?",
    );
    expect(buildTripPrompt(input({ startDate: "2026-10-26", endDate: "2026-10-30" }), "en", TODAY)).toBe(
      "Show me the weather forecast for Kraków from 2026-10-26 to 2026-10-30.",
    );
    expect(buildTripPrompt(input({ startDate: "2026-10-01", endDate: "2026-10-05" }), "en", TODAY)).toBe(
      "What was the weather in Kraków from 2026-10-01 to 2026-10-05?",
    );
    expect(buildTripPrompt(input({ intent: "stays", startDate: "2026-10-26", endDate: "2026-10-29" }), "en", TODAY)).toBe(
      "Find hotels in Kraków from 2026-10-26 to 2026-10-29.",
    );
    expect(buildTripPrompt(input({ intent: "trip" }), "en", TODAY)).toBe(
      "Plan a trip to Kraków including weather and hotels.",
    );
  });

  it("builds Polish prompts without inflecting the place name", () => {
    expect(buildTripPrompt(input({}), "pl", TODAY)).toBe("Kraków: jaka jest teraz pogoda?");
    expect(buildTripPrompt(input({ startDate: "2026-10-27" }), "pl", TODAY)).toBe(
      "Kraków: jaka będzie pogoda w dniu 2026-10-27?",
    );
    expect(buildTripPrompt(input({ intent: "stays", startDate: "2026-10-26" }), "pl", TODAY)).toBe(
      "Kraków: znajdź hotele z zameldowaniem 2026-10-26.",
    );
    expect(buildTripPrompt(input({ intent: "trip", startDate: "2026-10-26", endDate: "2026-10-28" }), "pl", TODAY)).toBe(
      "Kraków: zaplanuj podróż z pogodą i hotelami od 2026-10-26 do 2026-10-28.",
    );
  });
});
