import { useContext } from "react";
import Image from "next/image";
import { BrickModalContext } from "@/app/contexts/BrickModalContext";
import { UnitSystemContext } from "@/app/contexts/UnitSystemContext";
import { Icon } from "../Icon/Icon";
import {
  checkSign,
  findDirection,
  systemsConvert,
} from "@/app/functions/functions";
import { Button } from "../Button/Button";
import { whatImage } from "@/app/functions/functions";
import {
  BrickModalContextType,
  UnitSystemContextType,
} from "@/app/types/types";
import { UNIT_SYSTEMS } from "@/app/constants/unitSystems";
export function ModalBrick() {
  const unitSystemContext = useContext<UnitSystemContextType | null>(
    UnitSystemContext
  );
  const brickModalContext = useContext<BrickModalContextType | null>(
    BrickModalContext
  );

  const data =
    typeof brickModalContext?.modalData.data === "string" ||
    typeof brickModalContext?.modalData.data === "number"
      ? brickModalContext?.modalData.data
      : "";

  const dataN =
    typeof brickModalContext?.modalData.data === "number"
      ? brickModalContext?.modalData.data
      : 0;
  const kindOfData =
    typeof brickModalContext?.modalData.kindOfData === "string"
      ? brickModalContext?.modalData.kindOfData
      : "";
  const unitSystem =
    unitSystemContext?.unitSystem.data === "US" ||
    unitSystemContext?.unitSystem.data === "METRIC" ||
    unitSystemContext?.unitSystem.data === "UK"
      ? unitSystemContext?.unitSystem.data
      : "METRIC";
  const photo = whatImage(data, kindOfData);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg overflow-hidden max-w-lg w-full">
        <div className="relative h-64">
          <Image src={photo} layout="fill" objectFit="cover" alt="alt" />
          <div className="absolute inset-0 bg-black opacity-25"></div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white text-xl font-bold">
            {brickModalContext?.modalData.title}
          </div>
        </div>
        <div className="p-4">
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">
              {brickModalContext?.modalData.title}
            </h3>
            <div className="flex items-center justify-between">
              <div className="text-gray-600">
                {(kindOfData === "temp" ||
                kindOfData === "tempmax" ||
                kindOfData === "tempmin"
                  ? UNIT_SYSTEMS[unitSystem].temperature === "°F"
                    ? systemsConvert.toFahrenheit(dataN)
                    : dataN
                  : kindOfData === "windspeed"
                  ? UNIT_SYSTEMS[unitSystem].distance === "mph"
                    ? systemsConvert.toMiles(dataN)
                    : dataN
                  : dataN) ||
                  ((kindOfData === "conditions" ||
                    kindOfData === "sunset" ||
                    kindOfData === "sunrise") &&
                    data)}{" "}
                {checkSign(kindOfData, unitSystem)}
                {kindOfData === "winddir" && findDirection(dataN)}
              </div>
              {(kindOfData === "winddir" || kindOfData === "conditions") && (
                <div className="inline-flex justify-center items-center rounded-full text-stone-400 bg-orange-950 w-10 h-10">
                  <Icon data={data} kindOfData={kindOfData} />
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-600 mt-4">
            {brickModalContext?.modalData.desc}
          </p>
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() =>
                brickModalContext?.setIsModalShown(
                  !brickModalContext.isModalShown
                )
              }
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
