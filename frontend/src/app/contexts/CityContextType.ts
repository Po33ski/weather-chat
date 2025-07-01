import { createContext } from "react";
import { CityContextType } from "../types/types";

export const CityContext = createContext<CityContextType | null>(null);
