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
  "form.check": "Check",
  "desc.current": "Enter the location for which you want to check the weather for today in the search box at the top.",
  "desc.forecast": "Enter the location for which you want to check the weather forecast for the next 15 days in the search box at the top.",
  "desc.history": "Enter the location you want to find past weather for in the search box at the top. Please check the weather for a maximum of 2 weeks due to server restrictions",
  "headline.current": "Current weather for each location",
  "headline.forecast": "Check the forecast for your city!",
  "weather.currentFor": "The current weather for {{address}}:",
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
  "form.check": "Sprawdź",
  "desc.current": "Wpisz w wyszukiwarkę na górze lokalizację, dla której chcesz sprawdzić dzisiejszą pogodę.",
  "desc.forecast": "Wpisz w wyszukiwarkę na górze lokalizację, dla której chcesz sprawdzić prognozę pogody na najbliższe 15 dni.",
  "desc.history": "Wpisz w wyszukiwarkę na górze lokalizację, dla której chcesz sprawdzić pogodę z przeszłości. Sprawdź pogodę maksymalnie dla 2 tygodni ze względu na ograniczenia serwera.",
  "headline.current": "Aktualna pogoda dla każdej lokalizacji",
  "headline.forecast": "Sprawdź prognozę dla swojego miasta!",
  "weather.currentFor": "Aktualna pogoda dla {{address}}:",
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


