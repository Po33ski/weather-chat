import { useLanguage } from "@/app/hooks/useLanguage";

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <p>
          {t("footer.rights", { year: new Date().getFullYear() })} · {t("footer.author")}
        </p>
        <p>{t("footer.sources")}</p>
      </div>
    </footer>
  );
}
