import { useId, useState, type FormEvent, type ReactNode } from "react";
import { BedDouble, CloudSun, Route, Search, type LucideIcon } from "lucide-react";
import { FORECAST_HORIZON_DAYS, MAX_DESTINATION_LENGTH, MAX_RANGE_DAYS, MAX_STAY_NIGHTS } from "@/app/constants/chat";
import { useLanguage } from "@/app/hooks/useLanguage";
import { addDays, formatDate, todayIso } from "@/app/utils/format";
import {
  buildTripPrompt,
  hasErrors,
  validateTripSearch,
  type TripErrorCode,
  type TripErrors,
  type TripField,
  type TripIntent,
  type TripSearchInput,
} from "@/app/utils/tripPrompt";

const INTENTS: { value: TripIntent; icon: LucideIcon }[] = [
  { value: "weather", icon: CloudSun },
  { value: "stays", icon: BedDouble },
  { value: "trip", icon: Route },
];

function Segment({
  label,
  htmlFor,
  invalid,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  invalid: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl px-5 py-2.5 transition-colors focus-within:bg-surface focus-within:shadow-pill md:rounded-full md:py-3 md:hover:bg-surface-muted md:focus-within:hover:bg-surface ${
        invalid ? "ring-1 ring-inset ring-danger md:ring-0" : ""
      } ${className}`}
    >
      <label htmlFor={htmlFor} className={`block text-xs font-semibold ${invalid ? "text-danger" : "text-ink"}`}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function TripSearch({
  onSearch,
  disabled,
}: {
  onSearch: (message: string) => Promise<boolean>;
  disabled: boolean;
}) {
  const { t, lang, locale } = useLanguage();
  const formId = useId();
  const [input, setInput] = useState<TripSearchInput>({ intent: "weather", destination: "", startDate: "", endDate: "" });
  const [errors, setErrors] = useState<TripErrors>({});
  const [expanded, setExpanded] = useState(false);
  // "Today" is pinned for rendering (picker bounds, hints); submit re-reads the clock.
  const [today] = useState(todayIso);

  const isStays = input.intent === "stays";
  const horizon = addDays(today, FORECAST_HORIZON_DAYS);
  const ids = {
    destination: `${formId}-destination`,
    startDate: `${formId}-start`,
    endDate: `${formId}-end`,
    errors: `${formId}-errors`,
  };

  // Native min/max guide the date pickers; validateTripSearch stays the source of truth.
  const minDate = input.intent === "weather" ? undefined : today;
  const maxDate = isStays ? undefined : horizon;

  const update = (field: keyof TripSearchInput, value: string) => {
    setInput((prev) => ({ ...prev, [field]: value }));
    if (field === "intent") setErrors({});
    else setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const messageFor = (code: TripErrorCode): string => {
    switch (code) {
      case "destinationTooLong":
        return t("search.error.destinationTooLong", { max: MAX_DESTINATION_LENGTH });
      case "rangeTooLong":
        return t("search.error.rangeTooLong", { max: MAX_RANGE_DAYS });
      case "stayTooLong":
        return t("search.error.stayTooLong", { max: MAX_STAY_NIGHTS });
      case "beyondForecast":
        return t("search.error.beyondForecast", {
          date: formatDate(horizon, locale, { day: "numeric", month: "long" }),
        });
      default:
        return t(`search.error.${code}`);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (disabled) return;
    const now = todayIso();
    const found = validateTripSearch(input, now);
    setErrors(found);
    if (hasErrors(found)) {
      const firstInvalid = (["destination", "startDate", "endDate"] as TripField[]).find((f) => found[f]);
      if (firstInvalid) document.getElementById(ids[firstInvalid])?.focus();
      return;
    }
    const accepted = await onSearch(buildTripPrompt(input, lang, now));
    if (accepted) setExpanded(false);
  };

  const errorEntries = (Object.entries(errors) as [TripField, TripErrorCode | undefined][]).filter(
    (entry): entry is [TripField, TripErrorCode] => Boolean(entry[1]),
  );
  const describedBy = (field: TripField) => (errors[field] ? ids.errors : undefined);
  const inputClass =
    "mt-0.5 w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted";

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Phones: one compact pill that opens the full form */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={formId}
        className="focus-ring flex w-full items-center gap-3 rounded-full border border-line bg-surface px-4 py-3 text-left shadow-pill md:hidden"
      >
        <Search className="size-5 shrink-0 text-ink" aria-hidden="true" />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink">{t("search.collapsedTitle")}</span>
          <span className="block truncate text-xs text-ink-muted">{t("search.collapsedSubtitle")}</span>
        </span>
      </button>

      <form
        id={formId}
        aria-label={t("search.label")}
        noValidate
        onSubmit={handleSubmit}
        className={`${expanded ? "mt-3 block" : "hidden"} card p-4 md:mt-0 md:block md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
      >
        <fieldset>
          <legend className="sr-only">{t("search.intent")}</legend>
          <div className="mb-3 flex justify-center gap-1 md:mb-4">
            {INTENTS.map(({ value, icon: Icon }) => {
              const checked = input.intent === value;
              return (
                <label
                  key={value}
                  className={`relative inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink ${
                    checked ? "bg-ink text-surface" : "text-ink-secondary hover:bg-surface-muted hover:text-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name={`${formId}-intent`}
                    value={value}
                    checked={checked}
                    onChange={() => update("intent", value)}
                    className="sr-only"
                  />
                  <Icon className="size-4" aria-hidden="true" />
                  {t(`search.intent.${value}`)}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-2 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-center md:gap-0 md:rounded-full md:border md:border-line md:bg-surface md:p-1.5 md:shadow-pill">
          <Segment label={t("search.where")} htmlFor={ids.destination} invalid={Boolean(errors.destination)}>
            <input
              id={ids.destination}
              type="text"
              inputMode="search"
              autoComplete="off"
              enterKeyHint="search"
              maxLength={MAX_DESTINATION_LENGTH}
              value={input.destination}
              onChange={(e) => update("destination", e.target.value)}
              placeholder={t("search.wherePlaceholder")}
              aria-invalid={Boolean(errors.destination)}
              aria-describedby={describedBy("destination")}
              className={inputClass}
            />
          </Segment>
          <Segment
            label={isStays ? t("search.checkIn") : t("search.from")}
            htmlFor={ids.startDate}
            invalid={Boolean(errors.startDate)}
            className="md:border-l md:border-line md:hover:border-transparent"
          >
            <input
              id={ids.startDate}
              type="date"
              value={input.startDate}
              min={minDate}
              max={maxDate}
              onChange={(e) => update("startDate", e.target.value)}
              aria-invalid={Boolean(errors.startDate)}
              aria-describedby={describedBy("startDate")}
              className={inputClass}
            />
          </Segment>
          <Segment
            label={isStays ? t("search.checkOut") : t("search.to")}
            htmlFor={ids.endDate}
            invalid={Boolean(errors.endDate)}
            className="md:border-l md:border-line md:hover:border-transparent"
          >
            <input
              id={ids.endDate}
              type="date"
              value={input.endDate}
              min={input.startDate || minDate}
              max={maxDate}
              onChange={(e) => update("endDate", e.target.value)}
              aria-invalid={Boolean(errors.endDate)}
              aria-describedby={describedBy("endDate")}
              className={inputClass}
            />
          </Segment>
          <button
            type="submit"
            disabled={disabled}
            className="focus-ring mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-5 font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 md:mt-0 md:size-12 md:px-0 lg:w-auto lg:px-5"
          >
            <Search className="size-5" strokeWidth={2.25} aria-hidden="true" />
            <span className="md:sr-only lg:not-sr-only">{t("search.submit")}</span>
          </button>
        </div>

        <div id={ids.errors} aria-live="polite" className="mt-2 px-2 md:px-6">
          {errorEntries.length > 0 ? (
            <ul className="space-y-0.5 text-sm text-danger">
              {errorEntries.map(([field, code]) => (
                <li key={field}>{messageFor(code)}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-ink-muted">{t(`search.hint.${input.intent}`)}</p>
          )}
        </div>
      </form>
    </div>
  );
}
