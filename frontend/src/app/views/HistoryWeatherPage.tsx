"use client";
import { useState, useCallback, useContext } from "react";
import { HistoryForm } from "../components/HistoryForm/HistoryForm";
import { List } from "../components/List/List";
import { ErrorMessage } from "../components/ErrorMessage/ErrorMessage";
import { Loading } from "../components/Loading/Loading";
import { MyText } from "../components/MyText/MyText";
import { MainPhoto } from "../components/MainPhoto/MainPhoto";
import { normalDateFormatted } from "../functions/functions";
import { API_KEY, API_HTTP } from "../constants/apiConstants";
import { InfoModalContext } from "../contexts/InfoModalContext";
import { capitalizeFirstLetter } from "../functions/functions";
import { InfoModalContextType } from "../types/types";
import { WeatherData } from "../types/interfaces";

export const HistoryWeatherPage = () => {
  const infoModalContext = useContext<InfoModalContextType | null>(
    InfoModalContext
  );
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

  function onSubmit(
    cityData: string | undefined,
    startDate: Date,
    endDate: Date
  ) {
    let normalStartDate =
      startDate === null ? "" : normalDateFormatted(startDate);
    let normalEndDate = endDate === null ? "" : normalDateFormatted(endDate);

    setIsLoading(true);
    fetch(
      `${API_HTTP}${cityData}/${normalStartDate}/${normalEndDate}?unitGroup=metric&key=${API_KEY}&contentType=json`
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
      {isError && <ErrorMessage>{isError}</ErrorMessage>}
      <HistoryForm onSubmit={onSubmit} />
      {data["address"] !== null ? (
        <MyText>
          The weather for {capitalizeFirstLetter(data["address"])} from the
          past:
        </MyText>
      ) : (
        ""
      )}
      {data["address"] ? <List data={data["days"]} /> : <MainPhoto />}
    </>
  );
};
