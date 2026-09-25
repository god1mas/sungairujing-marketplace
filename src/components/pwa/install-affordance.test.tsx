import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InstallAffordance } from "./install-affordance";

describe("InstallAffordance", () => {
  afterEach(cleanup);

  it("stays hidden without browser install capability", () => {
    render(<InstallAffordance />);
    expect(
      screen.queryByRole("button", { name: "Pasang aplikasi" }),
    ).not.toBeInTheDocument();
  });

  it("can be dismissed without starting installation", () => {
    render(<InstallAffordance />);
    const event = Object.assign(new Event("beforeinstallprompt"), {
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: "dismissed" as const }),
    });
    fireEvent(window, event);
    fireEvent.click(
      screen.getByRole("button", { name: "Tutup tawaran pemasangan" }),
    );
    expect(event.prompt).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("button", { name: "Pasang aplikasi" }),
    ).not.toBeInTheDocument();
  });
});
