import type { ReactNode } from "react";
import { AppHeader } from "@/app/components/AppHeader/AppHeader";
import { Footer } from "@/app/components/Footer/Footer";
import { useLanguage } from "@/app/hooks/useLanguage";

export function Layout({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-surface focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
      >
        {t("nav.skip")}
      </a>
      <AppHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
