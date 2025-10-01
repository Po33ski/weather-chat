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
      className="group fixed bottom-8 right-8 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-2xl rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 border border-blue-400/20 backdrop-blur-sm"
    >
      <div className="flex items-center justify-center w-6 h-6">
        <svg 
          className="w-6 h-6 transition-transform duration-200 group-hover:rotate-12" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>
      
      {/* Pulse animation */}
      <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping opacity-0 group-hover:opacity-100"></div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        Information
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </button>
  );
}
