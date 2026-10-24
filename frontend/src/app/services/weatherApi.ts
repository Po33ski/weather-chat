import { BACKEND_API_URL } from "../constants/apiConstants";
import { CHAT_REQUEST_TIMEOUT_MS } from "../constants/chat";
import type { ChatError, ChatResult } from "../types/interfaces";

const TIMEOUT_REASON = "chat-request-timeout";

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const sessionIdOf = (payload: unknown): string | null =>
  isObject(payload) && typeof payload.session_id === "string" && payload.session_id
    ? payload.session_id
    : null;

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function httpError(status: number, payload: unknown): ChatError {
  if (status === 429) return { kind: "rateLimited", detail: null, status };
  if (status >= 500) return { kind: "server", detail: null, status };
  // FastAPI puts a string (or a validation-error list) in `detail`; slowapi uses `error`.
  const detail = isObject(payload)
    ? typeof payload.detail === "string"
      ? payload.detail
      : typeof payload.error === "string"
        ? payload.error
        : null
    : null;
  return { kind: "backend", detail, status };
}

class WeatherApiService {
  /**
   * Send one chat turn. Never throws: transport failures, HTTP errors and
   * malformed payloads all come back as `{ ok: false, error }` so the UI has a
   * single error path. The server keeps the conversation history in its
   * session, so only the new message and the session id are sent.
   */
  async getChatResponse(
    message: string,
    sessionId: string | null,
    { signal, timeoutMs = CHAT_REQUEST_TIMEOUT_MS }: { signal?: AbortSignal; timeoutMs?: number } = {},
  ): Promise<ChatResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(TIMEOUT_REASON), timeoutMs);
    const forwardAbort = () => controller.abort(signal?.reason);
    if (signal?.aborted) forwardAbort();
    signal?.addEventListener("abort", forwardAbort, { once: true });

    try {
      const response = await fetch(`${BACKEND_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, session_id: sessionId ?? undefined }),
        signal: controller.signal,
      });
      const payload = await readJson(response);
      // An abort while the body streams surfaces as a JSON error — report it as the abort.
      if (controller.signal.aborted) throw controller.signal.reason;
      const responseSessionId = sessionIdOf(payload);

      if (!response.ok) {
        return { ok: false, error: httpError(response.status, payload), sessionId: responseSessionId };
      }
      if (!isObject(payload) || typeof payload.success !== "boolean") {
        return { ok: false, error: { kind: "invalidResponse", detail: null }, sessionId: null };
      }
      if (!payload.success) {
        const detail = typeof payload.error === "string" && payload.error ? payload.error : null;
        return { ok: false, error: { kind: "backend", detail }, sessionId: responseSessionId };
      }
      const data = payload.data;
      if (!isObject(data) || typeof data.message !== "string") {
        return { ok: false, error: { kind: "invalidResponse", detail: null }, sessionId: responseSessionId };
      }
      return { ok: true, message: data.message, sessionId: responseSessionId };
    } catch (error) {
      if (controller.signal.aborted) {
        const timedOut = controller.signal.reason === TIMEOUT_REASON;
        return {
          ok: false,
          error: timedOut ? { kind: "timeout", detail: null } : { kind: "aborted" },
          sessionId: null,
        };
      }
      console.error("Chat request failed:", error);
      return { ok: false, error: { kind: "network", detail: null }, sessionId: null };
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", forwardAbort);
    }
  }
}

export const weatherApi = new WeatherApiService();
