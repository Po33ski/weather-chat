import type { TranslationKey, PluralKey } from "@/app/i18n/translations";

export type UnitSystemContextType = {
  unitSystem: {
    data: string | null;
    setToLocalStorage: (newData: unknown) => void;
  };
};

export type Lang = "en" | "pl";

export type TranslateParams = Record<string, string | number>;

export type LanguageValue = {
  lang: Lang;
  // BCP 47 locale used for every Intl formatter (dates, numbers, prices).
  locale: string;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey, params?: TranslateParams) => string;
  tp: (key: PluralKey, count: number) => string;
};
