import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../weather_icons_data/css/weather-icons.css";
import { normalDateFormatted } from "@/app/functions/functions";
import { useEffect, useState } from "react";

export function Calendar({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: {
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
}) {
  const [isClient, setIsClient] = useState<boolean>(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  const startDateV = normalDateFormatted(startDate);
  const endDateV = normalDateFormatted(endDate);
  const now = new Date();
  // <div className="mt-[100px] -mb-[100px] transform rotate-90 md:transform-none md:mt-0 md:mb-0">
  return (
    <div className="flex flex-col md:flex-row items-center md:gap-x-4">
      <DatePicker
        id="startDate"
        dateFormat="dd/MM/yyyy"
        selected={startDate}
        value={startDateV}
        className="flex-1 pt-1 pb-1 px-2 mt-2 mb-2 rounded-md border-black border-2 text-lg"
        maxDate={now}
        onChange={(date) => {
          date = date ? date : new Date();
          setStartDate(date);
        }}
      />
      <div className="transform rotate-90 md:transform-none">
        <i className="wi wi-direction-right text-2xl" />
      </div>

      <DatePicker
        id="endDate"
        dateFormat="dd/MM/yyyy"
        selected={endDate}
        value={endDateV}
        className="flex-1 pt-1 pb-1 px-2 mb-2 rounded-md border-black border-2 text-lg md:mt-2"
        maxDate={now}
        onChange={(date) => {
          date = date ? date : new Date();
          setEndDate(date);
        }}
      />
    </div>
  );
}
