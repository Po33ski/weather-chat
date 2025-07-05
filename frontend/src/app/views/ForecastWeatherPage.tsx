"use client";
import { useState, useCallback, ReactPortal } from "react";
import { CurrentForm } from "../components/CurrentForm/CurrentForm";
import { List } from "../components/List/List";
import { ErrorMessage } from "../components/ErrorMessage/ErrorMessage";
import { Loading } from "../components/Loading/Loading";
import { MainPhoto } from "../components/MainPhoto/MainPhoto";
import { MyText } from "../components/MyText/MyText";
import { capitalizeFirstLetter } from "../functions/functions";
import { WeatherData as FrontendWeatherData } from "../types/interfaces";
import { weatherApi, WeatherData as BackendWeatherData } from "../services/weatherApi";

export const ForecastWeatherPage = () => {
  const [data, setData] = useState<FrontendWeatherData>({
    address: null,
    days: [
      {
        datetime: null,
        temp: null,
        tempmax: null,
        tempmin: null,
        winddir: null,
        windspeed: null,
        conditions: null,
        sunrise: null,
        sunset: null,
        pressure: null,
        humidity: null,
      },
    ],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<string | null>(null);

  const handleError = useCallback((e: Error) => {
    setIsError(e.message);
    setTimeout(() => {
      setIsError(null);
    }, 5000);
  }, []);

  // Convert backend WeatherData array to frontend WeatherData format
  const convertBackendToFrontendData = (weatherDataArray: BackendWeatherData[], location: string): FrontendWeatherData => {
    const days = weatherDataArray.map(day => {
      // Convert wind direction to number if possible
      const windDirNumber = day.wind_direction ? 
        (typeof day.wind_direction === 'string' ? 
          (isNaN(Number(day.wind_direction)) ? null : Number(day.wind_direction)) :
          (typeof day.wind_direction === 'number' ? day.wind_direction : null)) : 
        null;

      return {
        datetime: day.timestamp,
        temp: day.temperature,
        tempmax: day.temperature, // Using temp as max since we don't have separate max/min
        tempmin: day.temperature, // Using temp as min since we don't have separate max/min
        winddir: windDirNumber,
        windspeed: day.wind_speed || null,
        conditions: day.conditions || null,
        sunrise: day.sunrise || null,  // Use actual sunrise data
        sunset: day.sunset || null,    // Use actual sunset data
        pressure: day.pressure?.toString() || null,
        humidity: day.humidity?.toString() || null,
      };
    });

    return {
      address: location,
      days: days as [typeof days[0]], // Type assertion to match the interface
    };
  };

  async function onCitySubmit(cityData: string | undefined) {
    if (!cityData) return;
    
    setIsLoading(true);
    try {
      const response = await weatherApi.getForecastWeather(cityData, 15); // Get 15 days forecast
      if (response.success && response.data) {
        const frontendData = convertBackendToFrontendData(response.data, cityData);
        setData(frontendData);
      } else {
        throw new Error(response.error || 'Failed to fetch forecast data');
      }
    } catch (err) {
      console.error(err);
      handleError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <CurrentForm onCitySubmit={onCitySubmit} />
      {isError && <ErrorMessage>{isError}</ErrorMessage>}
      {data["address"] !== null ? (
        <MyText>
          The weather forecast for {capitalizeFirstLetter(data["address"])} for
          15 days:
        </MyText>
      ) : (
        ""
      )}
      {data["address"] ? <List data={data["days"]} /> : <MainPhoto />}
    </>
  );
};
