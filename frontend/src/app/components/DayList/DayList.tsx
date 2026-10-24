import { useId } from "react";
import { Droplets, Wind } from "lucide-react";
import { WeatherIcon } from "@/app/components/WeatherIcon/WeatherIcon";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useUnitSystem } from "@/app/hooks/useUnitSystem";
import type { HistoryAndForecastDay } from "@/app/types/interfaces";
import { extent } from "@/app/utils/chartScale";
import { formatDate, formatNumber } from "@/app/utils/format";
import { formatSpeed, formatTemperature, translateConditions } from "@/app/utils/weather";

/** Low–high bar positioned on the scale of the whole period, so days compare at a glance. */
function RangeBar({ low, high, scale }: { low: number; high: number; scale: [number, number] }) {
  const span = scale[1] - scale[0] || 1;
  const left = ((low - scale[0]) / span) * 100;
  const width = Math.max(((high - low) / span) * 100, 4);
  return (
    <div className="relative h-1.5 w-full rounded-full bg-surface-muted" aria-hidden="true">
      <div
        className="absolute inset-y-0 rounded-full"
        style={{
          left: `${Math.min(left, 96)}%`,
          width: `${width}%`,
          background: "linear-gradient(90deg, var(--chart-cool), var(--chart-warm))",
        }}
      />
    </div>
  );
}

export function DayList({ days }: { days: HistoryAndForecastDay[] }) {
  const { t, lang, locale } = useLanguage();
  const { units } = useUnitSystem();
  const titleId = useId();
  const scale = extent(days.flatMap((d) => [d.tempmin, d.tempmax])) ?? [0, 1];

  return (
    <section className="card overflow-hidden" aria-labelledby={titleId}>
      <h3 id={titleId} className="px-5 pt-5 text-lg font-semibold sm:px-6">
        {t("forecast.dayByDay")}
      </h3>
      <table className="mt-3 w-full text-sm">
        <thead className="sr-only">
          <tr>
            <th scope="col">{t("weather.date")}</th>
            <th scope="col">{t("weather.conditions")}</th>
            <th scope="col">
              {t("weather.low")} / {t("weather.high")} ({units.temperature})
            </th>
            <th scope="col">
              {t("weather.wind")} ({units.distance})
            </th>
            <th scope="col">{t("weather.humidity")} (%)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {days.map((day, i) => {
            const conditions = translateConditions(day.conditions, lang);
            return (
              <tr key={day.datetime ?? i} className="transition-colors hover:bg-surface-muted/60">
                <th scope="row" className="py-3.5 pl-5 pr-3 text-left font-normal sm:pl-6">
                  <span className="block font-semibold capitalize text-ink">
                    {formatDate(day.datetime, locale, { weekday: "short" })}
                  </span>
                  <span className="block text-ink-muted">
                    {formatDate(day.datetime, locale, { day: "numeric", month: "short" })}
                  </span>
                </th>
                <td className="px-2 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <WeatherIcon conditions={day.conditions} className="size-6 shrink-0 text-ink" />
                    <span className="hidden max-w-[11rem] truncate text-ink-secondary md:inline">
                      {conditions || t("weather.unknown")}
                    </span>
                    <span className="sr-only md:hidden">{conditions}</span>
                  </div>
                  {/* Wind/humidity columns are hidden on phones — keep the values reachable here. */}
                  <p className="mt-1 whitespace-nowrap text-xs tabular-nums text-ink-muted sm:hidden">
                    {formatSpeed(day.windspeed, units, locale)} {units.distance} ·{" "}
                    {day.humidity !== null ? `${formatNumber(Math.round(day.humidity), locale)}%` : "—"}
                  </p>
                </td>
                <td className="w-[38%] px-3 py-3.5">
                  <div className="flex items-center gap-2.5 tabular-nums">
                    <span className="w-9 text-right text-ink-muted">
                      {formatTemperature(day.tempmin, units, locale)}
                    </span>
                    {day.tempmin !== null && day.tempmax !== null ? (
                      <RangeBar low={day.tempmin} high={day.tempmax} scale={scale} />
                    ) : (
                      <div className="h-1.5 w-full rounded-full bg-surface-muted" aria-hidden="true" />
                    )}
                    <span className="w-9 font-semibold text-ink">{formatTemperature(day.tempmax, units, locale)}</span>
                  </div>
                </td>
                <td className="hidden px-3 py-3.5 text-ink-secondary sm:table-cell">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap tabular-nums">
                    <Wind className="size-4 text-ink-muted" aria-hidden="true" />
                    {formatSpeed(day.windspeed, units, locale)}
                    <span className="text-ink-muted">{units.distance}</span>
                  </span>
                </td>
                <td className="hidden py-3.5 pl-3 pr-5 text-ink-secondary sm:table-cell sm:pr-6">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap tabular-nums">
                    <Droplets className="size-4 text-ink-muted" aria-hidden="true" />
                    {day.humidity !== null ? `${formatNumber(Math.round(day.humidity), locale)}%` : "—"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
