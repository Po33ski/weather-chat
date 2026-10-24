import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/components/AppProviders/AppProviders";
import { addDays, todayIso } from "@/app/utils/format";
import { TripSearch } from "./TripSearch";

function setup(onSearch = vi.fn().mockResolvedValue(true)) {
  render(
    <AppProviders>
      <TripSearch onSearch={onSearch} disabled={false} />
    </AppProviders>,
  );
  return { onSearch, submit: () => fireEvent.click(screen.getByRole("button", { name: "Search" })) };
}

beforeEach(() => window.localStorage.setItem("lang", "en"));
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("TripSearch", () => {
  it("blocks an empty search and marks the field invalid", async () => {
    const { onSearch, submit } = setup();
    submit();

    expect(await screen.findByText("Enter a destination.")).toBeTruthy();
    expect(screen.getByLabelText("Where").getAttribute("aria-invalid")).toBe("true");
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("sends a current-weather prompt when no dates are given", async () => {
    const { onSearch, submit } = setup();
    fireEvent.change(screen.getByLabelText("Where"), { target: { value: "  Lisbon " } });
    submit();

    await waitFor(() => expect(onSearch).toHaveBeenCalledWith("What is the current weather in Lisbon?"));
  });

  it("validates hotel dates against today", async () => {
    const { onSearch, submit } = setup();
    fireEvent.click(screen.getByLabelText("Stays"));
    fireEvent.change(screen.getByLabelText("Where"), { target: { value: "Rome" } });
    fireEvent.change(screen.getByLabelText("Check-in"), { target: { value: addDays(todayIso(), -2) } });
    submit();

    expect(await screen.findByText("This date is in the past.")).toBeTruthy();
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("builds a stays prompt with both dates", async () => {
    const { onSearch, submit } = setup();
    const checkIn = addDays(todayIso(), 3);
    const checkOut = addDays(todayIso(), 6);
    fireEvent.click(screen.getByLabelText("Stays"));
    fireEvent.change(screen.getByLabelText("Where"), { target: { value: "Rome" } });
    fireEvent.change(screen.getByLabelText("Check-in"), { target: { value: checkIn } });
    fireEvent.change(screen.getByLabelText("Check-out"), { target: { value: checkOut } });
    submit();

    await waitFor(() => expect(onSearch).toHaveBeenCalledWith(`Find hotels in Rome from ${checkIn} to ${checkOut}.`));
  });

  it("clears a field's error as soon as it is edited", async () => {
    const { submit } = setup();
    submit();
    await screen.findByText("Enter a destination.");

    fireEvent.change(screen.getByLabelText("Where"), { target: { value: "R" } });
    expect(screen.queryByText("Enter a destination.")).toBeNull();
  });
});
