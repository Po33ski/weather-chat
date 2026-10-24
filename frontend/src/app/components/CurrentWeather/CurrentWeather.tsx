import { Clock, Droplets, Gauge, Navigation2, Sunrise, Sunset, Wind } from "lucide-react";
import { PackingTips } from "@/app/components/PackingTips/PackingTips";
import { StatTile } from "@/app/components/StatTile/StatTile";
import { WeatherIcon } from "@/app/components/WeatherIcon/WeatherIcon";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useUnitSystem } from "@/app/hooks/useUnitSystem";
import type { CurrentDataDay } from "@/app/types/interfaces";
import { formatClock, formatDuration, formatNumber } from "@/app/utils/format";
import {
  convertTemperature,
  daylightMinutes,
  formatSpeed,
  formatTemperature,
  roundForDisplay,
  toCardinal,
  translateConditions,
} from "@/app/utils/weather";

const tileIcon = "size-4 text-ink-muted";

/** Where "now" sits between today's low and high — a meter on the cool→warm scale. */
function TemperatureRange({ current }: { current: CurrentDataDay }) {
  const { t, locale } = useLanguage();
  const { units } = useUnitSystem();
  const { temp, tempmin, tempmax } = current;
  if (temp === null || tempmin === null || tempmax === null || tempmax <= tempmin) return null;

  const position = Math.min(1, Math.max(0, (temp - tempmin) / (tempmax - tempmin))) * 100;
  return (
    <div className="border-t border-line px-6 py-5 sm:px-8">
      <p className="text-sm font-medium text-ink-secondary">{t("weather.todayRange")}</p>
      <div className="mt-3 flex items-center gap-3 text-sm tabular-nums">
        <span className="text-ink-muted">
          {t("weather.low")} <span className="font-semibold text-ink">{formatTemperature(tempmin, units, locale)}</span>
        </span>
        <div className="relative h-2 flex-1 rounded-full" aria-hidden="true"
          style={{ background: "linear-gradient(90deg, var(--chart-cool), var(--chart-warm))" }}
        >
          <span
            className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-ink shadow"
            style={{ left: `${position}%` }}
          />
        </div>
        <span className="text-ink-muted">
          {t("weather.high")} <span className="font-semibold text-ink">{formatTemperature(tempmax, units, locale)}</span>
        </span>
      </div>
    </div>
  );
}

export function CurrentWeather({ current }: { current: CurrentDataDay }) {
  const { t, lang, locale } = useLanguage();
  const { id: unitSystem, units } = useUnitSystem();
  const hour12 = unitSystem === "US";

  const conditions = translateConditions(current.conditions, lang);
  const cardinal = toCardinal(current.winddir);
  const daylight = daylightMinutes(current.sunrise, current.sunset);
  const temperature =
    current.temp === null ? "—" : formatNumber(roundForDisplay(convertTemperature(current.temp, units)), locale);

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <div className="flex items-start justify-between gap-6 p-6 sm:p-8">
          <div className="min-w-0">
            <p className="eyebrow">{t("weather.now")}</p>
            <p className="mt-2 flex items-start text-7xl font-semibold leading-none tracking-tight">
              {temperature}
              {current.temp !== null && <span className="ml-1 mt-1 text-3xl font-medium text-ink-muted">{units.temperature}</span>}
            </p>
            <p className="mt-3 text-lg text-ink-secondary">{conditions || t("weather.unknown")}</p>
          </div>
          <div className="grid size-20 shrink-0 place-items-center rounded-full bg-surface-muted sm:size-24">
            <WeatherIcon conditions={current.conditions} className="size-11 text-ink sm:size-12" strokeWidth={1.5} />
          </div>
        </div>
        <TemperatureRange current={current} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile
          icon={<Wind className={tileIcon} aria-hidden="true" />}
          label={t("weather.wind")}
          value={formatSpeed(current.windspeed, units, locale)}
          unit={units.distance}
          sub={
            cardinal && current.winddir !== null ? (
              <span className="inline-flex items-center gap-1.5">
                {/* Arrow shows where the wind blows to; the label says where it comes from. */}
                <Navigation2
                  className="size-3.5 fill-current"
                  style={{ transform: `rotate(${(current.winddir + 180) % 360}deg)` }}
                  aria-hidden="true"
                />
                {t("weather.windFrom", { dir: t(`dir.${cardinal}`) })}
              </span>
            ) : undefined
          }
        />
        <StatTile
          icon={<Droplets className={tileIcon} aria-hidden="true" />}
          label={t("weather.humidity")}
          value={current.humidity === null ? "—" : formatNumber(Math.round(current.humidity), locale)}
          unit="%"
        >
          {current.humidity !== null && (
            <div className="mt-3 h-1.5 rounded-full bg-surface-muted" aria-hidden="true">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, current.humidity))}%`, background: "var(--chart-cool)" }}
              />
            </div>
          )}
        </StatTile>
        <StatTile
          icon={<Gauge className={tileIcon} aria-hidden="true" />}
          label={t("weather.pressure")}
          value={current.pressure === null ? "—" : formatNumber(Math.round(current.pressure), locale)}
          unit="hPa"
        />
        <StatTile
          icon={<Sunrise className={tileIcon} aria-hidden="true" />}
          label={t("weather.sunrise")}
          value={formatClock(current.sunrise, locale, hour12) ?? "—"}
        />
        <StatTile
          icon={<Sunset className={tileIcon} aria-hidden="true" />}
          label={t("weather.sunset")}
          value={formatClock(current.sunset, locale, hour12) ?? "—"}
        />
        <StatTile
          icon={<Clock className={tileIcon} aria-hidden="true" />}
          label={t("weather.daylight")}
          value={daylight === null ? "—" : formatDuration(daylight, lang)}
        />
      </div>

      <PackingTips
        input={{
          minTemp: current.tempmin ?? current.temp,
          maxTemp: current.tempmax ?? current.temp,
          maxWind: current.windspeed,
          conditions: [current.conditions],
        }}
      />
    </div>
  );
}
