import { useContext } from "react";
import { Icon } from "../Icon/Icon";
import { UnitSystemContext } from "@/app/contexts/UnitSystemContext";
import { BrickModalContext } from "@/app/contexts/BrickModalContext";
import { checkSign, findDirection } from "@/app/functions/functions";
import { systemsConvert } from "@/app/functions/functions";
import { UnitSystemContextType } from "@/app/types/types";
import { UNIT_SYSTEMS } from "@/app/constants/unitSystems";

export function Brick({
  data,
  kindOfData,
  title,
  desc,
}: {
  data: number | string | null;
  kindOfData: string;
  title: string;
  desc: string | null;
}) {
  const unitSystemContext = useContext<UnitSystemContextType | null>(
    UnitSystemContext
  );
  const brickModalContext = useContext(BrickModalContext);

  const unitSystem =
    unitSystemContext?.unitSystem.data === "US" ||
    unitSystemContext?.unitSystem.data === "METRIC" ||
    unitSystemContext?.unitSystem.data === "UK"
      ? unitSystemContext?.unitSystem.data
      : "METRIC";
  function handleOnClick() {
    brickModalContext?.setIsModalShown(true);
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
        className="inline-flex flex-col items-center justify-center cursor-pointer border-black border-2 rounded-lg bg-white w-40 h-40 text-lg gap-0.5 mx-8 hover:w-48 hover:h-48"
        onClick={handleOnClick}
      >
        <span className="block">{title}</span>
        <strong className="inline-flex justify-center items-center rounded-full text-stone-400 bg-orange-950 w-10 h-10">
          <Icon data={titleData} kindOfData={"title"} />
        </strong>
        <span className="inline-flex gap-0.5">
          <div>
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
              : data}
          </div>
          <div>{checkSign(kindOfData, unitSystem)}</div>
          {kindOfData === "winddir" && findDirection(data)}
        </span>

        {(kindOfData === "winddir" || kindOfData === "conditions") && (
          <span className="inline-flex justify-center items-center rounded-full text-stone-400 bg-orange-950 w-10 h-10">
            <Icon data={data} kindOfData={kindOfData} />
          </span>
        )}
      </button>
    </>
  );
}
