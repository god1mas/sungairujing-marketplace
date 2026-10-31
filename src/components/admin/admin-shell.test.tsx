import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminShell } from "./admin-shell";

const { usePathnameMock } = vi.hoisted(() => ({
  usePathnameMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
}));

vi.mock("@/features/auth/components/logout-button", () => ({
  LogoutButton: () => <button type="button">Logout</button>,
}));

describe("AdminShell", () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue("/admin/reports/report-id");
  });

  afterEach(cleanup);

  it("keeps the current admin destination visible and marked active", () => {
    render(
      <AdminShell>
        <p>Konten admin</p>
      </AdminShell>,
    );

    expect(screen.getByText("Konten admin")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Laporan publik" }),
    ).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Ringkasan" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });

  it("opens an accessible mobile drawer and closes it with Escape", () => {
    render(
      <AdminShell>
        <p>Konten admin</p>
      </AdminShell>,
    );

    const trigger = screen.getByRole("button", { name: "Buka menu admin" });
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("dialog", { name: "Menu Super Admin" }),
    ).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(
      screen.queryByRole("dialog", { name: "Menu Super Admin" }),
    ).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
