// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

// jsdom lacks ResizeObserver and Element.prototype.scrollIntoView; cmdk uses both internally.
class ResizeObserverPolyfill {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).ResizeObserver = (globalThis as any).ResizeObserver ?? ResizeObserverPolyfill;
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function () {};
}

import { Combobox, ComboboxMulti } from "@/components/ui/combobox";

const opts = [
  { value: "a", label: "Anita" },
  { value: "b", label: "Ben" },
  { value: "c", label: "Carlos" },
];

afterEach(() => {
  cleanup();
});

describe("Combobox", () => {
  it("renders placeholder when no value", () => {
    render(<Combobox value="" onChange={() => {}} options={opts} placeholder="Pick…" />);
    expect(screen.getByText("Pick…")).toBeTruthy();
  });

  it("opens on click and lists options", () => {
    render(<Combobox value="" onChange={() => {}} options={opts} placeholder="Pick…" />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Anita")).toBeTruthy();
    expect(screen.getByText("Ben")).toBeTruthy();
  });

  it("filters by search input", () => {
    render(<Combobox value="" onChange={() => {}} options={opts} />);
    fireEvent.click(screen.getByRole("button"));
    const search = screen.getByPlaceholderText(/search/i);
    fireEvent.change(search, { target: { value: "car" } });
    expect(screen.queryByText("Anita")).toBeNull();
    expect(screen.getByText("Carlos")).toBeTruthy();
  });

  it("invokes onChange when option picked", () => {
    let picked = "";
    render(
      <Combobox value="" onChange={(v) => (picked = v)} options={opts} />,
    );
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Ben"));
    expect(picked).toBe("b");
  });
});

describe("ComboboxMulti", () => {
  it("renders chips for selected values", () => {
    render(<ComboboxMulti values={["a", "c"]} onChange={() => {}} options={opts} />);
    expect(screen.getByText("Anita")).toBeTruthy();
    expect(screen.getByText("Carlos")).toBeTruthy();
  });

  it("toggles values on click", () => {
    let next: string[] = [];
    render(<ComboboxMulti values={["a"]} onChange={(v) => (next = v)} options={opts} />);
    // Trigger has aria-haspopup="listbox"; the chip-X buttons (role="button" spans) don't.
    const trigger = screen
      .getAllByRole("button")
      .find((el) => el.getAttribute("aria-haspopup") === "listbox");
    if (!trigger) throw new Error("trigger not found");
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText("Ben"));
    expect(next).toEqual(["a", "b"]);
  });
});
