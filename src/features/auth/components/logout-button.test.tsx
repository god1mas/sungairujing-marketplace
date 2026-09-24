import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const signOut = vi.hoisted(() => vi.fn());
vi.mock("next-auth/react", () => ({ signOut }));

import { LogoutButton } from "./logout-button";

describe("LogoutButton", () => {
  it("uses Auth.js signOut with a fixed local destination", () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });
});
