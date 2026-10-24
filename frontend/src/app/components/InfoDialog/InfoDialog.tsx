import { useEffect, useRef, useState } from "react";
import { BedDouble, CloudSun, Info, Lightbulb, X } from "lucide-react";
import { useLanguage } from "@/app/hooks/useLanguage";

/** "About" dialog on the native <dialog>: focus trap, Esc and backdrop come from the platform. */
export function InfoDialog() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const features = [
    { icon: CloudSun, label: t("results.empty.weather.title") },
    { icon: Lightbulb, label: t("results.empty.ideas.title") },
    { icon: BedDouble, label: t("results.empty.stays.title") },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("info.open")}
        aria-haspopup="dialog"
        className="focus-ring grid size-8 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-surface-muted"
      >
        <Info className="size-4" aria-hidden="true" />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="info-title"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // A click on the ::backdrop targets the dialog element itself.
          if (event.target === event.currentTarget) setOpen(false);
        }}
        className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-3xl border border-line bg-surface p-0 text-ink shadow-overlay backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2 id="info-title" className="text-xl font-bold">
              {t("info.title")}
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("common.close")}
              className="focus-ring -mr-2 -mt-1 grid size-9 shrink-0 place-items-center rounded-full hover:bg-surface-muted"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-4 leading-relaxed text-ink-secondary">{t("info.p1")}</p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-3">
            {features.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 rounded-2xl bg-surface-muted px-3 py-2.5 text-sm font-medium">
                <Icon className="size-4 shrink-0 text-accent-ink" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
          <p className="mt-5 leading-relaxed text-ink-secondary">{t("info.p2")}</p>
          <p className="mt-5 border-t border-line pt-4 text-sm text-ink-muted">
            <span className="font-semibold text-ink-secondary">{t("info.sources")}:</span> {t("info.sourcesText")}
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="focus-ring mt-6 w-full rounded-2xl bg-ink py-3 text-sm font-semibold text-surface transition-opacity hover:opacity-90"
          >
            {t("common.close")}
          </button>
        </div>
      </dialog>
    </>
  );
}
