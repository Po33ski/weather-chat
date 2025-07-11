"use client";
import {
  useState,
  useCallback,
  useContext,
  useEffect,
  ReactPortal,
} from "react";
import { createPortal } from "react-dom";
import { CurrentForm } from "../components/CurrentForm/CurrentForm";
import { WeatherView } from "../components/WeatherView/WeatherView";
import { ErrorMessage } from "../components/ErrorMessage/ErrorMessage";
import { MainPhoto } from "../components/MainPhoto/MainPhoto";
import { ModalBrick } from "../components/ModalBrick/ModalBrick";
import { Loading } from "../components/Loading/Loading";
import { ButtonLink } from "../components/ButtonLink/ButtonLink";
import { BrickModalContext } from "../contexts/BrickModalContext";
import { BrickModalContextType, CityContextType } from "../types/types";
import { CurrentData } from "../types/interfaces";
import { CityContext } from "../contexts/CityContextType";
import { weatherApi} from "../services/weatherApi";
import { WeatherData } from "../types/interfaces";

export const CurrentWeatherPage = () => {
  const brickModalContext = useContext<BrickModalContextType | null>(
    BrickModalContext
  );

  const cityContext = useContext<CityContextType | null>(CityContext);
  const [data, setData] = useState<CurrentData>({
    address: null,
    currentConditions: {
      temp: null,
      humidity: null,
      windspeed: null,
      winddir: null,
      pressure: null,
      conditions: null,
      sunrise: null,
      sunset: null,
    },
    days: [
      {
        description: null,
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
        hours: [
          {
            temp: null,
            conditions: null,
            winddir: null,
            windspeed: null,
            pressure: null,
            humidity: null,
          },
        ],
      },
    ],
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<string | null>(null);
  const [brickModal, setBrickModal] = useState<ReactPortal | null>(null);

  useEffect(() => {
    const createBrickModal = createPortal(<ModalBrick />, document.body);
    setBrickModal(createBrickModal);
  }, []);

  const handleError = useCallback((e: Error) => {
    setIsError(e.message);
    setTimeout(() => {
      setIsError(null);
    }, 5000);
  }, []);

  // Convert backend WeatherData to CurrentData format
  const convertWeatherDataToCurrentData = (weatherData: WeatherData): CurrentData => {
    // Convert wind direction to number if possible
    const windDirNumber = weatherData.wind_direction ? 
      (typeof weatherData.wind_direction === 'string' ? 
        (isNaN(Number(weatherData.wind_direction)) ? null : Number(weatherData.wind_direction)) :
        (typeof weatherData.wind_direction === 'number' ? weatherData.wind_direction : null)) : 
      null;

    return {
      address: weatherData.location,
      currentConditions: {
        temp: weatherData.temperature,
        humidity: weatherData.humidity || null,
        windspeed: weatherData.wind_speed || null,
        winddir: windDirNumber,
        pressure: weatherData.pressure || null,
        conditions: weatherData.conditions || null,
        sunrise: weatherData.sunrise || null,  // Use actual sunrise data
        sunset: weatherData.sunset || null,    // Use actual sunset data
      },
      days: [
        {
          description: null,
          temp: weatherData.temperature,
          tempmax: weatherData.temperature, // Using current temp as max
          tempmin: weatherData.temperature, // Using current temp as min
          winddir: windDirNumber,
          windspeed: weatherData.wind_speed || null,
          conditions: weatherData.conditions || null,
          sunrise: weatherData.sunrise || null,  // Use actual sunrise data
          sunset: weatherData.sunset || null,    // Use actual sunset data
          pressure: weatherData.pressure || null,
          humidity: weatherData.humidity || null,
          hours: [
            {
              temp: weatherData.temperature,
              conditions: weatherData.conditions || null,
              winddir: windDirNumber,
              windspeed: weatherData.wind_speed || null,
              pressure: weatherData.pressure?.toString() || null,
              humidity: weatherData.humidity?.toString() || null,
            },
          ],
        },
      ],
    };
  };

  useEffect(() => {
    if (cityContext?.city.data) {
      setIsLoading(true);
      weatherApi.getCurrentWeather(cityContext.city.data)
        .then((response) => {
          if (response.success && response.data) {
            const currentData = convertWeatherDataToCurrentData(response.data);
            setData(currentData);
          } else {
            throw new Error(response.error || 'Failed to fetch weather data');
          }
        })
        .catch((err) => {
          console.error(err);
          handleError(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [cityContext?.city.data, handleError]);

  async function onCitySubmit(cityData: string | undefined) {
    if (!cityData) return;
    
    cityContext?.city.setToLocalStorage(cityData);
    setIsLoading(true);

    try {
      const response = await weatherApi.getCurrentWeather(cityData);
      if (response.success && response.data) {
        const currentData = convertWeatherDataToCurrentData(response.data);
        setData(currentData);
      } else {
        throw new Error(response.error || 'Failed to fetch weather data');
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
      {data["address"] ? (
        <div>
          <WeatherView
            data={{
              ...data["days"][0],
              ...data["currentConditions"],
            }}
            address={data["address"]}
          />

          <ButtonLink path={"/current/hours"}>
            Weather for every hour
          </ButtonLink>
        </div>
      ) : (
        <MainPhoto />
      )}
      {brickModalContext?.isModalShown && brickModal}
    </>
  );
};
