import { useContext } from "react";
import { InfoModalContext } from "@/app/contexts/InfoModalContext";
import { InfoModalContextType } from "@/app/types/types";

export function InfoButton() {
  const infoModalContext = useContext<InfoModalContextType | null>(
    InfoModalContext
  );

  function handleOnClick() {
    infoModalContext?.setIsInfoModalShown(!infoModalContext.isInfoModalShown);
  }

  return (
    <button
      onClick={handleOnClick}
      className="fixed bottom-8 right-8 bg-blue-500 text-white text-4xl rounded-full p-2 shadow-md"
    >
      &#9432;
    </button>
  );
}
