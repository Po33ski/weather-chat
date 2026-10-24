import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/components/AppProviders/AppProviders";
import { ChatComposer } from "./ChatComposer";

function setup({ isSending = false, accepted = true } = {}) {
  const onSend = vi.fn().mockResolvedValue(accepted);
  render(
    <AppProviders>
      <ChatComposer onSend={onSend} isSending={isSending} />
    </AppProviders>,
  );
  const input = screen.getByLabelText("Message to the trip assistant") as HTMLTextAreaElement;
  const button = screen.getByRole("button", { name: "Send message" }) as HTMLButtonElement;
  return { onSend, input, button };
}

beforeEach(() => window.localStorage.setItem("lang", "en"));
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("ChatComposer", () => {
  it("sends on Enter and clears the draft", async () => {
    const { onSend, input } = setup();
    fireEvent.change(input, { target: { value: "Weather in Kraków?" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSend).toHaveBeenCalledWith("Weather in Kraków?");
    await waitFor(() => expect(input.value).toBe(""));
  });

  it("keeps Shift+Enter for a new line", () => {
    const { onSend, input } = setup();
    fireEvent.change(input, { target: { value: "line one" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("disables sending for whitespace-only input and while a reply is pending", () => {
    const idle = setup();
    fireEvent.change(idle.input, { target: { value: "   " } });
    expect(idle.button.disabled).toBe(true);
    cleanup();

    const busy = setup({ isSending: true });
    fireEvent.change(busy.input, { target: { value: "next question" } });
    expect(busy.button.disabled).toBe(true);
    fireEvent.keyDown(busy.input, { key: "Enter" });
    expect(busy.onSend).not.toHaveBeenCalled();
  });

  it("restores the draft when the message is refused", async () => {
    const { input } = setup({ accepted: false });
    fireEvent.change(input, { target: { value: "keep me" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(input.value).toBe("keep me"));
  });

  it("caps the input at the backend limit", () => {
    const { input } = setup();
    expect(input.maxLength).toBe(4000);
  });
});
