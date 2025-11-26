"use client";
import React, { useEffect, useMemo, useState } from "react";
import { LanguageContext } from "@/app/contexts/LanguageContext";
import type { Lang, LanguageValue } from "@/app/types/types";

type Dictionary = Record<string, string>;

const en: Dictionary = {
  "menu.history": "History",
  "menu.current": "Current",
  "menu.forecast": "Forecast",
  "menu.chat": "Chat",

  "chat.title": "AI Chat Assistant",
  "chat.subtitle": "Powered by Google ADK",
  "chat.connected": "Connected",
  "chat.disconnected": "Disconnected",
  "chat.signout": "Sign out",
  "chat.placeholder": "Type your message...",
  "chat.sending": "AI is thinking...",

  "auth.signinTitle": "Sign in to use AI Chat",
  "auth.chooseMethod": "Choose your authentication method",
  "auth.or": "or",

  "totp.email": "Email",
  "totp.setupTitle": "Setup TOTP Authentication",
  "totp.verifyTitle": "Verify TOTP Code",
  "totp.setupCta": "Setup TOTP",
  "totp.verifyCta": "Verify Code",
  "totp.checkStatus": "Check TOTP Status",
  "totp.already": "Already have TOTP? Verify here",
  "totp.needSetup": "Need to setup TOTP? Click here",
  "totp.qrHint": "Scan this QR code with Google Authenticator:",

  "current.hoursCta": "Weather for every hour",
  "list.date": "Date",
  "list.maxTemp": "Max. Temperature",
  "list.minTemp": "Min. Temperature",
  "list.winddir": "Wind Direction",
  "list.windspeed": "Wind speed",
  "list.humidity": "Humidity",
  "list.pressure": "Air Pressure",
  "list.conditions": "Conditions",
  "list.sunrise": "Sunrise",
  "list.sunset": "Sunset",
  "day.hour": "Hour",
  "day.temp": "Temperature",
  "day.winddir": "Wind Direction",
  "day.windspeed": "Wind speed",
  "day.humidity": "Humidity",
  "day.pressure": "Air Pressure",
  "day.conditions": "Conditions",
  "form.check": "Check",
  "form.dateRange": "Date Range",
  "desc.current": "Enter the location for which you want to check the weather for today in the search box at the top.",
  "desc.forecast": "Enter the location for which you want to check the weather forecast for the next 15 days in the search box at the top.",
  "desc.history": "Enter the location you want to find past weather for in the search box at the top. Please check the weather for a maximum of 2 weeks due to server restrictions",
  "headline.current": "Current weather for each location",
  "headline.forecast": "Check the forecast for your city!",
  "headline.history": "Need weather data?",
  "weather.currentFor": "The current weather for {{address}}:",
  "hours.headline": "The weather for {{address}}:",
  "common.back": "Back",
  "common.close": "Close",
  "brick.currentTemp": "Current temperature",
  "brick.maxTemp": "Max. temperature",
  "brick.minTemp": "Min. temperature",
  "brick.conditions": "Conditions",
  "brick.windspeed": "Wind speed",
  "brick.winddir": "Wind direction",
  "brick.pressure": "Pressure",
  "brick.humidity": "Humidity",
  "brick.sunrise": "Sunrise",
  "brick.sunset": "Sunset",
  "info.title": "Information",
  "info.p1": "In this app you can check the weather forecast for any location in the world. You can ask the chatbot about the weather.",
  "info.p2": "In the upper right corner you can change the metric system in which weather data will be displayed.",
  "placeholder.city": "City",
};

