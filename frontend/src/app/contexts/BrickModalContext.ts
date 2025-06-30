import { createContext } from "react";
import { BrickModalContextType } from "../types/types";

export const BrickModalContext = createContext<BrickModalContextType | null>(
  null
);
