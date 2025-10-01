import { useContext } from "react";
import { Icon } from "../Icon/Icon";
import { UnitSystemContext } from "@/app/contexts/UnitSystemContext";
import { BrickModalContext } from "@/app/contexts/BrickModalContext";
import { checkSign, findDirection, translateConditions } from "@/app/functions/functions";
import { LanguageContext } from "@/app/contexts/LanguageContext";
import { systemsConvert } from "@/app/functions/functions";
import { UnitSystemContextType, WhereFromType } from "@/app/types/types";
import { UNIT_SYSTEMS } from "@/app/constants/unitSystems";

export function Brick({
  data,
  kindOfData,
  title,
  desc,
  whereFrom,
}: {
  data: number | string | null;
  kindOfData: string;
  title: string;
  desc: string | null;
  whereFrom: WhereFromType;
}) {
  const unitSystemContext = useContext<UnitSystemContextType | null>(
    UnitSystemContext
  );
  const brickModalContext = useContext(BrickModalContext);
  const lang = useContext(LanguageContext);

  const unitSystem =
    unitSystemContext?.unitSystem.data === "US" ||
    unitSystemContext?.unitSystem.data === "METRIC" ||
    unitSystemContext?.unitSystem.data === "UK"
      ? unitSystemContext?.unitSystem.data
      : "METRIC";
  function handleOnClick() {
    whereFrom === "current weather" && brickModalContext?.setIsModalShownInCurrentWeatherPage?.(true);
    whereFrom === "chat" && brickModalContext?.setIsModalShownInChatPage?.(true);
    brickModalContext?.setModalData({
      data: data,
      kindOfData: kindOfData,
      title: title,
      desc: desc,
    });
  }
  const titleData: string | number | null =
    typeof kindOfData === "string" ? kindOfData : 0;
  return (
    <>
      <button
        className="group relative bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 w-full max-w-48 h-48 flex flex-col items-center justify-center cursor-pointer transform hover:scale-105 hover:-translate-y-1"
        onClick={handleOnClick}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
        
        {/* Icon container */}
        <div className="relative z-10 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
            <Icon data={titleData} kindOfData={"title"} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-700 mb-2 text-center leading-tight">
          {title}
        </h3>

        {/* Value */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {typeof data === "number"
              ? kindOfData === "temp" ||
                kindOfData === "tempmax" ||
                kindOfData === "tempmin"
                ? UNIT_SYSTEMS[unitSystem].temperature === "°F"
                  ? systemsConvert.toFahrenheit(data)
                  : data
                : kindOfData === "windspeed"
                ? UNIT_SYSTEMS[unitSystem].distance === "mph"
                  ? systemsConvert.toMiles(data)
                  : data
                : data
              : kindOfData === "conditions"
              ? translateConditions(String(data), (lang?.lang as any) || 'en')
              : data}
            <span className="text-sm font-normal text-gray-600 ml-1">
              {checkSign(kindOfData, unitSystem)}
            </span>
          </div>
          {kindOfData === "winddir" && (
            <div className="text-xs text-gray-500">
              {findDirection(data)}
            </div>
          )}
        </div>

        {/* Additional icon for wind/conditions */}
        {(kindOfData === "winddir" || kindOfData === "conditions") && (
          <div className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm">
            <Icon data={data} kindOfData={kindOfData} />
          </div>
        )}

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>
    </>
  );
}
