"use client";
import { useContext, useEffect, useState } from "react";
import { LanguageContext } from "@/app/contexts/LanguageContext";
import type { AiMeta, AiChatData, AiKind } from "@/app/types/aiChat";
import { WeatherView } from "@/app/components/WeatherView/WeatherView";
import { List } from "@/app/components/List/List";

export function AiWeatherPanel({ meta, data }: { meta: AiMeta | null; data: AiChatData | null }) {
  const lang = useContext(LanguageContext);
  const [resolvedKind, setResolvedKind] = useState<AiKind>(meta?.kind ?? null);

  useEffect(() => {
    // Resolve kind from meta first; if missing, infer from data shape
    const k: AiKind = (meta?.kind as AiKind) ?? (data?.current ? 'current' : (Array.isArray(data?.days) ? 'forecast' : null));
    setResolvedKind(k);
  }, [meta, data]);

  if (!meta && !data) {
    return <div className="text-sm text-gray-500">{lang?.t('chat.subtitle')}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Meta only: city/date/date_range */}
      <div className="text-sm text-gray-600">
        {meta?.city && <span className="font-semibold">{meta.city}</span>}
        {meta?.date && <div>{meta.date}</div>}
        {meta?.date_range && <div>{meta.date_range}</div>}
      </div>

      {/* Preferred render using existing components */}
      {resolvedKind === 'current' && data?.current && (
        <WeatherView data={data.current} address={meta?.city ?? null} />
      )}

      {(resolvedKind === 'forecast' || resolvedKind === 'history' || (!resolvedKind && Array.isArray(data?.days))) && Array.isArray(data?.days) && (
        <List data={data.days as any} />
      )}

      {/**
       * Raw data dump (previous minimal output) kept for reference during development:
       *
       * {resolvedKind === 'current' && data?.current && (
       *   <div className="text-sm text-gray-800 space-y-1">
       *     <div>temp: {String(data.current.temp ?? '')}</div>
       *     <div>tempmax: {String(data.current.tempmax ?? '')}</div>
       *     <div>tempmin: {String(data.current.tempmin ?? '')}</div>
       *     <div>windspeed: {String(data.current.windspeed ?? '')}</div>
       *     <div>winddir: {String(data.current.winddir ?? '')}</div>
       *     <div>pressure: {String(data.current.pressure ?? '')}</div>
       *     <div>humidity: {String(data.current.humidity ?? '')}</div>
       *     <div>sunrise: {String(data.current.sunrise ?? '')}</div>
       *     <div>sunset: {String(data.current.sunset ?? '')}</div>
       *     <div>conditions: {String(data.current.conditions ?? '')}</div>
       *   </div>
       * )}
       *
       * {(resolvedKind === 'forecast' || resolvedKind === 'history' || (!resolvedKind && Array.isArray(data?.days))) && Array.isArray(data?.days) && (
       *   <div className="text-sm text-gray-800 space-y-2">
       *     {data?.days?.map((d, i) => (
       *       <div key={i} className="border rounded p-2">
       *         <div>datetime: {String(d.datetime ?? '')}</div>
       *         <div>temp: {String(d.temp ?? '')}</div>
       *         <div>tempmax: {String(d.tempmax ?? '')}</div>
       *         <div>tempmin: {String(d.tempmin ?? '')}</div>
       *         <div>windspeed: {String(d.windspeed ?? '')}</div>
       *         <div>winddir: {String(d.winddir ?? '')}</div>
       *         <div>pressure: {String(d.pressure ?? '')}</div>
       *         <div>humidity: {String(d.humidity ?? '')}</div>
       *         <div>sunrise: {String(d.sunrise ?? '')}</div>
       *         <div>sunset: {String(d.sunset ?? '')}</div>
       *         <div>conditions: {String(d.conditions ?? '')}</div>
       *       </div>
       *     ))}
       *   </div>
       * )}
       */}
    </div>
  );
}
