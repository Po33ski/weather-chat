import { useContext } from "react";
import { UnitSystemContext } from "@/app/contexts/UnitSystemContext";
import { UNIT_SYSTEMS } from "@/app/constants/unitSystems";
import { Icon } from "../Icon/Icon";
import "../../weather_icons_data/css/weather-icons.css";
import styles from "./List.module.css";
import { findDirection, systemsConvert } from "@/app/functions/functions";
import { HistoryAndForecastDay } from "@/app/types/interfaces";

export function List({ data }: { data: HistoryAndForecastDay[] }) {
  const unitSystemContext = useContext(UnitSystemContext);
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
    <section className="bg-white py-4">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className={thStyle}>
                      Date <i className="wi wi-time-3" />
                    </th>
                    <th className={thStyle}>
                      Max. Temperature {UNIT_SYSTEMS[unitSystem].temperature}{" "}
                      <i className="wi wi-thermometer" />
                    </th>
                    <th className={thStyle}>
                      Min. Temperature {UNIT_SYSTEMS[unitSystem].temperature}{" "}
                      <i className="wi wi-thermometer-exterior" />
                    </th>
                    <th className={thStyle}>
                      Wind Direction <i className="wi wi-wind-direction" />
                    </th>
                    <th className={thStyle}>
                      Wind speed {UNIT_SYSTEMS[unitSystem].distance}{" "}
                      <i className="wi wi-strong-wind" />
                    </th>
                    <th className={thStyle}>
                      Humidity <i className="wi wi-humidity" />
                    </th>
                    <th className={thStyle}>
                      Air Pressure{" hPa "}
                      <i className="wi wi-barometer" />
                    </th>
                    <th className={thStyle}>
                      Conditions <i className="wi wi-day-cloudy-high" />
                    </th>
                    <th className={thStyle}>
                      Sunrise <i className="wi wi-sunrise" />
                    </th>
                    <th className={thStyle}>
                      Sunset <i className="wi wi-sunset" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((day) => (
                    <tr key={Math.random()}>
                      <td className="px-6 py-4 whitespace-nowrap bg-gray-50">
                        {day.datetime}
                      </td>
                      <td className={tdStyle}>
                        {UNIT_SYSTEMS[unitSystem].temperature !== "°C"
                          ? systemsConvert.toFahrenheit(day["tempmax"])
                          : day["tempmax"]}
                      </td>
                      <td className={tdStyle}>
                        {UNIT_SYSTEMS[unitSystem].temperature !== "°C"
                          ? systemsConvert.toFahrenheit(day["tempmin"])
                          : day["tempmin"]}
                      </td>
                      <td className={tdStyle}>
                        {day.winddir}{" "}
                        <Icon data={day.winddir} kindOfData={"winddir"} />{" "}
                        {findDirection(day.winddir)}
                      </td>
                      <td className={tdStyle}>
                        {UNIT_SYSTEMS[unitSystem].distance !== "km/h"
                          ? systemsConvert.toMiles(day["windspeed"])
                          : day["windspeed"]}
                      </td>
                      <td className={tdStyle}>
                        {day.humidity}{" "}
                        <Icon data={day.humidity} kindOfData={"humidity"} />
                      </td>
                      <td className={tdStyle}>
                        {day.pressure}{" "}
                        <Icon data={day.pressure} kindOfData={"pressure"} />
                      </td>
                      <td className={tdStyle}>
                        {day.conditions}{" "}
                        <Icon data={day.conditions} kindOfData={"conditions"} />
                      </td>
                      <td className={tdStyle}>{day.sunrise}</td>
                      <td className={tdStyle}>{day.sunset}</td>
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
