import { useContext } from "react";
import { InfoModalContextType } from "@/app/types/types";
import { InfoModalContext } from "@/app/contexts/InfoModalContext";
import { LanguageContext } from "@/app/contexts/LanguageContext";

export function ModalInfo() {
  const infoModalContext = useContext<InfoModalContextType | null>(InfoModalContext);
  const lang = useContext(LanguageContext);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-3xl p-7 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-2xl">🌤️</span>
          <h2 className="text-xl font-bold text-white">{lang?.t('info.title') || 'Information'}</h2>
        </div>
        <p className="text-sky-200/70 text-sm leading-relaxed mb-4">{lang?.t('info.p1') || ''}</p>
        <p className="text-sky-200/70 text-sm leading-relaxed mb-6">{lang?.t('info.p2') || ''}</p>
        <button
          onClick={() => infoModalContext?.setIsInfoModalShown(false)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-2xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-blue-900/30"
        >
          {lang?.t('common.close') || 'Close'}
        </button>
      </div>
    </div>
  );
}
