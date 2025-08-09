import { createContext } from "react";
import type { Lang, LanguageValue } from "@/app/types/types";

export const LanguageContext = createContext<LanguageValue | null>(null);


