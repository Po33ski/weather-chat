import { useLanguage } from "@/app/hooks/useLanguage";
import type { Lang } from "@/app/types/types";

const LANGS: { value: Lang; label: string; name: string }[] = [
  { value: "en", label: "EN", name: "English" },
  { value: "pl", label: "PL", name: "Polski" },
];

export function LanguageSwitch() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div role="group" aria-label={t("header.language")} className="flex rounded-full border border-line p-0.5">
      {LANGS.map((option) => {
        const active = option.value === lang;
        return (
          <button
            key={option.value}
            type="button"
            lang={option.value}
            aria-pressed={active}
            aria-label={option.name}
            onClick={() => setLang(option.value)}
            className={`focus-ring rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
              active ? "bg-ink text-surface" : "text-ink-secondary hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
