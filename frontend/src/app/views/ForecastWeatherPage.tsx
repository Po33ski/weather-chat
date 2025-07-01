"use client";
import { useState, useCallback, ReactPortal } from "react";
import { CurrentForm } from "../components/CurrentForm/CurrentForm";
import { List } from "../components/List/List";
import { ErrorMessage } from "../components/ErrorMessage/ErrorMessage";
import { Loading } from "../components/Loading/Loading";
import { MainPhoto } from "../components/MainPhoto/MainPhoto";
import { MyText } from "../components/MyText/MyText";
import { API_KEY, API_HTTP } from "../constants/apiConstants";
import { capitalizeFirstLetter } from "../functions/functions";

import { WeatherData } from "../types/interfaces";

export const ForecastWeatherPage = () => {
  const [data, setData] = useState<WeatherData>({
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

  function onCitySubmit(cityData: string | undefined) {
    setIsLoading(true);
    fetch(
      `${API_HTTP}${cityData}?unitGroup=metric&key=${API_KEY}&contentType=json`
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(
            "Error, please wait until the request becomes available again or check if your request complies with the guidelines"
          );
        }
      })
      .then((response) => {
        console.log(response);
        setData(response);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        handleError(err);
      });
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
