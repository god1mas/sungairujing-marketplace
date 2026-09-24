import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getMerchantDashboardAccess } from "./merchant-dashboard-access-service";

describe("merchant dashboard access service", () => {
  it.each([
    ["ACTIVE", false],
    ["SUSPENDED", true],
  ] as const)("maps %s to readOnly=%s", async (status, readOnly) => {
    await expect(
      getMerchantDashboardAccess({
        authorize: vi.fn().mockResolvedValue({ merchant: { status } }),
      }),
    ).resolves.toEqual({ readOnly });
  });
});
