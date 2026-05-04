import { useContext } from "react";
import { Brick } from "../Brick/Brick";
import { Icon } from "../Icon/Icon";
import { LanguageContext } from "@/app/contexts/LanguageContext";
import { BrickModalContext } from "@/app/contexts/BrickModalContext";
import { UnitSystemContext } from "@/app/contexts/UnitSystemContext";
import { UNIT_SYSTEMS } from "@/app/constants/unitSystems";
import {
  systemsConvert,
  translateConditions,
} from "@/app/functions/functions";
import { CurrentDataDay } from "@/app/types/interfaces";
import { WhereFromType, BrickModalContextType, UnitSystemContextType } from "@/app/types/types";

export function WeatherView({
  data,
  address,
  whereFrom,
}: {
  data: CurrentDataDay;
  address: string | null;
  whereFrom: WhereFromType;
}) {
  const lang = useContext(LanguageContext);
  const brickModalContext = useContext<BrickModalContextType | null>(BrickModalContext);
  const unitSystemContext = useContext<UnitSystemContextType | null>(UnitSystemContext);

  const unitSystem =
    unitSystemContext?.unitSystem.data === "US" ||
    unitSystemContext?.unitSystem.data === "METRIC" ||
    unitSystemContext?.unitSystem.data === "UK"
      ? unitSystemContext.unitSystem.data
      : "METRIC";

  const tempUnit = UNIT_SYSTEMS[unitSystem].temperature;
  const isF = tempUnit === "°F";

  const tempVal = typeof data.temp === "number" ? (isF ? systemsConvert.toFahrenheit(data.temp) : data.temp) : null;
  const maxVal = typeof data.tempmax === "number" ? (isF ? systemsConvert.toFahrenheit(data.tempmax) : data.tempmax) : null;
  const minVal = typeof data.tempmin === "number" ? (isF ? systemsConvert.toFahrenheit(data.tempmin) : data.tempmin) : null;

  const conditionsText = data.conditions
    ? translateConditions(String(data.conditions), (lang?.lang as any) || 'en')
    : null;

  function openTempModal() {
    if (whereFrom === "current weather") brickModalContext?.setIsModalShownInCurrentWeatherPage?.(true);
    if (whereFrom === "chat") brickModalContext?.setIsModalShownInChatPage?.(true);
    brickModalContext?.setModalData({
      data: data.temp,
      kindOfData: 'temp',
      title: lang?.t('brick.currentTemp') || 'Current temperature',
      desc: data.description,
    });
  }

  const desc = data.description;

  return (
    <div className="space-y-3">
      {/* Hero temperature card */}
      <button
        onClick={openTempModal}
        className="group w-full bg-white/[0.08] hover:bg-white/[0.11] backdrop-blur-xl border border-white/[0.12] hover:border-white/[0.22] rounded-3xl p-6 text-left transition-all duration-300 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Big temperature */}
            <div className="flex items-end gap-1.5 mb-2">
              <span className="text-6xl md:text-7xl font-bold text-white leading-none tabular-nums">
                {tempVal !== null ? tempVal : '—'}
              </span>
              <span className="text-2xl text-sky-300/70 pb-2 font-light">{tempUnit}</span>
            </div>
            {desc && (
              <p className="text-sky-200/55 text-sm leading-relaxed line-clamp-2 max-w-xs">
                {desc}
              </p>
            )}
          </div>
          {/* Conditions icon — large */}
          <div className="text-sky-100/80 text-5xl flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
            <Icon data={data.conditions} kindOfData="conditions" />
          </div>
        </div>

        {/* Min / Max / Conditions row */}
        <div className="flex items-center flex-wrap gap-x-5 gap-y-1 mt-4 pt-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-1.5">
            <span className="text-red-400 font-bold text-sm">↑</span>
            <span className="text-white font-semibold text-sm tabular-nums">
              {maxVal !== null ? `${maxVal}${tempUnit}` : '—'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-blue-400 font-bold text-sm">↓</span>
            <span className="text-white font-semibold text-sm tabular-nums">
              {minVal !== null ? `${minVal}${tempUnit}` : '—'}
            </span>
          </div>
          {conditionsText && (
            <span className="ml-auto text-sky-300/55 text-sm truncate">{conditionsText}</span>
          )}
        </div>
      </button>

      {/* Compact metric tiles — 2-column grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <Brick
          data={data.windspeed}
          kindOfData="windspeed"
          title={lang?.t('brick.windspeed') || 'Wind speed'}
          desc={desc}
          whereFrom={whereFrom}
        />
        <Brick
          data={data.winddir}
          kindOfData="winddir"
          title={lang?.t('brick.winddir') || 'Wind direction'}
          desc={desc}
          whereFrom={whereFrom}
        />
        <Brick
          data={data.pressure}
          kindOfData="pressure"
          title={lang?.t('brick.pressure') || 'Pressure'}
          desc={desc}
          whereFrom={whereFrom}
        />
        <Brick
          data={data.humidity}
          kindOfData="humidity"
          title={lang?.t('brick.humidity') || 'Humidity'}
          desc={desc}
          whereFrom={whereFrom}
        />
        <Brick
          data={data.sunrise}
          kindOfData="sunrise"
          title={lang?.t('brick.sunrise') || 'Sunrise'}
          desc={desc}
          whereFrom={whereFrom}
        />
        <Brick
          data={data.sunset}
          kindOfData="sunset"
          title={lang?.t('brick.sunset') || 'Sunset'}
          desc={desc}
          whereFrom={whereFrom}
        />
        {whereFrom !== 'chat' && (
          <Brick
            data={data.conditions}
            kindOfData="conditions"
            title={lang?.t('brick.conditions') || 'Conditions'}
            desc={desc}
            whereFrom={whereFrom}
          />
        )}
      </div>
    </div>
  );
}
