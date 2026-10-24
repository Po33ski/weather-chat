import { afterEach, describe, expect, it, vi } from "vitest";
import { weatherApi } from "./weatherApi";

function mockFetch(impl: (init?: RequestInit) => Promise<Response>) {
  const fetchMock = vi.fn((_url: string, init?: RequestInit) => impl(init));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("weatherApi.getChatResponse", () => {
  it("returns the message and session id on success", async () => {
    const fetchMock = mockFetch(() => json({ success: true, data: { message: "Hi", sender: "ai" }, session_id: "s1" }));

    const result = await weatherApi.getChatResponse("Hello", "s0");

    expect(result).toEqual({ ok: true, message: "Hi", sessionId: "s1" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/chat");
    // History lives in the server-side session; only the new turn is sent.
    expect(JSON.parse(init?.body as string)).toEqual({ message: "Hello", session_id: "s0" });
  });

  it("omits the session id on the first turn", async () => {
    const fetchMock = mockFetch(() => json({ success: true, data: { message: "Hi" } }));
    await weatherApi.getChatResponse("Hello", null);
    expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual({ message: "Hello" });
  });

  it("surfaces backend errors (HTTP 200, success=false)", async () => {
    mockFetch(() => json({ success: false, error: "The request timed out. Please try again.", session_id: "s1" }));
    expect(await weatherApi.getChatResponse("Hello", null)).toEqual({
      ok: false,
      error: { kind: "backend", detail: "The request timed out. Please try again." },
      sessionId: "s1",
    });
  });

  it("classifies rate limiting and server failures", async () => {
    mockFetch(() => json({ error: "Rate limit exceeded: 10 per 1 minute" }, 429));
    expect(await weatherApi.getChatResponse("x", null)).toMatchObject({ ok: false, error: { kind: "rateLimited", status: 429 } });

    mockFetch(() => Promise.resolve(new Response("<html>Bad Gateway</html>", { status: 502 })));
    expect(await weatherApi.getChatResponse("x", null)).toMatchObject({ ok: false, error: { kind: "server", status: 502 } });
  });

  it("uses FastAPI's string detail for other client errors", async () => {
    mockFetch(() => json({ detail: "Session not found" }, 404));
    expect(await weatherApi.getChatResponse("x", null)).toMatchObject({
      ok: false,
      error: { kind: "backend", detail: "Session not found", status: 404 },
    });
  });

  it("reports a network failure when the backend is unreachable", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockFetch(() => Promise.reject(new TypeError("Failed to fetch")));
    expect(await weatherApi.getChatResponse("x", null)).toEqual({
      ok: false,
      error: { kind: "network", detail: null },
      sessionId: null,
    });
  });

  it("rejects payloads that don't match the contract", async () => {
    mockFetch(() => json({ success: true, data: { text: "wrong field" } }));
    expect(await weatherApi.getChatResponse("x", null)).toMatchObject({ ok: false, error: { kind: "invalidResponse" } });

    mockFetch(() => Promise.resolve(new Response("not json", { status: 200 })));
    expect(await weatherApi.getChatResponse("x", null)).toMatchObject({ ok: false, error: { kind: "invalidResponse" } });
  });

  it("times out a request that never answers", async () => {
    vi.useFakeTimers();
    mockFetch(
      (init) =>
        new Promise((_, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        }),
    );
    const pending = weatherApi.getChatResponse("x", null, { timeoutMs: 1000 });
    await vi.advanceTimersByTimeAsync(1000);
    expect(await pending).toMatchObject({ ok: false, error: { kind: "timeout" } });
  });

  it("reports a caller abort separately from a timeout", async () => {
    mockFetch(
      (init) =>
        new Promise((_, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        }),
    );
    const controller = new AbortController();
    const pending = weatherApi.getChatResponse("x", null, { signal: controller.signal });
    controller.abort();
    expect(await pending).toMatchObject({ ok: false, error: { kind: "aborted" } });
  });
});
