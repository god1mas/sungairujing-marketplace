import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  product: { findFirst: vi.fn() },
}));

vi.mock("@/lib/db/prisma", () => ({ prisma: database }));

import { findPublicProductBySlug } from "./public-product-detail-repository";

describe("findPublicProductBySlug", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    database.product.findFirst.mockResolvedValue(null);
  });

  it("enforces catalog-equivalent eligibility on direct detail lookup", async () => {
    await findPublicProductBySlug("kerupuk-ikan");

    expect(database.product.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              moderationStatus: "ACTIVE",
              merchant: { status: "ACTIVE" },
            },
            { slug: "kerupuk-ikan" },
          ],
        },
      }),
    );
  });

  it("orders the cover first and limits the public gallery", async () => {
    await findPublicProductBySlug("kerupuk-ikan");

    const selection = database.product.findFirst.mock.calls[0][0].select;
    expect(selection.images).toEqual(
      expect.objectContaining({
        orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }, { id: "asc" }],
        take: 5,
      }),
    );
    expect(selection).not.toHaveProperty("suspensionReason");
    expect(selection.merchant.select).not.toHaveProperty("verificationStatus");
  });
});
