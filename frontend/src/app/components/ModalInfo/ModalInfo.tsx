import { useContext } from "react";
import { Button } from "../Button/Button";
import { InfoModalContextType } from "@/app/types/types";
import { InfoModalContext } from "@/app/contexts/InfoModalContext";

export function ModalInfo() {
  const infoModalContext = useContext<InfoModalContextType | null>(
    InfoModalContext
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Information</h2>
        <p className="text-base mb-4">
          In this app you can check the weather forecast for most locations in
          the world. In the top left corner you can choose whether you want to
          check the weather forecast, current weather or past weather.
        </p>
        <p className="text-base mb-4">
          In the upper right corner you can change the metric system in which
          weather data will be displayed.
        </p>
        <Button onClick={() => infoModalContext?.setIsInfoModalShown(false)}>
          Close
        </Button>
      </div>
    </div>
  );
}
