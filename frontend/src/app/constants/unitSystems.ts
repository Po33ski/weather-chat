import type { UnitSystem, UnitSystemId } from "../types/interfaces";

export const SYSTEMS = {
  US: "US",
  METRIC: "METRIC",
  UK: "UK",
} as const satisfies Record<UnitSystemId, UnitSystemId>;

export const UNIT_SYSTEMS: Record<UnitSystemId, UnitSystem> = {
  US: { unit: "US", temperature: "°F", distance: "mph" },
  METRIC: { unit: "METRIC", temperature: "°C", distance: "km/h" },
  UK: { unit: "UK", temperature: "°C", distance: "mph" },
};

export const UNIT_SYSTEM_IDS = Object.keys(UNIT_SYSTEMS) as UnitSystemId[];

export function isUnitSystemId(value: unknown): value is UnitSystemId {
  return typeof value === "string" && value in UNIT_SYSTEMS;
}
