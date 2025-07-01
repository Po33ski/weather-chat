import "../../weather_icons_data/css/weather-icons.css";

const conditions = (data: string | number | null) => {
  switch (data) {
    case "Partially cloudy":
      return <i className="wi wi-day-cloudy" />;
    case "Rain, Partially cloudy":
      return <i className="wi wi-day-rain-wind" />;
    case "Overcast":
      return <i className="wi wi-cloudy" />;
    case "Rain, Overcast":
      return <i className="wi wi-rain" />;
    case "Snow, Rain, Partially cloudy":
      return <i className="wi wi-day-rain-mix" />;
    case "Snow, Rain, Overcast":
      return <i className="wi wi-sleet" />;
    case "Clear":
      return <i className="wi wi-day-sunny" />;
    case "Snow, Overcast":
      return <i className="wi wi-snow" />;
    case "Snow, Partially cloudy":
      return <i className="wi wi-snow" />;
    default:
      return <i className="wi wi-na" />;
  }
};

const windDirection = (data: number | null) => {
  data = data ? data : 0;
  switch (true) {
    case data > 345 || data <= 15:
      return <i className="wi wi-direction-up" />;
    case data > 15 && data <= 75:
      return <i className="wi wi-direction-up-right" />;
    case data > 75 && data <= 105:
      return <i className="wi wi-direction-right" />;
    case data > 105 && data <= 165:
      return <i className="wi wi-direction-down-right" />;
    case data > 165 && data <= 195:
      return <i className="wi wi-direction-down" />;
    case data > 195 && data <= 255:
      return <i className="wi wi-direction-down-left" />;
    case data > 255 && data <= 285:
      return <i className="wi wi-direction-left" />;
    case data > 285 && data <= 345:
      return <i className="wi wi-direction-up-left" />;
    default:
      return <i className="wi wi-na" />;
  }
};

const titelIcon = (data: string | number | null) => {
  switch (data) {
    case "temp":
      return <i className="wi wi-thermometer" />;
    case "tempmax":
      return <i className="wi wi-thermometer" />;
    case "tempmin":
      return <i className="wi wi-thermometer-exterior" />;
    case "winddir":
      return <i className="wi wi-wind-direction" />;
    case "windspeed":
      return <i className="wi wi-strong-wind" />;
    case "conditions":
      return <i className="wi wi-day-cloudy-high" />;
    case "sunrise":
      return <i className="wi wi-sunrise" />;
    case "sunset":
      return <i className="wi wi-sunset" />;
    case "humidity":
      return <i className="wi wi-humidity" />;
    case "pressure":
      return <i className="wi wi-barometer" />;
    default:
      return <i className="wi wi-na" />;
  }
};

const checkKind = (data: string | number | null, kindOfData: string) => {
  const dataN: number | null = typeof data === "number" ? data : 0;
  switch (kindOfData) {
    case "conditions":
      return conditions(data);
    case "winddir":
      return windDirection(dataN);
    case "title":
      return titelIcon(data);
    default:
      return "";
  }
};

export function Icon({
  data,
  kindOfData,
}: {
  data: string | number | null;
  kindOfData: string;
}) {
  let icon = checkKind(data, kindOfData);
  return <>{icon}</>;
}
