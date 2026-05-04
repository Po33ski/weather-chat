import { useContext, useEffect, useState } from "react";
import { SYSTEMS } from "@/app/constants/unitSystems";
import { UnitSystemContext } from "@/app/contexts/UnitSystemContext";
import { UnitSystemContextType } from "@/app/types/types";

export function SystemSelector() {
  const unitSystemContext = useContext<UnitSystemContextType | null>(
    UnitSystemContext
  );

  const [isClient, setIsClient] = useState<boolean>(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const unitSystem =
    unitSystemContext?.unitSystem.data === "US" ||
    unitSystemContext?.unitSystem.data === "METRIC" ||
    unitSystemContext?.unitSystem.data === "UK"
      ? unitSystemContext?.unitSystem.data
      : "METRIC";

  return (
    <>
      {isClient && (
        <select
          aria-label="Unit system"
          value={unitSystem}
          onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newUnitSystem = e.currentTarget.value;
            unitSystemContext?.unitSystem.setToLocalStorage(newUnitSystem);
          }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-white/15 focus:outline-none focus:ring-1 focus:ring-sky-400/50 focus:border-sky-400/50 transition-all duration-200 cursor-pointer"
        >
          <option value={SYSTEMS.METRIC} className="bg-slate-900 text-white">MS</option>
          <option value={SYSTEMS.UK} className="bg-slate-900 text-white">{SYSTEMS.UK}</option>
          <option value={SYSTEMS.US} className="bg-slate-900 text-white">{SYSTEMS.US}</option>
        </select>
      )}
    </>
  );
}
