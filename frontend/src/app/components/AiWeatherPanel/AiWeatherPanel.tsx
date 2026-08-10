import { useContext, useEffect, useState } from "react";
import { LanguageContext } from "@/app/contexts/LanguageContext";
import type { AiMeta, AiChatData, AiKind } from "@/app/types/aiChat";
import { WeatherView } from "@/app/components/WeatherView/WeatherView";
import { List } from "@/app/components/List/List";
import { HotelView } from "@/app/components/HotelView/HotelView";
import { CombinedView } from "@/app/components/CombinedView/CombinedView";

export function AiWeatherPanel({ meta, data }: { meta: AiMeta | null; data: AiChatData | null }) {
  const lang = useContext(LanguageContext);
  const [resolvedKind, setResolvedKind] = useState<AiKind>(meta?.kind ?? null);

  useEffect(() => {
    const k: AiKind =
      (meta?.kind as AiKind) ??
      (data?.weatherKind !== undefined ? 'combined' :
       data?.hotels ? 'hotels' :
       data?.current ? 'current' :
       Array.isArray(data?.days) ? 'forecast' : null);
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

  const isHotel = resolvedKind === 'hotels';
  const isCombined = resolvedKind === 'combined';
  const hasHotels = Array.isArray(data?.hotels) && data.hotels.length > 0;

  return (
    <div className="space-y-4">
      {/* City / date header — skipped when HotelView/CombinedView render their own header */}
      {!(isHotel && hasHotels) && !isCombined && (meta?.city || meta?.date || meta?.date_range) && (
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

      {/* Combined weather + hotels, with a tab toggle */}
      {isCombined && (
        <CombinedView
          weatherKind={data?.weatherKind ?? null}
          current={data?.current}
          days={data?.days}
          hotels={data?.hotels ?? []}
          city={meta?.city ?? null}
          date={meta?.date ?? null}
          dateRange={meta?.date_range ?? null}
        />
      )}

      {/* Hotels */}
      {isHotel && hasHotels && (
        <HotelView
          hotels={data!.hotels!}
          city={meta?.city ?? null}
          dateRange={meta?.date_range ?? null}
        />
      )}
      {isHotel && !hasHotels && (
        <p className="text-sky-400/40 text-sm italic px-1">
          {lang?.t('combined.noHotels') || 'No hotels found'}
        </p>
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
