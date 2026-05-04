import { useContext, useEffect, useState } from "react";
import { LanguageContext } from "@/app/contexts/LanguageContext";
import type { AiMeta, AiChatData, AiKind } from "@/app/types/aiChat";
import { WeatherView } from "@/app/components/WeatherView/WeatherView";
import { List } from "@/app/components/List/List";

export function AiWeatherPanel({ meta, data }: { meta: AiMeta | null; data: AiChatData | null }) {
  const lang = useContext(LanguageContext);
  const [resolvedKind, setResolvedKind] = useState<AiKind>(meta?.kind ?? null);

  useEffect(() => {
    const k: AiKind =
      (meta?.kind as AiKind) ??
      (data?.current ? 'current' : Array.isArray(data?.days) ? 'forecast' : null);
    setResolvedKind(k);
  }, [meta, data]);

  if (!meta && !data) {
    return (
      <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center">
        <span className="text-5xl block mb-4 opacity-50">🌤️</span>
        <p className="text-sky-200/60 text-sm leading-relaxed">{lang?.t('chat.subtitle')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* City / date header card */}
      {(meta?.city || meta?.date || meta?.date_range) && (
        <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-3xl px-6 py-5 flex items-center justify-between gap-4">
          <div>
            {meta?.city && (
              <h3 className="text-xl font-bold text-white">{meta.city}</h3>
            )}
            {(meta?.date || meta?.date_range) && (
              <p className="text-sky-300/60 text-sm mt-0.5">
                {meta.date || meta.date_range}
              </p>
            )}
          </div>
          <span className="text-2xl opacity-40 select-none flex-shrink-0">📍</span>
        </div>
      )}

      {/* Current weather */}
      {resolvedKind === 'current' && data?.current && (
        <WeatherView data={data.current} address={meta?.city ?? null} whereFrom="chat" />
      )}

      {/* Forecast / History */}
      {(resolvedKind === 'forecast' ||
        resolvedKind === 'history' ||
        (!resolvedKind && Array.isArray(data?.days))) &&
        Array.isArray(data?.days) && (
          <List data={data.days as any} />
        )}
    </div>
  );
}
