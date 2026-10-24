import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useChat } from "./useChat";

const WEATHER_REPLY =
  'Sunny in Warsaw.\n\n```weather-json\n{"meta":{"city":"Warsaw","kind":"current","date":"2026-08-08","language":"en"},' +
  '"current":{"temp":21,"tempmax":25,"tempmin":15,"windspeed":10,"winddir":180,"pressure":1013,"humidity":60,' +
  '"sunrise":"05:30","sunset":"20:15","conditions":"Clear"}}\n```';

const reply = (message: string, sessionId = "s1") =>
  new Response(JSON.stringify({ success: true, data: { message, sender: "ai" }, session_id: sessionId }), {
    status: 200,
  });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("useChat", () => {
  it("adds the exchange and exposes the structured result", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(reply(WEATHER_REPLY))));
    const { result } = renderHook(() => useChat());

    await act(() => result.current.send("  Weather in Warsaw?  "));

    expect(result.current.messages.map((m) => [m.role, m.text])).toEqual([
      ["user", "Weather in Warsaw?"],
      ["ai", "Sunny in Warsaw."],
    ]);
    expect(result.current.messages[1].hasResult).toBe(true);
    expect(result.current.result).toMatchObject({ type: "weather", meta: { city: "Warsaw" } });
    expect(result.current.isSending).toBe(false);
  });

  it("reuses the server session id on the next turn", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(reply("Hi", "session-42")));
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useChat());

    await act(() => result.current.send("one"));
    await act(() => result.current.send("two"));

    const secondBody = JSON.parse((fetchMock.mock.calls[1] as unknown as [string, RequestInit])[1].body as string);
    expect(secondBody.session_id).toBe("session-42");
  });

  it("keeps the previous board when a reply has no structured data", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(reply(WEATHER_REPLY))
        .mockResolvedValueOnce(reply("1. Wawel\n2. Kazimierz\n3. Planty")),
    );
    const { result } = renderHook(() => useChat());

    await act(() => result.current.send("Weather?"));
    await act(() => result.current.send("What to do?"));

    expect(result.current.result).toMatchObject({ meta: { city: "Warsaw" } });
    expect(result.current.messages[3].hasResult).toBe(false);
  });

  it("refuses blank, oversized and concurrent messages", async () => {
    let resolveFetch: (r: Response) => void = () => {};
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>((resolve) => (resolveFetch = resolve))));
    const { result } = renderHook(() => useChat());

    expect(await result.current.send("   ")).toBe(false);
    expect(await result.current.send("x".repeat(4001))).toBe(false);

    let first: Promise<boolean> = Promise.resolve(false);
    act(() => {
      first = result.current.send("first");
    });
    expect(await result.current.send("second")).toBe(false);

    await act(async () => {
      resolveFetch(reply("ok"));
      await first;
    });
    expect(result.current.messages.filter((m) => m.role === "user")).toHaveLength(1);
  });

  it("records a failure and retries it without duplicating the message", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValueOnce(new TypeError("Failed to fetch")).mockResolvedValueOnce(reply("Back online")),
    );
    const { result } = renderHook(() => useChat());

    await act(() => result.current.send("Hello"));
    expect(result.current.error).toEqual({ kind: "network", detail: null });
    const errorEntry = result.current.messages[1];
    expect(errorEntry).toMatchObject({ role: "error", retryText: "Hello" });

    act(() => result.current.retry(errorEntry.id));
    await waitFor(() => expect(result.current.isSending).toBe(false));

    expect(result.current.messages.map((m) => [m.role, m.text])).toEqual([
      ["user", "Hello"],
      ["ai", "Back online"],
    ]);
    expect(result.current.error).toBeNull();
  });

  it("reset drops the conversation and ignores the in-flight answer", async () => {
    let resolveFetch: (r: Response) => void = () => {};
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>((resolve) => (resolveFetch = resolve))));
    const { result } = renderHook(() => useChat());

    let pending: Promise<boolean> = Promise.resolve(false);
    act(() => {
      pending = result.current.send("Hello");
    });
    act(() => result.current.reset());
    await act(async () => {
      resolveFetch(reply(WEATHER_REPLY));
      await pending;
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.result).toBeNull();
    expect(result.current.isSending).toBe(false);
  });
});
