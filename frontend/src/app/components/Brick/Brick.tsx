import { useContext } from "react";
import { Icon } from "../Icon/Icon";
import { UnitSystemContext } from "@/app/contexts/UnitSystemContext";
import { BrickModalContext } from "@/app/contexts/BrickModalContext";
import { checkSign, findDirection, translateConditions, systemsConvert } from "@/app/functions/functions";
import { LanguageContext } from "@/app/contexts/LanguageContext";
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
  const unitSystemContext = useContext<UnitSystemContextType | null>(UnitSystemContext);
  const brickModalContext = useContext(BrickModalContext);
  const lang = useContext(LanguageContext);

  const unitSystem =
    unitSystemContext?.unitSystem.data === "US" ||
    unitSystemContext?.unitSystem.data === "METRIC" ||
    unitSystemContext?.unitSystem.data === "UK"
      ? unitSystemContext.unitSystem.data
      : "METRIC";

  function handleOnClick() {
    if (whereFrom === "current weather") brickModalContext?.setIsModalShownInCurrentWeatherPage?.(true);
    if (whereFrom === "chat") brickModalContext?.setIsModalShownInChatPage?.(true);
    brickModalContext?.setModalData({ data, kindOfData, title, desc });
  }

  const titleData: string | number | null = typeof kindOfData === "string" ? kindOfData : 0;

  const displayValue =
    typeof data === "number"
      ? kindOfData === "temp" || kindOfData === "tempmax" || kindOfData === "tempmin"
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
      : data;

  const unit = checkSign(kindOfData, unitSystem);

  return (
    <button
      onClick={handleOnClick}
      className="group bg-white/[0.07] hover:bg-white/[0.13] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-3.5 w-full flex items-center gap-3 transition-all duration-250 cursor-pointer text-left"
    >
      {/* Icon circle */}
      <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-sky-300 flex-shrink-0 group-hover:bg-blue-500/30 transition-colors">
        <span className="text-base leading-none">
          <Icon data={titleData} kindOfData="title" />
        </span>
      </div>

      {/* Label + direction subtitle */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-sky-400/60 font-medium uppercase tracking-wide truncate">{title}</p>
        {kindOfData === "winddir" && data !== null && (
          <p className="text-xs text-sky-300/70 mt-0.5 truncate">{findDirection(data)}</p>
        )}
        {kindOfData === "conditions" && (
          <span className="text-sky-300/70 text-sm leading-none">
            <Icon data={data} kindOfData="conditions" />
          </span>
        )}
      </div>

      {/* Value + unit */}
      <div className="text-right flex-shrink-0">
        <p className="text-base font-bold text-white leading-none tabular-nums">
          {displayValue !== null && displayValue !== undefined ? String(displayValue) : '—'}
        </p>
        {unit && <p className="text-[11px] text-sky-400/50 mt-0.5">{unit}</p>}
      </div>
    </button>
  );
}
