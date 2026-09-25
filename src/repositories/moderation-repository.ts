import {
  MerchantStatus,
  ModerationActionType,
  NotificationType,
  Prisma,
  ProductModerationStatus,
  ReportStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export const transitionReport = (input: {
  reportId: string;
  actorUserId: string;
  status: ReportStatus;
  resolutionNote?: string;
}) =>
  prisma.$transaction(
    async (tx) => {
      const report = await tx.report.findUnique({
        where: { id: input.reportId },
        select: { status: true },
      });
      if (!report) return null;
      const allowed =
        (report.status === ReportStatus.BARU &&
          input.status === ReportStatus.DITINJAU) ||
        (report.status === ReportStatus.DITINJAU &&
          (input.status === ReportStatus.SELESAI ||
            input.status === ReportStatus.DITOLAK));
      if (!allowed) return null;
      const updated = await tx.report.updateMany({
        where: { id: input.reportId, status: report.status },
        data: {
          status: input.status,
          reviewedByUserId: input.actorUserId,
          reviewedAt: new Date(),
          resolutionNote: input.resolutionNote,
        },
      });
      return updated.count === 1 ? { status: input.status } : null;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

export const suspendProduct = (input: {
  productId: string;
  actorUserId: string;
  reason: string;
}) =>
  prisma.$transaction(
    async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: input.productId },
        select: {
          id: true,
          name: true,
          merchantId: true,
          moderationStatus: true,
          merchant: {
            select: {
              memberships: {
                where: { isActive: true },
                select: { userId: true },
              },
            },
          },
        },
      });
      if (
        !product ||
        product.moderationStatus !== ProductModerationStatus.ACTIVE
      )
        return null;
      const changed = await tx.product.updateMany({
        where: {
          id: product.id,
          moderationStatus: ProductModerationStatus.ACTIVE,
        },
        data: {
          moderationStatus: ProductModerationStatus.SUSPENDED,
          suspensionReason: input.reason,
          suspendedAt: new Date(),
          suspendedByUserId: input.actorUserId,
        },
      });
      if (changed.count !== 1) return null;
      await tx.moderationAction.create({
        data: {
          actionType: ModerationActionType.PRODUCT_SUSPENDED,
          actorUserId: input.actorUserId,
          merchantId: product.merchantId,
          productId: product.id,
          targetNameSnapshot: product.name,
          reason: input.reason,
        },
      });
      if (product.merchant.memberships.length)
        await tx.notification.createMany({
          data: product.merchant.memberships.map(({ userId }) => ({
            recipientUserId: userId,
            merchantId: product.merchantId,
            relatedProductId: product.id,
            type: NotificationType.PRODUCT_SUSPENDED,
            title: "Produk dibekukan",
            message: `Produk ${product.name} dibekukan: ${input.reason}`,
          })),
        });
      return { productId: product.id };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

export const suspendMerchant = (input: {
  merchantId: string;
  actorUserId: string;
  reason: string;
}) =>
  prisma.$transaction(
    async (tx) => {
      const merchant = await tx.merchant.findUnique({
        where: { id: input.merchantId },
        select: {
          id: true,
          name: true,
          status: true,
          memberships: { where: { isActive: true }, select: { userId: true } },
        },
      });
      if (!merchant || merchant.status !== MerchantStatus.ACTIVE) return null;
      const changed = await tx.merchant.updateMany({
        where: { id: merchant.id, status: MerchantStatus.ACTIVE },
        data: {
          status: MerchantStatus.SUSPENDED,
          suspensionReason: input.reason,
          suspendedAt: new Date(),
          suspendedByUserId: input.actorUserId,
        },
      });
      if (changed.count !== 1) return null;
      await tx.moderationAction.create({
        data: {
          actionType: ModerationActionType.MERCHANT_SUSPENDED,
          actorUserId: input.actorUserId,
          merchantId: merchant.id,
          targetNameSnapshot: merchant.name,
          reason: input.reason,
        },
      });
      if (merchant.memberships.length)
        await tx.notification.createMany({
          data: merchant.memberships.map(({ userId }) => ({
            recipientUserId: userId,
            merchantId: merchant.id,
            type: NotificationType.MERCHANT_SUSPENDED,
            title: "Merchant dibekukan",
            message: `Merchant ${merchant.name} dibekukan: ${input.reason}`,
          })),
        });
      return { merchantId: merchant.id };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

export const reactivateMerchant = (input: {
  merchantId: string;
  actorUserId: string;
  reason: string;
}) =>
  prisma.$transaction(
    async (tx) => {
      const merchant = await tx.merchant.findUnique({
        where: { id: input.merchantId },
        select: {
          id: true,
          name: true,
          status: true,
          memberships: { where: { isActive: true }, select: { userId: true } },
        },
      });
      if (!merchant || merchant.status !== MerchantStatus.SUSPENDED)
        return null;
      const changed = await tx.merchant.updateMany({
        where: { id: merchant.id, status: MerchantStatus.SUSPENDED },
        data: {
          status: MerchantStatus.ACTIVE,
          suspensionReason: null,
          suspendedAt: null,
          suspendedByUserId: null,
        },
      });
      if (changed.count !== 1) return null;
      await tx.moderationAction.create({
        data: {
          actionType: ModerationActionType.MERCHANT_REACTIVATED,
          actorUserId: input.actorUserId,
          merchantId: merchant.id,
          targetNameSnapshot: merchant.name,
          reason: input.reason,
        },
      });
      if (merchant.memberships.length)
        await tx.notification.createMany({
          data: merchant.memberships.map(({ userId }) => ({
            recipientUserId: userId,
            merchantId: merchant.id,
            type: NotificationType.MERCHANT_REACTIVATED,
            title: "Merchant diaktifkan kembali",
            message: `Merchant ${merchant.name} telah diaktifkan kembali.`,
          })),
        });
      return { merchantId: merchant.id };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

export const listModerationHistory = (input: {
  productId?: string;
  merchantId?: string;
}) =>
  prisma.moderationAction.findMany({
    where: input,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      actionType: true,
      targetNameSnapshot: true,
      reason: true,
      createdAt: true,
    },
  });
