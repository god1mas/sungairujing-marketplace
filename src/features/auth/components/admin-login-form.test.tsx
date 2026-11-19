import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  getSession: vi.fn(),
}));
const routerMocks = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next-auth/react", () => authMocks);
vi.mock("next/navigation", () => ({
  useRouter: () => routerMocks,
}));

import { AdminLoginForm } from "./admin-login-form";

describe("AdminLoginForm", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("uses only the admin provider and displays a generic failure", async () => {
    authMocks.signIn.mockResolvedValue({ ok: false });
    render(<AdminLoginForm />);

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "ADMIN_SUNGAIRUJING" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong-password" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Masuk sebagai Admin" }),
    );

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Username atau password tidak sesuai.",
      ),
    );
    expect(authMocks.signIn).toHaveBeenCalledWith("admin-credentials", {
      username: "ADMIN_SUNGAIRUJING",
      password: "wrong-password",
      redirect: false,
    });
    expect(authMocks.getSession).not.toHaveBeenCalled();
  });

  it("refuses a merchant session even after a successful provider response", async () => {
    authMocks.signIn.mockResolvedValue({ ok: true });
    authMocks.getSession.mockResolvedValue({ user: { globalRole: "USER" } });
    render(<AdminLoginForm />);
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "admin_sungairujing" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Masuk sebagai Admin" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Sesi tidak dapat dibuat.",
      ),
    );
  });

  it("routes a verified admin session to the admin dashboard", async () => {
    authMocks.signIn.mockResolvedValue({ ok: true });
    authMocks.getSession.mockResolvedValue({
      user: { globalRole: "SUPER_ADMIN" },
    });
    render(<AdminLoginForm />);
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "admin_sungairujing" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Masuk sebagai Admin" }),
    );
    await waitFor(() =>
      expect(routerMocks.replace).toHaveBeenCalledWith("/admin"),
    );
  });
});
