import React, { useEffect, useMemo, useState } from "react";
import { LanguageContext } from "@/app/contexts/LanguageContext";
import type { Lang, LanguageValue } from "@/app/types/types";

type Dictionary = Record<string, string>;

const en: Dictionary = {
  "chat.title": "AI Chat Assistant",
  "chat.subtitle": "Powered by Google ADK",
  "chat.connected": "Connected",
  "chat.disconnected": "Disconnected",
  "chat.placeholder": "Type your message...",
  "chat.sending": "AI is thinking...",

  "list.date": "Date",
  "list.maxTemp": "Max. Temperature",
  "list.minTemp": "Min. Temperature",
  "list.windspeed": "Wind speed",
  "list.humidity": "Humidity",
  "list.pressure": "Air Pressure",
  "list.conditions": "Conditions",
  "common.close": "Close",
  "brick.currentTemp": "Current temperature",
  "brick.windspeed": "Wind speed",
  "brick.winddir": "Wind direction",
  "brick.pressure": "Pressure",
  "brick.humidity": "Humidity",
  "brick.sunrise": "Sunrise",
  "brick.sunset": "Sunset",
  "info.title": "Information",
  "info.p1": "In this app you can check the weather forecast for any location in the world. You can ask the chatbot about the weather and also ask for useful information about the city you are visiting.",
  "info.p2": "In the upper right corner you can change the metric system in which weather data will be displayed and the language of the application.",

  "hotel.perNight": "/ night",
  "hotel.available": "Available",
  "hotel.unavailable": "Unknown availability",
  "hotel.reviews": "reviews",
  "hotel.book": "View offer",
  "hotel.noPrice": "Price not available",
  "hotel.resultsFor": "Hotels in",

  "combined.weatherTab": "Weather",
  "combined.hotelsTab": "Hotels",
  "combined.noWeather": "No weather data available",
  "combined.noHotels": "No hotels found",
};

const pl: Dictionary = {
  "chat.title": "Asystent Czat AI",
  "chat.subtitle": "Wspierane przez Google ADK",
  "chat.connected": "Połączono",
  "chat.disconnected": "Brak połączenia",
  "chat.placeholder": "Wpisz wiadomość...",
  "chat.sending": "AI myśli...",

  "list.date": "Data",
  "list.maxTemp": "Temp. maks.",
  "list.minTemp": "Temp. min.",
  "list.windspeed": "Prędkość wiatru",
  "list.humidity": "Wilgotność",
  "list.pressure": "Ciśnienie",
  "list.conditions": "Warunki",
  "common.close": "Zamknij",
  "brick.currentTemp": "Temperatura", 
  "brick.windspeed": "Prędkość wiatru",
  "brick.winddir": "Kierunek wiatru",
  "brick.pressure": "Ciśnienie",
  "brick.humidity": "Wilgotność",
  "brick.sunrise": "Wschód słońca",
  "brick.sunset": "Zachód słońca",
  "info.title": "Informacje",
  "info.p1": "W tej aplikacji możesz sprawdzić prognozę pogody dla większości lokalizacji na świecie. Możesz zapytać chatbota AI o pogodę ale też poprosić o przydatne informacje na temat zwiedzania danego miasta.",
  "info.p2": "W prawym górnym rogu możesz zmienić system miar, w którym wyświetlane będą dane pogodowe oraz język aplikacji.",

  "hotel.perNight": "/ noc",
  "hotel.available": "Dostępny",
  "hotel.unavailable": "Dostępność nieznana",
  "hotel.reviews": "opinii",
  "hotel.book": "Zobacz ofertę",
  "hotel.noPrice": "Cena niedostępna",
  "hotel.resultsFor": "Hotele w",

  "combined.weatherTab": "Pogoda",
  "combined.hotelsTab": "Hotele",
  "combined.noWeather": "Brak danych pogodowych",
  "combined.noHotels": "Nie znaleziono hoteli",
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem("lang") as Lang | null) : null;
    if (stored === "en" || stored === "pl") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };
 
  const dict = lang === "pl" ? pl : en;
  const t = (k: string) => dict[k] ?? k;

  const value: LanguageValue = useMemo(() => ({ lang, setLang, t }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
