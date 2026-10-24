import type { ReactNode } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { SYSTEMS } from "@/app/constants/unitSystems";
import { UnitSystemContext } from "@/app/contexts/UnitSystemContext";
import { LanguageProvider } from "@/app/components/LanguageProvider/LanguageProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  const unitSystem = useLocalStorage("unit", SYSTEMS.METRIC);

  return (
    <LanguageProvider>
      <UnitSystemContext.Provider value={{ unitSystem }}>{children}</UnitSystemContext.Provider>
    </LanguageProvider>
  );
}
