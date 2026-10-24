import { Compass } from "lucide-react";
import { useLanguage } from "@/app/hooks/useLanguage";

export function Logo() {
  const { t } = useLanguage();
  return (
    <a href="/" aria-label={t("app.name")} className="focus-ring flex min-w-0 items-center gap-2.5 rounded-lg">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-white" aria-hidden="true">
        <Compass className="size-5" strokeWidth={2} />
      </span>
      {/* Narrow phones keep just the mark; the link stays labelled via aria-label. */}
      <span className="hidden min-w-0 leading-tight min-[440px]:block" aria-hidden="true">
        <span className="block truncate text-[15px] font-bold text-ink sm:text-base">
          {t("app.name")}
        </span>
        <span className="hidden text-xs text-ink-muted sm:block">{t("app.tagline")}</span>
      </span>
    </a>
  );
}
