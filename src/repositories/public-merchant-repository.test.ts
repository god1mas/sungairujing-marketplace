import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  merchant: { findMany: vi.fn(), findFirst: vi.fn() },
}));

vi.mock("@/lib/db/prisma", () => ({ prisma: database }));

import {
  findPublicMerchantBySlug,
  findPublicMerchants,
} from "./public-merchant-repository";

describe("public merchant repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    database.merchant.findMany.mockResolvedValue([]);
    database.merchant.findFirst.mockResolvedValue(null);
  });

  it("lists only active merchants without requiring verification", async () => {
    await findPublicMerchants();

    const call = database.merchant.findMany.mock.calls[0][0];
    expect(call.where).toEqual({ status: "ACTIVE" });
    expect(call.select).not.toHaveProperty("memberships");
    expect(call.select).not.toHaveProperty("suspensionReason");
  });

  it("enforces active merchant eligibility on direct slug lookup", async () => {
    await findPublicMerchantBySlug("dapur-sungairujing");

    const call = database.merchant.findFirst.mock.calls[0][0];
    expect(call.where).toEqual({
      AND: [{ status: "ACTIVE" }, { slug: "dapur-sungairujing" }],
    });
    expect(call.select).not.toHaveProperty("memberships");
    expect(call.select).not.toHaveProperty("suspensionReason");
  });

  it("reuses public product eligibility for merchant products", async () => {
    await findPublicMerchantBySlug("dapur-sungairujing");

    const products =
      database.merchant.findFirst.mock.calls[0][0].select.products;
    expect(products.where).toEqual({
      moderationStatus: "ACTIVE",
      merchant: { status: "ACTIVE" },
    });
    expect(products.take).toBe(20);
  });
});
