import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ getAuthenticatedSession: vi.fn() }));

vi.mock("@/lib/auth/session", () => auth);

import PublicLayout from "./layout";

describe("public layout", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("renders for an anonymous visitor without requiring authentication", async () => {
    auth.getAuthenticatedSession.mockResolvedValue(null);

    render(
      await PublicLayout({
        children: <main id="main-content">Konten publik</main>,
      }),
    );

    expect(screen.getByText("Konten publik")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Masuk" })[0]).toHaveAttribute(
      "href",
      "/login",
    );
    expect(
      screen.getByRole("link", { name: "Lewati ke konten utama" }),
    ).toHaveAttribute("href", "#main-content");
  });

  it("keeps the public shell visible and links authenticated users to dashboard", async () => {
    auth.getAuthenticatedSession.mockResolvedValue({
      user: { id: "user-a", globalRole: "USER" },
    });

    render(
      await PublicLayout({
        children: <main id="main-content">Marketplace publik</main>,
      }),
    );

    expect(screen.getByText("Marketplace publik")).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Dashboard" })[0],
    ).toHaveAttribute("href", "/dashboard");
  });

  it("links an authenticated Super Admin to the admin area", async () => {
    auth.getAuthenticatedSession.mockResolvedValue({
      user: { id: "admin-a", globalRole: "SUPER_ADMIN" },
    });

    render(
      await PublicLayout({
        children: <main id="main-content">Marketplace publik</main>,
      }),
    );

    expect(
      screen.getAllByRole("link", { name: "Dashboard" })[0],
    ).toHaveAttribute("href", "/admin");
  });
});
