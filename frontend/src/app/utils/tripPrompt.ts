import {
  FORECAST_HORIZON_DAYS,
  MAX_DESTINATION_LENGTH,
  MAX_RANGE_DAYS,
  MAX_STAY_NIGHTS,
} from "@/app/constants/chat";
import type { Lang } from "@/app/types/types";
import { addDays, diffInDays, normalizeIsoDate } from "./format";

export type TripIntent = "weather" | "stays" | "trip";

export interface TripSearchInput {
  intent: TripIntent;
  destination: string;
  startDate: string; // "" or YYYY-MM-DD (native date input value)
  endDate: string;
}

export type TripField = "destination" | "startDate" | "endDate";

export type TripErrorCode =
  | "destinationRequired"
  | "destinationInvalid"
  | "destinationTooLong"
  | "invalidDate"
  | "startRequired"
  | "endBeforeStart"
  | "rangeTooLong"
  | "beyondForecast"
  | "mixedRange"
  | "pastDate"
  | "checkoutAfterCheckin"
  | "stayTooLong";

export type TripErrors = Partial<Record<TripField, TripErrorCode>>;

// Letters (any script, incl. diacritics), digits, spaces and the punctuation
// real place names use: "Saint-Étienne", "Xi'an", "Washington, D.C.".
const PLACE_PATTERN = /^[\p{L}\p{M}\p{N}\s'’.,()-]+$/u;
const LETTER = /\p{L}/gu;

export function normalizeDestination(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function validateDestination(raw: string): TripErrorCode | null {
  const destination = normalizeDestination(raw);
  if (!destination) return "destinationRequired";
  if (destination.length > MAX_DESTINATION_LENGTH) return "destinationTooLong";
  if (!PLACE_PATTERN.test(destination) || (destination.match(LETTER)?.length ?? 0) < 2) {
    return "destinationInvalid";
  }
  return null;
}

/**
 * Validate the structured search against what the backend can actually answer:
 * forecasts reach today + 14 days, history is any past range, hotel check-in
 * can't be in the past. `today` is injected for deterministic tests.
 */
export function validateTripSearch(input: TripSearchInput, today: string): TripErrors {
  const errors: TripErrors = {};
  const destinationError = validateDestination(input.destination);
  if (destinationError) errors.destination = destinationError;

  const start = input.startDate ? normalizeIsoDate(input.startDate) : null;
  const end = input.endDate ? normalizeIsoDate(input.endDate) : null;
  if (input.startDate && !start) errors.startDate = "invalidDate";
  if (input.endDate && !end) errors.endDate = "invalidDate";
  if (errors.startDate || errors.endDate) return errors;

  if (end && !start) {
    errors.startDate = "startRequired";
    return errors;
  }
  if (!start) return errors;

  const last = end ?? start;
  if (diffInDays(start, last) < 0) {
    errors.endDate = input.intent === "stays" ? "checkoutAfterCheckin" : "endBeforeStart";
    return errors;
  }

  const horizon = addDays(today, FORECAST_HORIZON_DAYS);

  if (input.intent === "stays") {
    if (diffInDays(today, start) < 0) errors.startDate = "pastDate";
    else if (end && diffInDays(start, end) < 1) errors.endDate = "checkoutAfterCheckin";
    else if (end && diffInDays(start, end) > MAX_STAY_NIGHTS) errors.endDate = "stayTooLong";
    return errors;
  }

  if (diffInDays(start, last) + 1 > MAX_RANGE_DAYS) {
    errors.endDate = "rangeTooLong";
    return errors;
  }

  if (input.intent === "trip" && diffInDays(today, start) < 0) {
    errors.startDate = "pastDate";
    return errors;
  }

  // Weather: a range is either history (entirely past) or forecast (today on);
  // the agent picks one tool per request, so a range straddling today fails.
  if (diffInDays(today, start) < 0 && diffInDays(today, last) >= 0) {
    errors.endDate = "mixedRange";
  } else if (diffInDays(horizon, last) > 0) {
    errors[end && diffInDays(horizon, start) <= 0 ? "endDate" : "startDate"] = "beyondForecast";
  }
  return errors;
}

export function hasErrors(errors: TripErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Turn a valid search into a chat message in the UI language. Dates stay ISO
 * so the agent resolves them unambiguously; Polish phrasing keeps the place
 * name in the nominative ("Kraków: …") because user input isn't inflected.
 */
export function buildTripPrompt(input: TripSearchInput, lang: Lang, today: string): string {
  const city = normalizeDestination(input.destination);
  const start = input.startDate || null;
  const end = input.endDate && input.endDate !== input.startDate ? input.endDate : null;
  const isPast = start !== null && diffInDays(today, end ?? start) < 0;
  const isToday = start === today && end === null;

  if (lang === "pl") {
    switch (input.intent) {
      case "weather":
        if (!start || isToday) return `${city}: jaka jest teraz pogoda?`;
        if (!end) return `${city}: jaka ${isPast ? "była" : "będzie"} pogoda w dniu ${start}?`;
        return isPast
          ? `${city}: jaka była pogoda od ${start} do ${end}?`
          : `${city}: pokaż prognozę pogody od ${start} do ${end}.`;
      case "stays":
        if (!start) return `${city}: znajdź hotele.`;
        return end
          ? `${city}: znajdź hotele od ${start} do ${end}.`
          : `${city}: znajdź hotele z zameldowaniem ${start}.`;
      case "trip":
        if (!start) return `${city}: zaplanuj podróż z pogodą i hotelami.`;
        return end
          ? `${city}: zaplanuj podróż z pogodą i hotelami od ${start} do ${end}.`
          : `${city}: zaplanuj podróż z pogodą i hotelami na ${start}.`;
    }
  }

  switch (input.intent) {
    case "weather":
      if (!start || isToday) return `What is the current weather in ${city}?`;
      if (!end) {
        return isPast
          ? `What was the weather in ${city} on ${start}?`
          : `What is the weather forecast for ${city} on ${start}?`;
      }
      return isPast
        ? `What was the weather in ${city} from ${start} to ${end}?`
        : `Show me the weather forecast for ${city} from ${start} to ${end}.`;
    case "stays":
      if (!start) return `Find hotels in ${city}.`;
      return end
        ? `Find hotels in ${city} from ${start} to ${end}.`
        : `Find hotels in ${city} with check-in on ${start}.`;
    case "trip":
      if (!start) return `Plan a trip to ${city} including weather and hotels.`;
      return end
        ? `Plan a trip to ${city} including weather and hotels from ${start} to ${end}.`
        : `Plan a trip to ${city} including weather and hotels for ${start}.`;
  }
}
