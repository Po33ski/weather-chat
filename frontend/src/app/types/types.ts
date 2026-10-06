import { BrickModalData } from "./interfaces";

export type BrickModalContextType = {
  isModalShownInChatWeatherPage: boolean;
  setIsModalShownInChatPage: (modalData: boolean) => void;
  modalData: BrickModalData;
  setModalData: (modalData: BrickModalData) => void;
};

export type InfoModalContextType = {
  isInfoModalShown: boolean;
  setIsInfoModalShown: (modalData: boolean) => void;
};

export type UnitSystemContextType = {
  unitSystem: {
    data: string | null;
    setToLocalStorage: (newData: unknown) => void;
  };
};

export type Lang = "en" | "pl";

export type LanguageValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: string) => string;
};
