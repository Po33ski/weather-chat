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
import { translateConditions } from "@/app/functions/functions";
import { Button } from "../Button/Button";
import { whatImage } from "@/app/functions/functions";
import {
  BrickModalContextType,
  UnitSystemContextType,
} from "@/app/types/types";
import { UNIT_SYSTEMS } from "@/app/constants/unitSystems";
import { LanguageContext } from "@/app/contexts/LanguageContext";


export function ModalBrick() {
  const unitSystemContext = useContext<UnitSystemContextType | null>(
    UnitSystemContext
  );
  const brickModalContext = useContext<BrickModalContextType | null>(
    BrickModalContext
  );
  const lang = useContext(LanguageContext);

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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full mx-4 shadow-2xl transform transition-all duration-300">
        {/* Header with image */}
        <div className="relative h-48">
          <Image src={photo} layout="fill" objectFit="cover" alt="Weather condition" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-bold text-white mb-1">
              {brickModalContext?.modalData.title}
            </h2>
            <div className="flex items-center space-x-2">
              {(kindOfData === "winddir" || kindOfData === "conditions") && (
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Icon data={data} kindOfData={kindOfData} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-900 mb-2">
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
                (kindOfData === "conditions"
                  ? translateConditions(String(data), (lang?.lang as any) || 'en')
                  : (kindOfData === "sunset" || kindOfData === "sunrise")
                  ? data
                  : undefined)}
              <span className="text-xl font-normal text-gray-600 ml-2">
                {checkSign(kindOfData, unitSystem)}
              </span>
            </div>
            {kindOfData === "winddir" && (
              <div className="text-lg text-gray-600">
                {findDirection(dataN)}
              </div>
            )}
          </div>

          {/* Additional info */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Current Reading</div>
              <div className="text-lg font-semibold text-gray-800">
                {brickModalContext?.modalData.title}
              </div>
            </div>
          </div>

          {/* Close button */}
          <div className="flex justify-center">
            <Button
              onClick={() => {
                if (brickModalContext?.isModalShownInCurrentWeatherPage) {
                  brickModalContext?.setIsModalShownInCurrentWeatherPage?.(false);
                }
                if ((brickModalContext as any)?.isModalShownInChatWeatherPage) {
                  (brickModalContext as any)?.setIsModalShownInChatPage?.(false);
                }
              }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
