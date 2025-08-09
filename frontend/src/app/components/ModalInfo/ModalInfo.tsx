import { useContext } from "react";
import { Button } from "../Button/Button";
import { InfoModalContextType } from "@/app/types/types";
import { InfoModalContext } from "@/app/contexts/InfoModalContext";
import { LanguageContext } from "@/app/contexts/LanguageContext";

export function ModalInfo() {
  const infoModalContext = useContext<InfoModalContextType | null>(
    InfoModalContext
  );
  const lang = useContext(LanguageContext);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">{lang?.t('info.title') || 'Information'}</h2>
        <p className="text-base mb-4">{lang?.t('info.p1') || ''}</p>
        <p className="text-base mb-4">{lang?.t('info.p2') || ''}</p>
        <Button onClick={() => infoModalContext?.setIsInfoModalShown(false)}>
          {lang?.t('common.close') || 'Close'}
        </Button>
      </div>
    </div>
  );
}
