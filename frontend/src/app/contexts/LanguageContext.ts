import { createContext } from "react";
import type {LanguageValue } from "@/app/types/types";

export const LanguageContext = createContext<LanguageValue | null>(null);


