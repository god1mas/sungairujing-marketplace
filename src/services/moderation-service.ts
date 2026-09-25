import "server-only";
import { ReportStatus } from "@prisma/client";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth/authorization";
import {
  findReportDetail,
  listReports,
} from "@/repositories/report-repository";
import {
  listModerationHistory,
  reactivateMerchant,
  suspendMerchant,
  suspendProduct,
  transitionReport,
} from "@/repositories/moderation-repository";

export class ModerationConflictError extends Error {}
export class ModerationNotFoundError extends Error {}
const uuid = z.uuid();
const reason = z.string().trim().min(5).max(1500);

export const getReportsForAdmin = async () => {
  await requireSuperAdmin();
  return listReports();
};
export const getReportForAdmin = async (id: string) => {
  await requireSuperAdmin();
  if (!uuid.safeParse(id).success) throw new ModerationNotFoundError();
  const report = await findReportDetail(id);
  if (!report) throw new ModerationNotFoundError();
  const history = await listModerationHistory({
    ...(report.reportedProductId
      ? { productId: report.reportedProductId }
      : {}),
    ...(report.reportedMerchantId
      ? { merchantId: report.reportedMerchantId }
      : {}),
  });
  return { report, history };
};
export const changeReportStatus = async (input: {
  reportId: string;
  status: ReportStatus;
  resolutionNote?: string;
}) => {
  const actor = await requireSuperAdmin();
  const parsed = z
    .object({
      reportId: uuid,
      status: z.enum(ReportStatus),
      resolutionNote: z.string().trim().max(1500).optional(),
    })
    .parse(input);
  const result = await transitionReport({ ...parsed, actorUserId: actor.id });
  if (!result) throw new ModerationConflictError();
  return result;
};
export const moderateTarget = async (input: {
  action: "SUSPEND_PRODUCT" | "SUSPEND_MERCHANT" | "REACTIVATE_MERCHANT";
  targetId: string;
  reason: string;
}) => {
  const actor = await requireSuperAdmin();
  const parsed = z
    .object({
      action: z.enum([
        "SUSPEND_PRODUCT",
        "SUSPEND_MERCHANT",
        "REACTIVATE_MERCHANT",
      ]),
      targetId: uuid,
      reason,
    })
    .parse(input);
  const fn =
    parsed.action === "SUSPEND_PRODUCT"
      ? suspendProduct
      : parsed.action === "SUSPEND_MERCHANT"
        ? suspendMerchant
        : reactivateMerchant;
  const result = await fn({
    ...(parsed.action === "SUSPEND_PRODUCT"
      ? { productId: parsed.targetId }
      : { merchantId: parsed.targetId }),
    actorUserId: actor.id,
    reason: parsed.reason,
  } as never);
  if (!result) throw new ModerationConflictError();
  return result;
};
