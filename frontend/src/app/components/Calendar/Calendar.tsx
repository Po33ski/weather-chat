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
    <div className="flex flex-col md:flex-row items-center md:gap-x-4 space-y-4 md:space-y-0">
      <div className="flex-1 w-full">
        <DatePicker
          id="startDate"
          dateFormat="dd/MM/yyyy"
          selected={startDate}
          value={startDateV}
          className="w-full rounded-xl px-4 py-3 border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 text-gray-700"
          maxDate={now}
          onChange={(date) => {
            date = date ? date : new Date();
            setStartDate(date);
          }}
        />
      </div>
      
      <div className="flex items-center justify-center">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <i className="wi wi-direction-right text-blue-600 text-lg" />
        </div>
      </div>

      <div className="flex-1 w-full">
        <DatePicker
          id="endDate"
          dateFormat="dd/MM/yyyy"
          selected={endDate}
          value={endDateV}
          className="w-full rounded-xl px-4 py-3 border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 text-gray-700"
          maxDate={now}
          onChange={(date) => {
            date = date ? date : new Date();
            setEndDate(date);
          }}
        />
      </div>
    </div>
  );
}
