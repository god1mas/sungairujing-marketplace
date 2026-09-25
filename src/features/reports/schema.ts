import { ReportReason, ReportTargetType } from "@prisma/client";
import { z } from "zod";

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() ? value.trim() : undefined,
    z.string().max(maximum).optional(),
  );

export const publicReportSchema = z
  .object({
    targetType: z.enum(ReportTargetType),
    targetSlug: z.string().trim().min(1).max(160),
    reason: z.enum(ReportReason),
    details: optionalText(1500),
    reporterName: optionalText(100),
    reporterWhatsapp: optionalText(30),
    website: optionalText(100),
  })
  .superRefine((value, context) => {
    if (value.reason === ReportReason.OTHER && !value.details) {
      context.addIssue({
        code: "custom",
        path: ["details"],
        message: "Jelaskan alasan laporan ketika memilih Lainnya.",
      });
    }
  });

export type PublicReportInput = z.infer<typeof publicReportSchema>;
