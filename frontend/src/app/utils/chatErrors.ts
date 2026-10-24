import type { ChatError } from "@/app/types/interfaces";
import type { LanguageValue } from "@/app/types/types";

/** Localized title + detail for a failed chat request. */
export function describeChatError(
  error: ChatError,
  t: LanguageValue["t"],
): { title: string; detail: string } {
  switch (error.kind) {
    case "network":
      return { title: t("error.network.title"), detail: t("error.network.detail") };
    case "timeout":
      return { title: t("error.timeout.title"), detail: t("error.timeout.detail") };
    case "rateLimited":
      return { title: t("error.rateLimited.title"), detail: t("error.rateLimited.detail") };
    case "server": {
      const status = error.status ? ` (HTTP ${error.status})` : "";
      return { title: t("error.server.title"), detail: `${t("error.server.detail")}${status}` };
    }
    case "invalidResponse":
      return {
        title: t("error.invalidResponse.title"),
        detail: t("error.invalidResponse.detail"),
      };
    case "backend":
      // The backend already phrases its errors for end users (English only).
      return { title: t("error.backend.title"), detail: error.detail ?? t("error.backend.detail") };
  }
}
