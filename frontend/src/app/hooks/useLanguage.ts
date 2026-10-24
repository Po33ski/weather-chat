import { useContext } from "react";
import { LanguageContext } from "@/app/contexts/LanguageContext";
import type { LanguageValue } from "@/app/types/types";

export function useLanguage(): LanguageValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return value;
}
