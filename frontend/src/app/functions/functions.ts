import { UNIT_SYSTEMS } from "../constants/unitSystems";
import partially_cloudy_image from "../../../public/partially_cloudy_image.jpg";
import cloudy_image from "../../../public/cloudy_image.jpg";
import rain_image from "../../../public/rain_image.jpg";
import snow_rain_image from "../../../public/snow_rain_image.jpg";
import snow_image from "../../../public/snow_image.jpg";
import clear_image from "../../../public/clear_image.jpg";
import verystrong_image from "../../../public/verystrong_image.jpg";
import strong_image from "../../../public/strong_image.jpg";
import wind_image from "../../../public/wind_image.jpg";
import notwind_image from "../../../public/notwind_image.jpg";
import hot_image from "../../../public/hot_image.jpg";
import warm_image from "../../../public/warm_image.jpg";
import notwarm_image from "../../../public/notwarm_image.jpg";
import cold_image from "../../../public/cold_image.jpg";
import winddir_image from "../../../public/winddir_image.jpg";
import sunset_image from "../../../public/sunset_image.jpg";
import sunrise_image from "../../../public/sunrise_image.jpg";
import low_pressure from "../../../public/low_pressure.jpg";
import high_pressure from "../../../public/high_pressure.jpg";
import low_humidity from "../../../public/low_humidity.jpg";
import medium_humidity from "../../../public/medium_humidity.jpg";
import high_humidity from "../../../public/high_humidity.jpg";
import { StaticImageData } from "next/image";

export const systemsConvert = {
  toFahrenheit: (temp: number | null) => {
    let t = typeof temp === "number" ? temp : 0;
    return Math.round((t * (9 / 5) + 32) * 100) / 100;
  },
  toCelcius: (temp: number | null) => {
    let t = typeof temp === "number" ? temp : 0;
    return (t - 32) * (5 / 9);
  },
  toMiles: (temp: number | null) => {
    let t = typeof temp === "number" ? temp : 0;
    return Math.round((t / 1.609) * 100) / 100;
  },
  toKilometres: (temp: number | null) => {
    let t = typeof temp === "number" ? temp : 0;
    return (t * 1.609 * 100.2) / 100;
  },
};

