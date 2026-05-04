import { useContext } from "react";
import { InfoModalContext } from "@/app/contexts/InfoModalContext";
import { InfoModalContextType } from "@/app/types/types";

export function InfoButton() {
  const infoModalContext = useContext<InfoModalContextType | null>(InfoModalContext);

  function handleOnClick() {
    infoModalContext?.setIsInfoModalShown(!infoModalContext.isInfoModalShown);
  }

  return (
    <button
      onClick={handleOnClick}
      aria-label="Information"
      className="group fixed bottom-6 right-6 w-11 h-11 bg-blue-600/80 hover:bg-blue-500/90 backdrop-blur-sm border border-white/20 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-900/40 hover:shadow-xl hover:shadow-blue-800/40 transition-all duration-300 hover:-translate-y-0.5 z-30"
    >
      <svg
        className="w-5 h-5 transition-transform duration-200 group-hover:rotate-12"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}
