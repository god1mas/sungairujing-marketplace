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

import { LoginForm } from "./login-form";

describe("LoginForm", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("shows registration-success feedback from the approved query contract", () => {
    render(<LoginForm registered />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Registrasi berhasil. Silakan login dengan akun Anda.",
    );
  });

  it("shows password-change feedback before re-authentication", () => {
    render(<LoginForm passwordChanged />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Password berhasil diperbarui. Silakan login kembali.",
    );
  });

  it("shows the same safe error when Auth.js rejects credentials", async () => {
    authMocks.signIn.mockResolvedValue({ ok: false });
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Nomor WhatsApp"), {
      target: { value: "081234567890" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password-salah" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Nomor WhatsApp atau password tidak sesuai.",
      ),
    );
    expect(authMocks.getSession).not.toHaveBeenCalled();
  });

  it("sends a merchant to the dashboard but never accepts an admin session", async () => {
    authMocks.signIn.mockResolvedValue({ ok: true });
    authMocks.getSession.mockResolvedValueOnce({
      user: { globalRole: "SUPER_ADMIN" },
    });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Nomor WhatsApp"), {
      target: { value: "081234567890" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Sesi tidak dapat dibuat.",
      ),
    );
    expect(routerMocks.replace).not.toHaveBeenCalled();
    expect(authMocks.signIn).toHaveBeenCalledWith("credentials", {
      whatsappNumber: "081234567890",
      password: "password",
      redirect: false,
    });
  });
});
