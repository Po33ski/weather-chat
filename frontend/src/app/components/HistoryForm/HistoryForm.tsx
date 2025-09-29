import { useRef, useState } from "react";
import { Button } from "../Button/Button";
import { useContext } from "react";
import { LanguageContext } from "@/app/contexts/LanguageContext";
import { Calendar } from "../Calendar/Calendar";

export const HistoryForm = ({
  onSubmit,
}: {
  onSubmit: (
    cityData: string | undefined,
    startDate: Date,
    endDate: Date
  ) => void;
}) => {
  const lang = useContext(LanguageContext);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const cityInputRef = useRef<HTMLInputElement | null>(null);

  function handleSubmit(event: any) {
    event.preventDefault();
    const city: string | undefined =
      cityInputRef.current?.value !== ""
        ? cityInputRef.current?.value
        : "cracow";
    onSubmit(city, startDate, endDate);
  }

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {lang?.t('form.historyWeather') || 'Weather History'}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full"></div>
          </div>
          
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              {lang?.t('placeholder.city') || 'City'}
            </label>
            <input
              ref={cityInputRef}
              type="text"
              id="city"
              className="w-full rounded-xl px-4 py-3 border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 text-gray-700 placeholder-gray-500"
              placeholder={lang?.t('placeholder.city') || 'City'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lang?.t('form.dateRange') || 'Date Range'}
            </label>
            <Calendar
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={() => {}}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {lang?.t('form.check') || 'Check Weather'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
