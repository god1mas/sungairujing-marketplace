import {
  MerchantStatus,
  ProductModerationStatus,
  ReportStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { PublicReportInput } from "@/features/reports/schema";

export const findReportTarget = (
  input: Pick<PublicReportInput, "targetType" | "targetSlug">,
) =>
  input.targetType === "PRODUCT"
    ? prisma.product.findFirst({
        where: {
          slug: input.targetSlug,
          moderationStatus: ProductModerationStatus.ACTIVE,
          merchant: { status: MerchantStatus.ACTIVE },
        },
        select: { id: true, name: true, merchantId: true },
      })
    : prisma.merchant.findFirst({
        where: { slug: input.targetSlug, status: MerchantStatus.ACTIVE },
        select: { id: true, name: true },
      });

export const createPublicReport = async (
  input: PublicReportInput,
  target: { id: string; name: string; merchantId?: string },
) =>
  prisma.report.create({
    data: {
      targetType: input.targetType,
      reportedProductId: input.targetType === "PRODUCT" ? target.id : null,
      reportedMerchantId:
        input.targetType === "MERCHANT" ? target.id : target.merchantId,
      targetNameSnapshot: target.name,
      reason: input.reason,
      details: input.details,
      reporterName: input.reporterName,
      reporterWhatsapp: input.reporterWhatsapp,
      status: ReportStatus.BARU,
    },
    select: { id: true, status: true },
  });

export const listReports = () =>
  prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      targetType: true,
      targetNameSnapshot: true,
      reason: true,
      status: true,
      createdAt: true,
    },
  });

export const findReportDetail = (id: string) =>
  prisma.report.findUnique({
    where: { id },
    include: {
      reportedProduct: {
        select: { id: true, name: true, moderationStatus: true },
      },
      reportedMerchant: { select: { id: true, name: true, status: true } },
    },
  });
