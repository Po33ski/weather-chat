import { useContext } from "react";
import { Icon } from "../Icon/Icon";
import { UnitSystemContext } from "@/app/contexts/UnitSystemContext";
import { UNIT_SYSTEMS } from "@/app/constants/unitSystems";
import { findDirection, systemsConvert } from "@/app/functions/functions";
import "../../weather_icons_data/css/weather-icons.css";
import { HoursData } from "@/app/types/interfaces";

export function DayList({ data }: { data: HoursData[] }) {
  const unitSystemContext = useContext(UnitSystemContext);
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
    <section className="bg-white py-4">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className={thStyle}>
                      Hour <i className="wi wi-time-3" />
                    </th>
                    <th className={thStyle}>
                      Temperature {UNIT_SYSTEMS[unitSystem].temperature}{" "}
                      <i className="wi wi-thermometer" />
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((hour, index) => (
                    <tr key={Math.random()}>
                      <td className={tdStyle}>
                        {index <= 9 ? `0${index}:00:00` : `${index}:00:00`}
                      </td>
                      <td className={tdStyle}>
                        {UNIT_SYSTEMS[unitSystem].temperature !== "°C"
                          ? systemsConvert.toFahrenheit(hour["temp"])
                          : hour["temp"]}
                      </td>
                      <td className={tdStyle}>
                        {hour.winddir}{" "}
                        <Icon data={hour.winddir} kindOfData={"winddir"} />{" "}
                        {findDirection(hour.winddir)}
                      </td>
                      <td className={tdStyle}>
                        {UNIT_SYSTEMS[unitSystem].distance !== "km/h"
                          ? systemsConvert.toMiles(hour["windspeed"])
                          : hour["windspeed"]}
                      </td>
                      <td className={tdStyle}>
                        {hour.humidity}{" "}
                        <Icon data={hour.humidity} kindOfData={"humidity"} />
                      </td>
                      <td className={tdStyle}>
                        {hour.pressure}{" "}
                        <Icon data={hour.pressure} kindOfData={"pressure"} />
                      </td>
                      <td className={tdStyle}>
                        {hour.conditions}{" "}
                        <Icon
                          data={hour.conditions}
                          kindOfData={"conditions"}
                        />
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
