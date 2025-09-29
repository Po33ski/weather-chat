import { useContext } from "react";
import { Icon } from "../Icon/Icon";
import { UnitSystemContext } from "@/app/contexts/UnitSystemContext";
import { UNIT_SYSTEMS } from "@/app/constants/unitSystems";
import { findDirection, systemsConvert } from "@/app/functions/functions";
import "../../weather_icons_data/css/weather-icons.css";
import { HoursData } from "@/app/types/interfaces";
import { LanguageContext } from "@/app/contexts/LanguageContext";

export function DayList({ data }: { data: HoursData[] }) {
  const unitSystemContext = useContext(UnitSystemContext);
  const lang = useContext(LanguageContext);
  const unitSystem =
    unitSystemContext?.unitSystem.data === "US" ||
    unitSystemContext?.unitSystem.data === "METRIC" ||
    unitSystemContext?.unitSystem.data === "UK"
      ? unitSystemContext?.unitSystem.data
      : "METRIC";
  const thStyle =
    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
  const tdStyle = "px-6 py-4 whitespace-nowrap bg-gray-50";
  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cards grid for mobile, table for desktop */}
        <div className="block lg:hidden">
          <div className="space-y-4">
            {data.map((hour, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-semibold text-gray-800">
                    {index <= 9 ? `0${index}:00` : `${index}:00`}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon data={hour.conditions} kindOfData={"conditions"} />
                    <span className="text-sm text-gray-600">{hour.conditions}</span>
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {UNIT_SYSTEMS[unitSystem].temperature !== "°C"
                      ? systemsConvert.toFahrenheit(hour["temp"])
                      : hour["temp"]}
                    {UNIT_SYSTEMS[unitSystem].temperature}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-gray-700">{hour.windspeed} {UNIT_SYSTEMS[unitSystem].distance}</div>
                    <div className="text-xs text-gray-500">Wind</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-700">{hour.humidity}%</div>
                    <div className="text-xs text-gray-500">Humidity</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-700">{hour.pressure} hPa</div>
                    <div className="text-xs text-gray-500">Pressure</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-700">{hour.winddir}°</div>
                    <div className="text-xs text-gray-500">Direction</div>
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
                      {lang?.t('day.hour') || 'Hour'}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                      {lang?.t('day.temp') || 'Temperature'} {UNIT_SYSTEMS[unitSystem].temperature}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      {lang?.t('day.conditions') || 'Conditions'}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                      {lang?.t('day.windspeed') || 'Wind'} {UNIT_SYSTEMS[unitSystem].distance}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                      {lang?.t('day.humidity') || 'Humidity'} %
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                      {lang?.t('day.pressure') || 'Pressure'} hPa
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                      {lang?.t('day.winddir') || 'Direction'} °
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((hour, index) => (
                    <tr key={index} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {index <= 9 ? `0${index}:00` : `${index}:00`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-xl font-bold text-blue-600">
                          {UNIT_SYSTEMS[unitSystem].temperature !== "°C"
                            ? systemsConvert.toFahrenheit(hour["temp"])
                            : hour["temp"]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Icon data={hour.conditions} kindOfData={"conditions"} />
                          <span className="text-sm text-gray-700">{hour.conditions}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Icon data={hour.winddir} kindOfData={"winddir"} />
                          <span className="text-sm font-medium text-gray-700">
                            {UNIT_SYSTEMS[unitSystem].distance !== "km/h"
                              ? systemsConvert.toMiles(hour["windspeed"])
                              : hour["windspeed"]}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-gray-700">{hour.humidity}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-gray-700">{hour.pressure}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-gray-700">{hour.winddir}</span>
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
