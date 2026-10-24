import { CurrentWeather } from "@/app/components/CurrentWeather/CurrentWeather";
import { ForecastView } from "@/app/components/ForecastView/ForecastView";
import type { WeatherResult as WeatherResultData } from "@/app/utils/resultView";

export function WeatherResult({ weather }: { weather: WeatherResultData }) {
  return weather.kind === "current" ? (
    <CurrentWeather current={weather.current} />
  ) : (
    <ForecastView days={weather.days} kind={weather.kind} />
  );
}
