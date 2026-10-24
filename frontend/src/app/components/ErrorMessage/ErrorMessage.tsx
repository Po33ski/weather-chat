import { createPortal } from "react-dom";
import { CircleAlert, X } from "lucide-react";
import { useLanguage } from "@/app/hooks/useLanguage";

export function ErrorMessage({
  title,
  detail,
  onClose,
}: {
  title: string;
  detail: string;
  onClose?: () => void;
}) {
  const { t } = useLanguage();

  // Portalled to document.body: a sticky-positioned ancestor (e.g. the chat
  // panel) creates its own stacking context, which would trap this toast's
  // z-index locally and let the sticky header render on top of it.
  return createPortal(
    <div
      role="alert"
      className="fixed inset-x-4 top-20 z-50 mx-auto flex max-w-lg animate-fade-in-up items-start gap-3 rounded-2xl border border-danger/25 bg-surface p-4 shadow-overlay"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-danger-soft text-danger" aria-hidden="true">
        <CircleAlert className="size-5" />
      </span>
      <div className="min-w-0 flex-1 break-words">
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-sm text-ink-secondary">{detail}</p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={t("error.dismiss")}
          className="focus-ring -m-1 grid size-8 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-surface-muted hover:text-ink"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>,
    document.body,
  );
}
