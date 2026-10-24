import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LanguageContext } from "@/app/contexts/LanguageContext";
import {
  dictionaries,
  interpolate,
  pluralDictionaries,
  type PluralKey,
  type TranslationKey,
} from "@/app/i18n/translations";
import type { Lang, LanguageValue, TranslateParams } from "@/app/types/types";

const STORAGE_KEY = "lang";

function isLang(value: unknown): value is Lang {
  return value === "en" || value === "pl";
}

// Read synchronously on first render (this is a client-only SPA) so the UI
// never flashes English before switching to a stored Polish preference.
function initialLang(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    // Storage can be unavailable (privacy mode); fall through to the browser.
  }
  return window.navigator.language?.toLowerCase().startsWith("pl") ? "pl" : "en";
}

function localeFor(lang: Lang): string {
  if (lang === "pl") return "pl-PL";
  const browser = window.navigator.language;
  return browser?.toLowerCase().startsWith("en") ? browser : "en-GB";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Preference just won't persist.
    }
  }, []);

  const value = useMemo<LanguageValue>(() => {
    const locale = localeFor(lang);
    const dict = dictionaries[lang];
    const plurals = pluralDictionaries[lang];
    const pluralRules = new Intl.PluralRules(locale);
    const numberFormat = new Intl.NumberFormat(locale);

    const t = (key: TranslationKey, params?: TranslateParams) =>
      interpolate(dict[key] ?? key, params);

    const tp = (key: PluralKey, count: number) => {
      const forms = plurals[key];
      const template = forms[pluralRules.select(count)] ?? forms.other;
      return interpolate(template, { count: numberFormat.format(count) });
    };

    return { lang, locale, setLang, t, tp };
  }, [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
