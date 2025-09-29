import { ReactPortal, useContext, useEffect, useState } from "react";
import { InfoButton } from "../InfoButton/InfoButton";
import { createPortal } from "react-dom";
import { ModalInfo } from "../ModalInfo/ModalInfo";
import { InfoModalContext } from "@/app/contexts/InfoModalContext";
import { InfoModalContextType } from "@/app/types/types";

export function Footer() {
  const [infoModal, setInfoModal] = useState<ReactPortal | null>(null);
  const infoModalContext = useContext<InfoModalContextType | null>(
    InfoModalContext
  );
  useEffect(() => {
    const createInfoModal = createPortal(<ModalInfo />, document.body);
    setInfoModal(createInfoModal);
  }, []);
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-300">
              Created by <span className="font-semibold text-white">Jarek Popardowski</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Weather Center Chat Application
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-300">
              © 2024 Weather Center
            </div>
            <InfoButton />
          </div>
        </div>
      </div>
      {infoModalContext?.isInfoModalShown && infoModal}
    </footer>
  );
}
