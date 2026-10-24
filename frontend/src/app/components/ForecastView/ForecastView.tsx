import { CloudRain, Flame, ThermometerSnowflake, ThermometerSun } from "lucide-react";
import { DayList } from "@/app/components/DayList/DayList";
import { PackingTips } from "@/app/components/PackingTips/PackingTips";
import { StatTile } from "@/app/components/StatTile/StatTile";
import { WeatherCharts } from "@/app/components/WeatherCharts/WeatherCharts";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useUnitSystem } from "@/app/hooks/useUnitSystem";
import type { HistoryAndForecastDay } from "@/app/types/interfaces";
import { formatDate } from "@/app/utils/format";
import { formatTemperature, packingInputFromDays, summarizeDays } from "@/app/utils/weather";

const tileIcon = "size-4 text-ink-muted";

export function ForecastView({ days, kind }: { days: HistoryAndForecastDay[]; kind: "forecast" | "history" }) {
  const { t, locale } = useLanguage();
  const { units } = useUnitSystem();
  const summary = summarizeDays(days);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          icon={<ThermometerSun className={tileIcon} aria-hidden="true" />}
          label={t("forecast.avgHigh")}
          value={formatTemperature(summary.avgHigh, units, locale)}
        />
        <StatTile
          icon={<ThermometerSnowflake className={tileIcon} aria-hidden="true" />}
          label={t("forecast.avgLow")}
          value={formatTemperature(summary.avgLow, units, locale)}
        />
        <StatTile
          icon={<CloudRain className={tileIcon} aria-hidden="true" />}
          label={t("forecast.wetDays")}
          value={t("forecast.wetDaysValue", { count: summary.wetDays, total: summary.total })}
        />
        <StatTile
          icon={<Flame className={tileIcon} aria-hidden="true" />}
          label={t("forecast.warmest")}
          value={summary.warmest ? formatTemperature(summary.warmest.tempmax, units, locale) : "—"}
          sub={
            summary.warmest?.datetime
              ? formatDate(summary.warmest.datetime, locale, { weekday: "short", day: "numeric", month: "short" })
              : undefined
          }
        />
      </div>

      {/* A single day has no trend to plot — the tiles and the list carry it. */}
      {days.length > 1 && <WeatherCharts days={days} />}
      <DayList days={days} />
      {kind === "forecast" && <PackingTips input={packingInputFromDays(days)} />}
    </div>
  );
}
