import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireMerchantAdmin: vi.fn(),
  requireSuperAdmin: vi.fn(),
  redirect: vi.fn((destination: string) => {
    throw new Error(`redirect:${destination}`);
  }),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("./authorization", async (importOriginal) => {
  const original = await importOriginal<typeof import("./authorization")>();
  return {
    ...original,
    requireMerchantAdmin: mocks.requireMerchantAdmin,
    requireSuperAdmin: mocks.requireSuperAdmin,
  };
});

import { ForbiddenError, UnauthenticatedError } from "./authorization";
import { guardAdminArea, guardMerchantDashboard } from "./route-guard";

describe("protected route guards", () => {
  beforeEach(() => vi.clearAllMocks());

  it("redirects unauthenticated merchant and admin requests to login", async () => {
    mocks.requireMerchantAdmin.mockRejectedValue(new UnauthenticatedError());
    mocks.requireSuperAdmin.mockRejectedValue(new UnauthenticatedError());

    await expect(guardMerchantDashboard()).rejects.toThrow("redirect:/login");
    await expect(guardAdminArea()).rejects.toThrow("redirect:/login");
  });

  it("denies a normal merchant from the Super Admin area", async () => {
    mocks.requireSuperAdmin.mockRejectedValue(new ForbiddenError());

    await expect(guardAdminArea()).rejects.toThrow("redirect:/dashboard");
    expect(mocks.redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("allows valid merchant and Super Admin authorization", async () => {
    mocks.requireMerchantAdmin.mockResolvedValue({ merchantId: "merchant-a" });
    mocks.requireSuperAdmin.mockResolvedValue({ id: "admin-id" });

    await expect(guardMerchantDashboard()).resolves.toMatchObject({
      merchantId: "merchant-a",
    });
    await expect(guardAdminArea()).resolves.toMatchObject({ id: "admin-id" });
  });
});
