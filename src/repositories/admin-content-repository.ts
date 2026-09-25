import { MerchantStatus, ModerationActionType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
export const getAdminOverview = () =>
  prisma.$transaction([
    prisma.merchant.count(),
    prisma.merchant.count({ where: { status: "ACTIVE" } }),
    prisma.merchant.count({ where: { status: "SUSPENDED" } }),
    prisma.product.count(),
    prisma.product.count({ where: { moderationStatus: "SUSPENDED" } }),
    prisma.category.count(),
  ]);
export const listAdminMerchants = () =>
  prisma.merchant.findMany({
    orderBy: { name: "asc" },
    include: {
      memberships: {
        where: { isActive: true },
        select: {
          userId: true,
          user: { select: { name: true, whatsappNumber: true } },
        },
      },
      _count: { select: { products: true } },
    },
  });
export const findAdminMerchant = (id: string) =>
  prisma.merchant.findUnique({
    where: { id },
    include: {
      memberships: {
        where: { isActive: true },
        include: {
          user: { select: { id: true, name: true, whatsappNumber: true } },
        },
      },
      _count: { select: { products: true, reports: true } },
    },
  });
export const updateAdminMerchant = (input: {
  id: string;
  name: string;
  description?: string;
  address: string;
  whatsapp: string;
  operationalStatus: "BUKA" | "TUTUP" | "LIBUR_SEMENTARA";
}) =>
  prisma.$transaction(async (tx) => {
    const merchant = await tx.merchant.findUnique({
      where: { id: input.id },
      select: {
        memberships: { where: { isActive: true }, select: { userId: true } },
      },
    });
    if (!merchant) return null;
    const userIds = merchant.memberships.map((m) => m.userId);
    const duplicate = await tx.user.findFirst({
      where: { whatsappNumber: input.whatsapp, id: { notIn: userIds } },
      select: { id: true },
    });
    if (duplicate) return "DUPLICATE" as const;
    await tx.merchant.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
        address: input.address,
        publicWhatsappNumber: input.whatsapp,
        operationalStatus: input.operationalStatus,
      },
    });
    if (userIds.length)
      await tx.user.updateMany({
        where: { id: { in: userIds } },
        data: { whatsappNumber: input.whatsapp },
      });
    return "UPDATED" as const;
  });
export const permanentlyDeleteMerchant = (input: {
  id: string;
  actorUserId: string;
}) =>
  prisma.$transaction(
    async (tx) => {
      const merchant = await tx.merchant.findUnique({
        where: { id: input.id },
        select: {
          name: true,
          logoStorageKey: true,
          memberships: { select: { userId: true } },
          products: { select: { images: { select: { storageKey: true } } } },
        },
      });
      if (!merchant) return null;
      await tx.moderationAction.create({
        data: {
          actionType: ModerationActionType.MERCHANT_DELETED,
          actorUserId: input.actorUserId,
          targetNameSnapshot: merchant.name,
          reason: "Penghapusan permanen oleh Super Admin",
        },
      });
      await tx.merchant.delete({ where: { id: input.id } });
      const userIds = merchant.memberships.map((m) => m.userId);
      for (const userId of userIds) {
        const remaining = await tx.merchantMembership.count({
          where: { userId },
        });
        if (!remaining)
          await tx.user.update({
            where: { id: userId },
            data: { isActive: false },
          });
      }
      return {
        storageKeys: [
          merchant.logoStorageKey,
          ...merchant.products.flatMap((p) =>
            p.images.map((i) => i.storageKey),
          ),
        ].filter((v): v is string => Boolean(v)),
      };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
export const listCategories = () =>
  prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
export const saveCategory = (input: {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
}) =>
  input.id
    ? prisma.category.update({ where: { id: input.id }, data: input })
    : prisma.category.create({ data: input });
export const removeCategory = (id: string) =>
  prisma.$transaction(async (tx) => {
    const count = await tx.product.count({ where: { categoryId: id } });
    return count
      ? tx.category.update({ where: { id }, data: { isActive: false } })
      : tx.category.delete({ where: { id } });
  });
export const listBanners = () =>
  prisma.banner.findMany({ orderBy: { createdAt: "desc" } });
export const findBanner = (id: string) =>
  prisma.banner.findUnique({ where: { id } });
export const saveBanner = (input: {
  id: string;
  title: string;
  description?: string;
  imageStorageKey: string;
  ctaText?: string;
  targetUrl?: string;
  startAt?: Date;
  endAt?: Date;
  isActive: boolean;
  actorUserId: string;
}) =>
  prisma.banner.upsert({
    where: { id: input.id },
    create: { ...input, createdByUserId: input.actorUserId },
    update: input,
  });
export const deleteBanner = (id: string) =>
  prisma.banner.delete({ where: { id }, select: { imageStorageKey: true } });
export const listFeatured = () =>
  prisma.featuredMerchant.findMany({
    orderBy: { sortOrder: "asc" },
    include: { merchant: { select: { id: true, name: true, status: true } } },
  });
export const listFeaturedCandidates = () =>
  prisma.merchant.findMany({
    where: { status: MerchantStatus.ACTIVE },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
export const addFeatured = (input: {
  merchantId: string;
  sortOrder: number;
  actorUserId: string;
}) =>
  prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('featured-merchants'))`;
    const count = await tx.featuredMerchant.count();
    if (count >= 5) return null;
    return tx.featuredMerchant.create({
      data: { ...input, createdByUserId: input.actorUserId },
    });
  });
export const removeFeatured = (id: string) =>
  prisma.featuredMerchant.delete({ where: { id } });
export const findPublicContent = (now: Date) =>
  Promise.all([
    prisma.banner.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startAt: null }, { startAt: { lte: now } }] },
          { OR: [{ endAt: null }, { endAt: { gte: now } }] },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.featuredMerchant.findMany({
      where: { merchant: { status: MerchantStatus.ACTIVE } },
      orderBy: { sortOrder: "asc" },
      take: 5,
      include: { merchant: true },
    }),
  ]);
