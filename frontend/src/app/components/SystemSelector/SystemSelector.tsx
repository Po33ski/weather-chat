import styles from "./SystemSelector.module.css";
import { useContext, useEffect, useState } from "react";
import { SYSTEMS } from "@/app/constants/unitSystems";
import { UnitSystemContext } from "@/app/contexts/UnitSystemContext";
import { UnitSystemContextType } from "@/app/types/types";
import { weatherApi } from "@/app/services/weatherApi";
import { useAuthService } from "../Auth/AuthService";

export function SystemSelector() {
  const unitSystemContext = useContext<UnitSystemContextType | null>(
    UnitSystemContext
  );
  const { sessionId } = useAuthService();

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
    <div>
      {isClient && (
        <select
          value={unitSystem}
          onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newUnitSystem = e.currentTarget.value;
            unitSystemContext?.unitSystem.setToLocalStorage(newUnitSystem);
            
            // Send unit system update to backend
            try {
              await weatherApi.updateUnitSystem(newUnitSystem, sessionId || undefined);
            } catch (error) {
              console.error('Failed to update unit system on backend:', error);
            }
          }}
          className="border-black border-2 p-4 mr-2 rounded-lg md:mr-6"
        >
          <option value={SYSTEMS.METRIC}>{SYSTEMS.METRIC}</option>
          <option value={SYSTEMS.UK}>{SYSTEMS.UK}</option>
          <option value={SYSTEMS.US}>{SYSTEMS.US}</option>
        </select>
      )}
    </div>
  );
}