export const normalDateFormatted = (d: Date): string => {
  if (d) {
    return (
      d.getFullYear() +
      "-" +
      ("0" + Number(d.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + d.getDate()).slice(-2)
    );
  }
  return "";
};

export function capitalizeFirstLetter(word: string | null): string {
  if (typeof word === "string") {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
  return "";
}

export function checkSign(
  kindOfSign: string,
  unitSystem: "UK" | "US" | "METRIC"
) {
  if (
    kindOfSign === "temp" ||
    kindOfSign === "tempmin" ||
    kindOfSign === "tempmax"
  ) {
    return UNIT_SYSTEMS[unitSystem].temperature;
  } else if (kindOfSign === "windspeed") {
    return UNIT_SYSTEMS[unitSystem].distance;
  } else if (kindOfSign === "sunrise") {
    return "AM";
  } else if (kindOfSign === "sunset") {
    return "PM";
  } else if (kindOfSign === "pressure") {
    return "hPa";
  } else if (kindOfSign === "humidity") {
    return "%";
  } else {
    return "";
  }
}

export const whatImage = (
  data: string | number | null | undefined,
  kindOfData: string | null | undefined
): StaticImageData => {
  const checkTempImage = (temp: number) => {
    switch (true) {
      case temp > 30:
        return hot_image;
      case temp > 15 && temp <= 30:
        return warm_image;
      case temp >= 0 && temp <= 15:
        return notwarm_image;
      case temp < 0:
        return cold_image;
      default:
        sunset_image;
    }
  };
  const checkWindSpeedImage = (speed: number) => {
    switch (true) {
      case speed >= 90:
        return verystrong_image;
      case speed >= 40 && speed < 90:
        return strong_image;
      case speed < 40 && speed >= 12:
        return wind_image;
      case speed < 12:
        return notwind_image;
      default:
        sunset_image;
    }
  };

  const checkConditionsImage = (cond: string | number) => {
    switch (cond) {
      case "Partially cloudy":
        return partially_cloudy_image;
      case "Rain, Partially cloudy":
        return rain_image;
      case "Overcast":
        return cloudy_image;
      case "Rain, Overcast":
        return rain_image;
      case "Snow, Rain, Partially cloudy":
        return snow_rain_image;
      case "Snow, Rain, Overcast":
        return snow_rain_image;
      case "Clear":
        return clear_image;
      case "Snow, Overcast":
        return snow_image;
      case "Snow, Partially cloudy":
        return snow_image;
      default:
        return sunset_image;
    }
  };

  const checkPressure = (pres: number) => {
    switch (true) {
      case pres < 1013:
        return low_pressure;
      case pres >= 1013:
        return high_pressure;
    }
  };

  const checkHumidity = (hum: number) => {
    switch (true) {
      case hum < 30:
        return low_humidity;
      case hum > 30 && hum <= 75:
        return medium_humidity;
      case hum > 75:
        return high_humidity;
    }
  };
  const checkImage = (
    data: string | number | null | undefined,
    kindOfData: string
  ) => {
    const dataN: number = typeof data === "number" ? data : 0;
    const dataS: string = typeof data === "string" ? data : "";
    switch (kindOfData) {
      case "temp":
        return checkTempImage(dataN);
      case "tempmax":
        return checkTempImage(dataN);
      case "tempmin":
        return checkTempImage(dataN);
      case "winddir":
        return winddir_image;
      case "windspeed":
        return checkWindSpeedImage(dataN);
      case "conditions":
        return checkConditionsImage(dataS);
      case "pressure":
        return checkPressure(dataN);
      case "humidity":
        return checkHumidity(dataN);
      case "sunrise":
        return sunrise_image;
      case "sunset":
        return sunset_image;
      default:
        return sunset_image;
    }
  };

  const kindOfDataS: string = typeof kindOfData === "string" ? kindOfData : "";
  const test: StaticImageData | undefined = checkImage(data, kindOfDataS);
  const image: StaticImageData =
    typeof test === "undefined" ? sunset_image : test;
  return image;
};

export const findDirection = (data: number | null | string) => {
  if (typeof data === "number") {
    switch (true) {
      case data > 345 || data <= 15:
        return "(N)";
      case data > 15 && data <= 75:
        return "(NE)";
      case data > 75 && data <= 105:
        return "(E)";
      case data > 105 && data <= 165:
        return "(SE)";
      case data > 165 && data <= 195:
        return "(S)";
      case data > 195 && data <= 255:
        return "(SW)";
      case data > 255 && data <= 285:
        return "(W)";
      case data > 285 && data <= 345:
        return "(NW)";
      default:
        return "";
    }
  } else return "";
};

// Translate canonical English conditions to localized label for UI display.
// Note: image/icon matchers should continue to receive English.
export function translateConditions(
  conditions: string | null,
  lang: "en" | "pl"
): string {
  if (!conditions || lang === "en") return conditions || "";
  const map: Record<string, string> = {
    "Partially cloudy": "Częściowe zachmurzenie",
    "Rain, Partially cloudy": "Deszcz, częściowe zachmurzenie",
    "Overcast": "Pochmurno",
    "Rain, Overcast": "Deszcz, pochmurno",
    "Snow, Rain, Partially cloudy": "Śnieg, deszcz, częściowe zachmurzenie",
    "Snow, Rain, Overcast": "Śnieg, deszcz, pochmurno",
    "Clear": "Bezchmurnie",
    "Snow, Overcast": "Śnieg, pochmurno",
    "Snow, Partially cloudy": "Śnieg, częściowe zachmurzenie",
  };
  return map[conditions] || conditions;
}
