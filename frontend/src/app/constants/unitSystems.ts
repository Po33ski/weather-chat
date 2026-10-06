import { MetricSystems, UnitSystems } from "../types/interfaces";

export const SYSTEMS: MetricSystems = {
  US: "US",
  METRIC: "METRIC",
  UK: "UK",
};

export const UNIT_SYSTEMS: UnitSystems = {
  US: { unit: "US", temperature: "°F", distance: "mph" },
  METRIC: { unit: "METRIC", temperature: "°C", distance: "km/h" },
  UK: { unit: "UK", temperature: "°C", distance: "mph" },
};
