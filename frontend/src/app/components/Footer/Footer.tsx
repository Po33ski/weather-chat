import { ReactPortal, useContext, useEffect, useState } from "react";
import { InfoButton } from "../InfoButton/InfoButton";
import { createPortal } from "react-dom";
import { ModalInfo } from "../ModalInfo/ModalInfo";
import { InfoModalContext } from "@/app/contexts/InfoModalContext";
import { InfoModalContextType } from "@/app/types/types";

export function Footer() {
  const [infoModal, setInfoModal] = useState<ReactPortal | null>(null);
  const infoModalContext = useContext<InfoModalContextType | null>(InfoModalContext);

  useEffect(() => {
    const createInfoModal = createPortal(<ModalInfo />, document.body);
    setInfoModal(createInfoModal);
  }, []);

  return (
    <footer className="bg-black/20 backdrop-blur-md border-t border-white/[0.07] mt-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-sky-500/50">
            © 2025 <span className="text-sky-400/70">Travel and Weather Center</span>
          </p>
          <p className="text-xs text-sky-600/40">by Jarek Popardowski</p>
        </div>
      </div>
      <InfoButton />
      {infoModalContext?.isInfoModalShown && infoModal}
    </footer>
  );
}
