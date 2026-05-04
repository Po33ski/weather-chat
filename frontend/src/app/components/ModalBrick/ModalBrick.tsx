import { useContext } from "react";
import { BrickModalContext } from "@/app/contexts/BrickModalContext";
import { UnitSystemContext } from "@/app/contexts/UnitSystemContext";
import { Icon } from "../Icon/Icon";
import {
  checkSign,
  findDirection,
  systemsConvert,
  translateConditions,
  whatImage,
} from "@/app/functions/functions";
import { BrickModalContextType, UnitSystemContextType } from "@/app/types/types";
import { UNIT_SYSTEMS } from "@/app/constants/unitSystems";
import { LanguageContext } from "@/app/contexts/LanguageContext";

export function ModalBrick() {
  const unitSystemContext = useContext<UnitSystemContextType | null>(UnitSystemContext);
  const brickModalContext = useContext<BrickModalContextType | null>(BrickModalContext);
  const lang = useContext(LanguageContext);

  const data =
    typeof brickModalContext?.modalData.data === "string" ||
    typeof brickModalContext?.modalData.data === "number"
      ? brickModalContext.modalData.data
      : "";

  const dataN =
    typeof brickModalContext?.modalData.data === "number"
      ? brickModalContext.modalData.data
      : 0;

  const kindOfData =
    typeof brickModalContext?.modalData.kindOfData === "string"
      ? brickModalContext.modalData.kindOfData
      : "";

  const unitSystem =
    unitSystemContext?.unitSystem.data === "US" ||
    unitSystemContext?.unitSystem.data === "METRIC" ||
    unitSystemContext?.unitSystem.data === "UK"
      ? unitSystemContext.unitSystem.data
      : "METRIC";

  const photo = whatImage(data, kindOfData);

  const isTemp = kindOfData === "temp" || kindOfData === "tempmax" || kindOfData === "tempmin";
  const isWind = kindOfData === "windspeed";

  const displayValue =
    isTemp
      ? UNIT_SYSTEMS[unitSystem].temperature === "°F"
        ? systemsConvert.toFahrenheit(dataN)
        : dataN
      : isWind
      ? UNIT_SYSTEMS[unitSystem].distance === "mph"
        ? systemsConvert.toMiles(dataN)
        : dataN
      : kindOfData === "conditions"
      ? translateConditions(String(data), (lang?.lang as any) || 'en')
      : kindOfData === "sunrise" || kindOfData === "sunset"
      ? data
      : dataN || undefined;

  const unit = checkSign(kindOfData, unitSystem);

  function handleClose() {
    if (brickModalContext?.isModalShownInCurrentWeatherPage) {
      brickModalContext.setIsModalShownInCurrentWeatherPage?.(false);
    }
    if ((brickModalContext as any)?.isModalShownInChatWeatherPage) {
      (brickModalContext as any)?.setIsModalShownInChatPage?.(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-3xl overflow-hidden max-w-md w-full mx-4 shadow-2xl">
        {/* Image header */}
        <div className="relative h-44">
          <img src={photo} alt="Weather condition" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <h2 className="text-lg font-bold text-white">{brickModalContext?.modalData.title}</h2>
            {(kindOfData === "winddir" || kindOfData === "conditions") && (
              <div className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center text-sky-200 backdrop-blur-sm">
                <Icon data={data} kindOfData={kindOfData} />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Main value */}
          <div className="text-center mb-5">
            <div className="text-5xl font-bold text-white mb-1 tabular-nums">
              {displayValue !== null && displayValue !== undefined ? String(displayValue) : '—'}
              {unit && (
                <span className="text-xl font-normal text-sky-300/70 ml-2">{unit}</span>
              )}
            </div>
            {kindOfData === "winddir" && (
              <div className="text-sky-300/80 text-base mt-1">{findDirection(dataN)}</div>
            )}
          </div>

          {/* Detail card */}
          <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-4 mb-5 text-center">
            <p className="text-xs text-sky-400/60 mb-1">
              {lang?.lang === 'pl' ? 'Aktualny odczyt' : 'Current Reading'}
            </p>
            <p className="text-white font-semibold text-sm">{brickModalContext?.modalData.title}</p>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-2xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-blue-900/30"
          >
            {lang?.t('common.close') || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