const pl: Dictionary = {
  "menu.history": "Historia",
  "menu.current": "Aktualna",
  "menu.forecast": "Prognoza",
  "menu.chat": "Czat",

  "chat.title": "Asystent Czat AI",
  "chat.subtitle": "Wspierane przez Google ADK",
  "chat.connected": "Połączono",
  "chat.disconnected": "Brak połączenia",
  "chat.signout": "Wyloguj",
  "chat.placeholder": "Wpisz wiadomość...",
  "chat.sending": "AI myśli...",

  "auth.signinTitle": "Zaloguj się aby korzystać z AI Czat",
  "auth.chooseMethod": "Wybierz metodę uwierzytelnienia",
  "auth.or": "lub",

  "totp.email": "Email",
  "totp.setupTitle": "Konfiguracja TOTP",
  "totp.verifyTitle": "Weryfikacja kodu TOTP",
  "totp.setupCta": "Skonfiguruj TOTP",
  "totp.verifyCta": "Zweryfikuj kod",
  "totp.checkStatus": "Sprawdź status TOTP",
  "totp.already": "Masz już TOTP? Zweryfikuj tutaj",
  "totp.needSetup": "Musisz skonfigurować TOTP? Kliknij tutaj",
  "totp.qrHint": "Zeskanuj ten kod QR w Google Authenticator:",

  "current.hoursCta": "Pogoda dla każdej godziny",
  "list.date": "Data",
  "list.maxTemp": "Temp. maks.",
  "list.minTemp": "Temp. min.",
  "list.winddir": "Kierunek wiatru",
  "list.windspeed": "Prędkość wiatru",
  "list.humidity": "Wilgotność",
  "list.pressure": "Ciśnienie",
  "list.conditions": "Warunki",
  "list.sunrise": "Wschód słońca",
  "list.sunset": "Zachód słońca",
  "day.hour": "Godzina",
  "day.temp": "Temperatura",
  "day.winddir": "Kierunek wiatru",
  "day.windspeed": "Prędkość wiatru",
  "day.humidity": "Wilgotność",
  "day.pressure": "Ciśnienie",
  "day.conditions": "Warunki",
  "form.check": "Sprawdź",
  "form.historyWeather": "Historia pogody",
  "form.chatWeather": "Pogoda z AI",
  "form.dateRange": "Zakres dat",
  "form.currentWeather": "Aktualna pogoda",
  "form.forecastWeather": "Prognoza pogody",
  "desc.current": "Wpisz w wyszukiwarkę na górze lokalizację, dla której chcesz sprawdzić dzisiejszą pogodę.",
  "desc.forecast": "Wpisz w wyszukiwarkę na górze lokalizację, dla której chcesz sprawdzić prognozę pogody na najbliższe 15 dni.",
  "desc.history": "Wpisz w wyszukiwarkę na górze lokalizację, dla której chcesz sprawdzić pogodę z przeszłości. Sprawdź pogodę maksymalnie dla 2 tygodni ze względu na ograniczenia serwera.",
  "headline.current": "Aktualna pogoda dla każdej lokalizacji",
  "headline.forecast": "Sprawdź prognozę dla swojego miasta!",
  "headline.history": "Potrzebujesz danych pogodowych?",
  "weather.currentFor": "Aktualna pogoda dla {{address}}:",
  "hours.headline": "Pogoda dla {{address}}:",
  "common.back": "Wróć",
  "common.close": "Zamknij",
  "brick.currentTemp": "Temperatura", 
  "brick.maxTemp": "Temp. maks.",
  "brick.minTemp": "Temp. min.",
  "brick.conditions": "Warunki",
  "brick.windspeed": "Prędkość wiatru",
  "brick.winddir": "Kierunek wiatru",
  "brick.pressure": "Ciśnienie",
  "brick.humidity": "Wilgotność",
  "brick.sunrise": "Wschód słońca",
  "brick.sunset": "Zachód słońca",
  "info.title": "Informacje",
  "info.p1": "W tej aplikacji możesz sprawdzić prognozę pogody dla większości lokalizacji na świecie. Możesz też zapytać chatbota o pogodę.",
  "info.p2": "W prawym górnym rogu możesz zmienić system miar, w którym wyświetlane będą dane pogodowe.",
  "placeholder.city": "Miasto",
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


