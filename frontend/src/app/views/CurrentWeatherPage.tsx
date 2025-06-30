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
import { API_KEY, API_HTTP } from "../constants/apiConstants";
import { BrickModalContextType, CityContextType } from "../types/types";
import { CurrentData } from "../types/interfaces";
import { CityContext } from "../contexts/CityContextType";

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

  useEffect(() => {
    if (cityContext?.city.data) {
      fetch(
        `${API_HTTP}${cityContext?.city.data}?unitGroup=metric&include=alerts%2Cdays%2Chours%2Ccurrent&key=${API_KEY}&contentType=json`
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
  }, [cityContext?.city.data, handleError]);

  function onCitySubmit(cityData: string | undefined) {
    cityContext?.city.setToLocalStorage(cityData);

    setIsLoading(true);
    fetch(
      `${API_HTTP}${cityData}?unitGroup=metric&include=alerts%2Cdays%2Chours%2Ccurrent&key=${API_KEY}&contentType=json`
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
