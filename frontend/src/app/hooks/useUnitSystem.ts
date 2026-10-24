import { useContext } from "react";
import { UnitSystemContext } from "@/app/contexts/UnitSystemContext";
import { isUnitSystemId, UNIT_SYSTEMS } from "@/app/constants/unitSystems";
import type { UnitSystem, UnitSystemId } from "@/app/types/interfaces";

export function useUnitSystem(): {
  id: UnitSystemId;
  units: UnitSystem;
  setUnitSystem: (next: UnitSystemId) => void;
} {
  const ctx = useContext(UnitSystemContext);
  if (!ctx) throw new Error("useUnitSystem must be used inside <AppProviders>");

  // localStorage is user-editable: anything unexpected falls back to metric.
  const id = isUnitSystemId(ctx.unitSystem.data) ? ctx.unitSystem.data : "METRIC";
  return {
    id,
    units: UNIT_SYSTEMS[id],
    setUnitSystem: (next) => ctx.unitSystem.setToLocalStorage(next),
  };
}
