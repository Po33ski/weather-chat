import { useContext } from "react";
import { UnitSystemContext } from "@/app/contexts/UnitSystemContext";
import { UNIT_SYSTEMS } from "@/app/constants/unitSystems";
import { Icon } from "../Icon/Icon";
import "../../weather_icons_data/css/weather-icons.css";
import styles from "./List.module.css";
import { findDirection, systemsConvert } from "@/app/functions/functions";
import { HistoryAndForecastDay } from "@/app/types/interfaces";
import { LanguageContext } from "@/app/contexts/LanguageContext";

export function List({ data }: { data: HistoryAndForecastDay[] }) {
  const unitSystemContext = useContext(UnitSystemContext);
  const lang = useContext(LanguageContext);
  const unitSystem =
    unitSystemContext?.unitSystem.data === "US" ||
    unitSystemContext?.unitSystem.data === "METRIC" ||
    unitSystemContext?.unitSystem.data === "UK"
      ? unitSystemContext?.unitSystem.data
      : "METRIC";
  const thStyle =
    "px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
  const tdStyle = "px-4 py-2 border text-sm";
  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Cards grid for mobile, table for desktop */}
        <div className="block lg:hidden">
          <div className="space-y-4">
            {data.map((day, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-semibold text-gray-800">
                    {typeof day.datetime === "string" ? day.datetime.split("T")[0] : day.datetime}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon data={day.conditions} kindOfData={"conditions"} />
                    <span className="text-sm text-gray-600">{day.conditions}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {UNIT_SYSTEMS[unitSystem].temperature !== "°C"
                        ? systemsConvert.toFahrenheit(day["tempmax"])
                        : day["tempmax"]}
                      {UNIT_SYSTEMS[unitSystem].temperature}
                    </div>
                    <div className="text-xs text-gray-500">Max</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {UNIT_SYSTEMS[unitSystem].temperature !== "°C"
                        ? systemsConvert.toFahrenheit(day["tempmin"])
                        : day["tempmin"]}
                      {UNIT_SYSTEMS[unitSystem].temperature}
                    </div>
                    <div className="text-xs text-gray-500">Min</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-gray-700">{day.windspeed} {UNIT_SYSTEMS[unitSystem].distance}</div>
                    <div className="text-xs text-gray-500">Wind</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-700">{day.humidity}%</div>
                    <div className="text-xs text-gray-500">Humidity</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-700">{day.pressure} hPa</div>
                    <div className="text-xs text-gray-500">Pressure</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      {lang?.t('list.date') || 'Date'}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      {lang?.t('list.conditions') || 'Conditions'}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                      {lang?.t('list.maxTemp') || 'Max'} {UNIT_SYSTEMS[unitSystem].temperature}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                      {lang?.t('list.minTemp') || 'Min'} {UNIT_SYSTEMS[unitSystem].temperature}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                      {lang?.t('list.windspeed') || 'Wind'} {UNIT_SYSTEMS[unitSystem].distance}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                      {lang?.t('list.humidity') || 'Humidity'} %
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                      {lang?.t('list.pressure') || 'Pressure'} hPa
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((day, index) => (
                    <tr key={index} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {typeof day.datetime === "string" ? day.datetime.split("T")[0] : day.datetime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Icon data={day.conditions} kindOfData={"conditions"} />
                          <span className="text-sm text-gray-700">{day.conditions}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-lg font-bold text-red-500">
                          {UNIT_SYSTEMS[unitSystem].temperature !== "°C"
                            ? systemsConvert.toFahrenheit(day["tempmax"])
                            : day["tempmax"]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-lg font-bold text-blue-500">
                          {UNIT_SYSTEMS[unitSystem].temperature !== "°C"
                            ? systemsConvert.toFahrenheit(day["tempmin"])
                            : day["tempmin"]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Icon data={day.winddir} kindOfData={"winddir"} />
                          <span className="text-sm font-medium text-gray-700">
                            {UNIT_SYSTEMS[unitSystem].distance !== "km/h"
                              ? systemsConvert.toMiles(day["windspeed"])
                              : day["windspeed"]}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-gray-700">{day.humidity}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-gray-700">{day.pressure}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
