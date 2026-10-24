import { useId, useMemo, useState } from "react";
import { Droplets, Gauge, Thermometer, Wind } from "lucide-react";
import { SegmentedControl } from "@/app/components/SegmentedControl/SegmentedControl";
import { TimeSeriesChart, type ChartSeries } from "@/app/components/TimeSeriesChart/TimeSeriesChart";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useUnitSystem } from "@/app/hooks/useUnitSystem";
import type { HistoryAndForecastDay } from "@/app/types/interfaces";
import { formatDate, formatNumber } from "@/app/utils/format";
import { convertSpeed, convertTemperature, roundForDisplay, translateConditions } from "@/app/utils/weather";

type Metric = "temperature" | "wind" | "humidity" | "pressure";

const iconClass = "size-4";

export function WeatherCharts({ days }: { days: HistoryAndForecastDay[] }) {
  const { t, lang, locale } = useLanguage();
  const { units } = useUnitSystem();
  const [metric, setMetric] = useState<Metric>("temperature");
  const idPrefix = useId();

  const points = useMemo(
    () =>
      days.map((day) => ({
        label: formatDate(day.datetime, locale, { weekday: "short", day: "numeric" }),
        fullLabel: formatDate(day.datetime, locale, { weekday: "long", day: "numeric", month: "long" }),
        detail: translateConditions(day.conditions, lang) || undefined,
      })),
    [days, locale, lang],
  );

  const chart = useMemo(() => {
    const round = (value: number) => formatNumber(roundForDisplay(value), locale);
    const temperature = (value: number | null) => (value === null ? null : convertTemperature(value, units));

    switch (metric) {
      case "temperature": {
        const high = days.map((d) => temperature(d.tempmax));
        const low = days.map((d) => temperature(d.tempmin));
        const series: ChartSeries[] = [
          { id: "high", label: t("weather.high"), color: "var(--chart-warm)", values: high },
          { id: "low", label: t("weather.low"), color: "var(--chart-cool)", values: low },
        ];
        return {
          type: "line" as const,
          series,
          band: { upper: high, lower: low },
          formatValue: (v: number) => `${round(v)}${units.temperature}`,
          formatTick: (v: number) => `${round(v)}°`,
        };
      }
      case "wind":
        return {
          type: "bar" as const,
          series: [
            {
              id: "wind",
              label: t("weather.wind"),
              color: "var(--chart-cool)",
              values: days.map((d) => (d.windspeed === null ? null : convertSpeed(d.windspeed, units))),
            },
          ],
          zeroBased: true,
          formatValue: (v: number) => `${round(v)} ${units.distance}`,
          formatTick: round,
        };
      case "humidity":
        return {
          type: "bar" as const,
          series: [
            { id: "humidity", label: t("weather.humidity"), color: "var(--chart-cool)", values: days.map((d) => d.humidity) },
          ],
          domain: [0, 100] as [number, number],
          formatValue: (v: number) => `${round(v)}%`,
          formatTick: (v: number) => `${round(v)}%`,
        };
      case "pressure":
        return {
          type: "line" as const,
          series: [
            { id: "pressure", label: t("weather.pressure"), color: "var(--chart-cool)", values: days.map((d) => d.pressure) },
          ],
          formatValue: (v: number) => `${round(v)} hPa`,
          formatTick: round,
        };
    }
  }, [metric, days, units, t, locale]);

  const metricLabel: Record<Metric, string> = {
    temperature: t("weather.temperature"),
    wind: t("weather.wind"),
    humidity: t("weather.humidity"),
    pressure: t("weather.pressure"),
  };

  return (
    <section className="card p-5 sm:p-6" aria-labelledby={`${idPrefix}-title`}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 id={`${idPrefix}-title`} className="text-lg font-semibold">
          {t("forecast.trends")}
        </h3>
        <SegmentedControl<Metric>
          idPrefix={idPrefix}
          label={t("forecast.metrics")}
          value={metric}
          onChange={setMetric}
          options={[
            { value: "temperature", label: metricLabel.temperature, icon: <Thermometer className={iconClass} aria-hidden="true" /> },
            { value: "wind", label: metricLabel.wind, icon: <Wind className={iconClass} aria-hidden="true" /> },
            { value: "humidity", label: metricLabel.humidity, icon: <Droplets className={iconClass} aria-hidden="true" /> },
            { value: "pressure", label: metricLabel.pressure, icon: <Gauge className={iconClass} aria-hidden="true" /> },
          ]}
        />
      </div>

      <div role="tabpanel" id={`${idPrefix}-panel`} aria-labelledby={`${idPrefix}-tab-${metric}`}>
        <TimeSeriesChart
          key={metric}
          points={points}
          ariaLabel={`${metricLabel[metric]} — ${t("forecast.trends")}`}
          hint={t("forecast.chartHint")}
          {...chart}
        />
      </div>
    </section>
  );
}
