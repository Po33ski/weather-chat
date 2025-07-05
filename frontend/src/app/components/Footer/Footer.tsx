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
    <div className="flex justify-center items-center h-[200px] bg-stone-500 text-white mt-auto">
      <p>Created by Jarek Popardowski</p>
      <InfoButton />
      {infoModalContext?.isInfoModalShown && infoModal}
    </div>
  );
}
