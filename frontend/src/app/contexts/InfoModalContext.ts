import { createContext } from "react";
import { InfoModalContextType } from "../types/types";

export const InfoModalContext = createContext<InfoModalContextType | null>(
  null
);
