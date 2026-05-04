import { useContext } from "react";
import { UnitSystemContext } from "@/app/contexts/UnitSystemContext";
import { UNIT_SYSTEMS } from "@/app/constants/unitSystems";
import { Icon } from "../Icon/Icon";
import "../../weather_icons_data/css/weather-icons.css";
import { findDirection, systemsConvert, translateConditions } from "@/app/functions/functions";
import { HistoryAndForecastDay } from "@/app/types/interfaces";
import { LanguageContext } from "@/app/contexts/LanguageContext";

export function List({ data }: { data: HistoryAndForecastDay[] }) {
  const unitSystemContext = useContext(UnitSystemContext);
  const lang = useContext(LanguageContext);

  const unitSystem =
    unitSystemContext?.unitSystem.data === "US" ||
    unitSystemContext?.unitSystem.data === "METRIC" ||
    unitSystemContext?.unitSystem.data === "UK"
      ? unitSystemContext.unitSystem.data
      : "METRIC";

  const isF = UNIT_SYSTEMS[unitSystem].temperature !== "°C";
  const isMph = UNIT_SYSTEMS[unitSystem].distance !== "km/h";

  return (
    <div className="space-y-3">
      {/* Mobile / Tablet: card grid */}
      <div className="block xl:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.map((day, index) => {
            const date = typeof day.datetime === "string" ? day.datetime.split("T")[0] : day.datetime;
            const maxT = isF ? systemsConvert.toFahrenheit(day.tempmax) : day.tempmax;
            const minT = isF ? systemsConvert.toFahrenheit(day.tempmin) : day.tempmin;
            const wind = isMph ? systemsConvert.toMiles(day.windspeed) : day.windspeed;
            const condText = day.conditions
              ? translateConditions(String(day.conditions), (lang?.lang as any) || 'en')
              : null;

            return (
              <div
                key={index}
                className="bg-white/[0.07] border border-white/[0.09] rounded-2xl p-4 hover:bg-white/[0.10] transition-colors"
              >
                {/* Date + conditions icon */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-white">{date}</span>
                  <span className="text-sky-200/80 text-xl">
                    <Icon data={day.conditions} kindOfData="conditions" />
                  </span>
                </div>

                {/* Temperature row */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-red-400 text-xs font-bold">↑</span>
                    <span className="text-red-300 font-bold text-lg tabular-nums">{maxT ?? '—'}</span>
                    <span className="text-sky-400/60 text-xs">{UNIT_SYSTEMS[unitSystem].temperature}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-400 text-xs font-bold">↓</span>
                    <span className="text-blue-300 font-bold text-lg tabular-nums">{minT ?? '—'}</span>
                    <span className="text-sky-400/60 text-xs">{UNIT_SYSTEMS[unitSystem].temperature}</span>
                  </div>
                </div>

                {/* Conditions text */}
                {condText && (
                  <p className="text-sky-300/60 text-xs mb-3 truncate">{condText}</p>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.07]">
                  <div className="text-center">
                    <p className="text-white font-medium text-xs tabular-nums">
                      {wind ?? '—'} <span className="text-sky-400/50">{UNIT_SYSTEMS[unitSystem].distance}</span>
                    </p>
                    <p className="text-sky-400/50 text-[10px] mt-0.5">{lang?.t('list.windspeed') || 'Wind'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium text-xs tabular-nums">
                      {day.humidity ?? '—'}<span className="text-sky-400/50">%</span>
                    </p>
                    <p className="text-sky-400/50 text-[10px] mt-0.5">{lang?.t('list.humidity') || 'Humidity'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium text-xs tabular-nums">
                      {day.pressure ?? '—'}
                    </p>
                    <p className="text-sky-400/50 text-[10px] mt-0.5">hPa</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop: table */}
      <div className="hidden xl:block">
        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.09] rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-white/[0.06] border-b border-white/[0.08]">
                  {[
                    lang?.t('list.date') || 'Date',
                    lang?.t('list.conditions') || 'Conditions',
                    `${lang?.t('list.maxTemp') || 'Max'} ${UNIT_SYSTEMS[unitSystem].temperature}`,
                    `${lang?.t('list.minTemp') || 'Min'} ${UNIT_SYSTEMS[unitSystem].temperature}`,
                    `${lang?.t('list.windspeed') || 'Wind'} ${UNIT_SYSTEMS[unitSystem].distance}`,
                    `${lang?.t('list.humidity') || 'Humidity'} %`,
                    `${lang?.t('list.pressure') || 'Pressure'} hPa`,
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-[11px] font-semibold text-sky-400/70 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {data.map((day, index) => {
                  const date = typeof day.datetime === "string" ? day.datetime.split("T")[0] : day.datetime;
                  const maxT = isF ? systemsConvert.toFahrenheit(day.tempmax) : day.tempmax;
                  const minT = isF ? systemsConvert.toFahrenheit(day.tempmin) : day.tempmin;
                  const wind = isMph ? systemsConvert.toMiles(day.windspeed) : day.windspeed;

                  return (
                    <tr
                      key={index}
                      className="hover:bg-white/[0.04] transition-colors duration-150"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-white">{date}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sky-200/70">
                            <Icon data={day.conditions} kindOfData="conditions" />
                          </span>
                          <span className="text-sm text-sky-200/60 truncate max-w-[140px]">
                            {day.conditions}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <span className="text-red-300 font-bold text-base tabular-nums">{maxT ?? '—'}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <span className="text-blue-300 font-bold text-base tabular-nums">{minT ?? '—'}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-sky-300/70 text-sm">
                            <Icon data={day.winddir} kindOfData="winddir" />
                          </span>
                          <span className="text-sm text-white/80 tabular-nums">{wind ?? '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-white/80 tabular-nums">{day.humidity ?? '—'}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-white/80 tabular-nums">{day.pressure ?? '—'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
