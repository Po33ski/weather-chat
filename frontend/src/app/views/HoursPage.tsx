"use client";
import { useState, useCallback, useContext, useEffect } from "react";
import { CurrentForm } from "../components/CurrentForm/CurrentForm";
import { ErrorMessage } from "../components/ErrorMessage/ErrorMessage";
import { Loading } from "../components/Loading/Loading";
import { API_KEY, API_HTTP } from "../constants/apiConstants";
import { DayList } from "../components/DayList/DayList";
import { MyText } from "../components/MyText/MyText";
import { ButtonLink } from "../components/ButtonLink/ButtonLink";
import { CityContextType } from "../types/types";
import { CurrentData } from "../types/interfaces";
import { CityContext } from "../contexts/CityContextType";
import { capitalizeFirstLetter } from "../functions/functions";

export function HoursPage() {
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

  const handleError = useCallback((e: Error) => {
    setIsError(e.message);
    setTimeout(() => {
      setIsError(null);
    }, 5000);
  }, []);

  useEffect(() => {
    fetch(
      `${API_HTTP}${cityContext?.city.data}?unitGroup=metric&include=hours%2Cdays&key=${API_KEY}&contentType=json`
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
  }, [cityContext?.city.data, handleError]);
  function onCitySubmit(cityData: string | undefined) {
    cityContext?.city.setToLocalStorage(cityData);
    setIsLoading(true);
    fetch(
      `${API_HTTP}${cityData}?unitGroup=metric&include=hours%2Cdays&key=${API_KEY}&contentType=json`
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
  const address = capitalizeFirstLetter(data["address"]);
  return (
    <>
      <CurrentForm onCitySubmit={onCitySubmit} />
      {isError && <ErrorMessage>{isError}</ErrorMessage>}
      {data["address"] && (
        <div>
          {address !== null ? <MyText>The weather for {address}:</MyText> : ""}
          <DayList data={data["days"][0]["hours"]} />
          <ButtonLink path={"/current"}>Back</ButtonLink>
        </div>
      )}
    </>
  );
}
