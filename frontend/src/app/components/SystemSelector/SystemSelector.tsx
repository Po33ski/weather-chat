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
          className="bg-white border border-blue-300 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        >
          <option value={SYSTEMS.METRIC}>{SYSTEMS.METRIC}</option>
          <option value={SYSTEMS.UK}>{SYSTEMS.UK}</option>
          <option value={SYSTEMS.US}>{SYSTEMS.US}</option>
        </select>
      )}
    </>
  );
}
