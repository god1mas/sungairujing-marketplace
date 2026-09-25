import { beforeEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({
  $transaction: vi.fn(),
  $executeRaw: vi.fn(),
  merchant: {
    count: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  moderationAction: { create: vi.fn() },
  merchantMembership: { count: vi.fn() },
  user: { update: vi.fn() },
  product: { count: vi.fn() },
  category: { count: vi.fn(), update: vi.fn(), delete: vi.fn() },
  featuredMerchant: { count: vi.fn(), create: vi.fn(), findMany: vi.fn() },
  banner: { findMany: vi.fn() },
}));
vi.mock("@/lib/db/prisma", () => ({ prisma: db }));
import {
  addFeatured,
  findPublicContent,
  permanentlyDeleteMerchant,
  removeCategory,
} from "./admin-content-repository";
describe("admin content repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.$transaction.mockImplementation((value) =>
      Array.isArray(value) ? Promise.all(value) : value(db),
    );
  });
  it("soft-disables referenced category and deletes unreferenced category", async () => {
    db.product.count.mockResolvedValueOnce(2).mockResolvedValueOnce(0);
    await removeCategory("category");
    expect(db.category.update).toHaveBeenCalledWith({
      where: { id: "category" },
      data: { isActive: false },
    });
    await removeCategory("category");
    expect(db.category.delete).toHaveBeenCalledWith({
      where: { id: "category" },
    });
  });
  it("locks and enforces maximum five featured merchants", async () => {
    db.featuredMerchant.count.mockResolvedValue(5);
    await expect(
      addFeatured({ merchantId: "m", sortOrder: 5, actorUserId: "a" }),
    ).resolves.toBeNull();
    expect(db.$executeRaw).toHaveBeenCalled();
    expect(db.featuredMerchant.create).not.toHaveBeenCalled();
  });
  it("filters public banners by active schedule and featured merchants by active status", async () => {
    db.banner.findMany.mockResolvedValue([]);
    db.featuredMerchant.findMany.mockResolvedValue([]);
    await findPublicContent(new Date("2026-09-25T00:00:00Z"));
    expect(db.banner.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
        take: 5,
      }),
    );
    expect(db.featuredMerchant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { merchant: { status: "ACTIVE" } },
        take: 5,
      }),
    );
  });

  it("records an audit snapshot and leaves report snapshots outside deletion", async () => {
    db.merchant.findUnique.mockResolvedValue({
      name: "Merchant Lama",
      logoStorageKey: "merchants/m/logo.webp",
      memberships: [],
      products: [{ images: [{ storageKey: "merchants/m/products/p/a.webp" }] }],
    });
    db.merchant.delete.mockResolvedValue({ id: "merchant" });
    await permanentlyDeleteMerchant({ id: "merchant", actorUserId: "admin" });
    expect(db.moderationAction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        targetNameSnapshot: "Merchant Lama",
        actionType: "MERCHANT_DELETED",
      }),
    });
    expect(db.merchant.delete).toHaveBeenCalledWith({
      where: { id: "merchant" },
    });
    expect(db).not.toHaveProperty("report.deleteMany");
  });
});
