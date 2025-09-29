import { useRef, forwardRef } from "react";
import { Button } from "../Button/Button";
import { useContext } from "react";
import { LanguageContext } from "@/app/contexts/LanguageContext";
//import styles from "./CurrentForm.module.css";

export const CurrentForm = ({
  onCitySubmit,
}: {
  onCitySubmit: (cityData: string | undefined) => void;
}) => {
  const cityInputRef = useRef<HTMLInputElement | null>(null);
  const lang = useContext(LanguageContext);

  function handleSubmit(event: any) {
    event.preventDefault();

    const city: string | undefined =
      cityInputRef.current?.value !== ""
        ? cityInputRef.current?.value
        : "cracow";
    onCitySubmit(city);
  }

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {lang?.t('form.currentWeather') || 'Current Weather'}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full"></div>
          </div>
          
          <div>
            <input
              ref={cityInputRef}
              type="text"
              id="city"
              className="w-full rounded-xl px-4 py-3 border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 text-gray-700 placeholder-gray-500"
              placeholder={lang?.t('placeholder.city') || 'City'}
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
