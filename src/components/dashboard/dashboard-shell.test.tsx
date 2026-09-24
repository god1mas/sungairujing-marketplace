import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/components/logout-button", () => ({
  LogoutButton: () => <button>Keluar</button>,
}));

import { DashboardShell } from "./dashboard-shell";

describe("DashboardShell", () => {
  it("links profile and the existing account security destination", () => {
    render(<DashboardShell>Konten</DashboardShell>);
    expect(screen.getByRole("link", { name: "Profil" })).toHaveAttribute(
      "href",
      "/dashboard/profile",
    );
    expect(
      screen.getByRole("link", { name: "Pengaturan Akun" }),
    ).toHaveAttribute("href", "/dashboard/account");
    expect(
      screen.queryByText("Akun merchant sedang dibekukan"),
    ).not.toBeInTheDocument();
  });

  it("shows the suspended state and merchant-visible reason without internal metadata", () => {
    render(
      <DashboardShell suspension={{ reason: "Dokumen usaha perlu ditinjau." }}>
        Konten
      </DashboardShell>,
    );
    expect(screen.getByText("Akun merchant sedang dibekukan")).toBeVisible();
    expect(screen.getByText("Dokumen usaha perlu ditinjau.")).toBeVisible();
    expect(screen.queryByText(/suspendedByUserId/i)).not.toBeInTheDocument();
  });
});
