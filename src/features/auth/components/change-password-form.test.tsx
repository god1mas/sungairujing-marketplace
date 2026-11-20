import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const signOut = vi.hoisted(() => vi.fn());
vi.mock("next-auth/react", () => ({ signOut }));

import { PasswordChangeSessionInvalidator } from "./change-password-form";

describe("PasswordChangeSessionInvalidator", () => {
  it("ends the current Auth.js session after a password change", async () => {
    render(<PasswordChangeSessionInvalidator success />);

    await waitFor(() =>
      expect(signOut).toHaveBeenCalledWith({
        callbackUrl: "/login?passwordChanged=1",
      }),
    );
  });

  it("returns an admin to the dedicated login after password rotation", async () => {
    render(
      <PasswordChangeSessionInvalidator success callbackUrl="/admin/login" />,
    );
    await waitFor(() =>
      expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/admin/login" }),
    );
  });
});
