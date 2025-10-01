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
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          <div className="justify-self-start text-left">
            <p className="text-sm text-gray-300">
              Created by <span className="font-semibold text-white">Jarek Popardowski</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Weather Center Chat Application
            </p>
          </div>

          <div className="justify-self-center text-center text-sm text-gray-300">© 2025 Weather Center</div>

          <div className="justify-self-end"><InfoButton /></div>
        </div>
      </div>
      {infoModalContext?.isInfoModalShown && infoModal}
    </footer>
  );
}
