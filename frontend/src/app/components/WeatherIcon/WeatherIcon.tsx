import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  CloudSunRain,
  Sun,
  Thermometer,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { conditionIcon, type ConditionIcon } from "@/app/utils/weather";

const ICONS: Record<ConditionIcon, LucideIcon> = {
  clear: Sun,
  partly: CloudSun,
  cloudy: Cloud,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  showers: CloudSunRain,
  thunder: CloudLightning,
  snow: CloudSnow,
  sleet: CloudHail,
  fog: CloudFog,
  wind: Wind,
  // Neutral glyph: an unrecognized condition must not pretend to be "cloudy".
  unknown: Thermometer,
};

export function WeatherIcon({
  conditions,
  className = "size-5",
  strokeWidth = 1.75,
}: {
  conditions: string | null;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = ICONS[conditionIcon(conditions)];
  return <Icon aria-hidden="true" className={className} strokeWidth={strokeWidth} />;
}
