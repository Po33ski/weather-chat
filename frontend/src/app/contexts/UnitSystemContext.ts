import { createContext } from "react";
import { UnitSystemContextType } from "../types/types";

export const UnitSystemContext = createContext<UnitSystemContextType | null>(
  null
);
