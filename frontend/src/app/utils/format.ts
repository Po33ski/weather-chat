const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_RANGE = /^(\d{4}-\d{2}-\d{2})\.\.(\d{4}-\d{2}-\d{2})$/;
const CLOCK = /^(\d{1,2}):(\d{2})(?::\d{2})?$/;
const MS_PER_DAY = 86_400_000;

/**
 * Parse a calendar date ("YYYY-MM-DD", optionally followed by a time part) as
 * a *local* date. `new Date("2026-08-08")` would be UTC midnight and render as
 * the previous day west of Greenwich. Impossible dates (Feb 31) return null.
 */
export function parseIsoDate(value: string | null | undefined): Date | null {
  if (typeof value !== "string") return null;
  const match = ISO_DATE.exec(value.trim().split("T")[0]);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

export function normalizeIsoDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const date = parseIsoDate(value);
  return date ? toIsoDate(date) : null;
}

export function toIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayIso(now: Date = new Date()): string {
  return toIsoDate(now);
}

export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  if (!date) return iso;
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/** Whole calendar days from `from` to `to` (negative when `to` is earlier). */
export function diffInDays(from: string, to: string): number {
  const a = parseIsoDate(from);
  const b = parseIsoDate(to);
  if (!a || !b) return Number.NaN;
  // Rounding absorbs the ±1 h of a DST switch between the two dates.
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

export function parseDateRange(
  range: string | null | undefined,
): { start: string; end: string } | null {
  if (typeof range !== "string") return null;
  const match = DATE_RANGE.exec(range.trim());
  if (!match) return null;
  const [start, end] = [normalizeIsoDate(match[1]), normalizeIsoDate(match[2])];
  if (!start || !end || diffInDays(start, end) < 0) return null;
  return { start, end };
}

export function formatDate(
  iso: string | null | undefined,
  locale: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
): string {
  const date = parseIsoDate(iso);
  return date ? new Intl.DateTimeFormat(locale, options).format(date) : (iso ?? "");
}

export function formatDateRange(start: string, end: string, locale: string): string {
  const a = parseIsoDate(start);
  const b = parseIsoDate(end);
  if (!a || !b) return `${start} – ${end}`;
  const format = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return start === end ? format.format(a) : format.formatRange(a, b);
}

/** Minutes since midnight for "HH:MM" / "HH:MM:SS", or null when invalid. */
export function parseClock(value: string | null | undefined): number | null {
  if (typeof value !== "string") return null;
  const match = CLOCK.exec(value.trim());
  if (!match) return null;
  const [hours, minutes] = [Number(match[1]), Number(match[2])];
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function formatClock(
  value: string | null | undefined,
  locale: string,
  hour12: boolean,
): string | null {
  const minutes = parseClock(value);
  if (minutes === null) return null;
  const date = new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60);
  return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", hour12 }).format(
    date,
  );
}

export function formatDuration(totalMinutes: number, lang: "en" | "pl"): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return lang === "pl" ? `${hours} godz. ${minutes} min` : `${hours} h ${minutes} min`;
}

export function formatNumber(value: number, locale: string, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);
}

/**
 * Parse a price string coming from LLM-assembled data: "450", "1,200",
 * "1 200,50", "120.5". Returns null for anything that isn't a single amount.
 */
export function parseAmount(value: string | null | undefined): number | null {
  if (typeof value !== "string") return null;
  // \s also covers the NBSP / narrow NBSP that Intl uses as thousands separators.
  let text = value.replace(/\s/g, "");
  if (!/^\d[\d.,]*$/.test(text)) return null;

  const lastComma = text.lastIndexOf(",");
  const lastDot = text.lastIndexOf(".");
  if (lastComma !== -1 && lastDot !== -1) {
    // Both present: whichever comes last is the decimal separator.
    const decimal = lastComma > lastDot ? "," : ".";
    const thousands = decimal === "," ? "." : ",";
    text = text.split(thousands).join("").replace(decimal, ".");
  } else if (lastComma !== -1) {
    text = /^\d{1,3}(,\d{3})+$/.test(text) ? text.replace(/,/g, "") : text.replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(text)) {
    // "1.200" is a European thousands separator — prices never carry 3 decimals.
    text = text.replace(/\./g, "");
  }

  const amount = Number(text);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

export function formatPrice(amount: number, currency: string, locale: string): string {
  const fractionDigits = Number.isInteger(amount) ? 0 : 2;
  const code = currency.trim().toUpperCase();
  if (/^[A-Z]{3}$/.test(code)) {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: code,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).format(amount);
    } catch {
      // Unknown ISO code — fall back to "<amount> <code>" below.
    }
  }
  const number = formatNumber(amount, locale, fractionDigits);
  return code ? `${number} ${code}` : number;
}

/** Only http(s) links may become clickable — defense in depth on top of the backend check. */
export function safeHttpUrl(value: string | null | undefined): URL | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export function displayHost(url: URL): string {
  return url.hostname.replace(/^www\./, "");
}
