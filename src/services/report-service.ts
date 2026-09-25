import "server-only";
import { headers } from "next/headers";
import { normalizeWhatsAppNumber } from "@/lib/auth/whatsapp";
import {
  createPublicReportRateLimitKey,
  getPublicReportRateLimiter,
} from "@/lib/rate-limit/public-report";
import {
  createPublicReport,
  findReportTarget,
} from "@/repositories/report-repository";
import {
  publicReportSchema,
  type PublicReportInput,
} from "@/features/reports/schema";

export class ReportTargetNotFoundError extends Error {}
export class ReportRateLimitError extends Error {}

export const submitPublicReport = async (
  raw: unknown,
  overrides: {
    identify?: () => Promise<string>;
    consume?: (
      key: string,
    ) => Promise<{ allowed: boolean }> | { allowed: boolean };
    findTarget?: typeof findReportTarget;
    create?: typeof createPublicReport;
  } = {},
) => {
  const parsed = publicReportSchema.parse(raw);
  if (parsed.website) return { accepted: true };
  const identify =
    overrides.identify ??
    (async () =>
      (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown");
  const consume =
    overrides.consume ??
    ((key: string) => getPublicReportRateLimiter().consume(key));
  const limit = await consume(createPublicReportRateLimitKey(await identify()));
  if (!limit.allowed) throw new ReportRateLimitError();
  const target = await (overrides.findTarget ?? findReportTarget)(parsed);
  if (!target) throw new ReportTargetNotFoundError();
  const reporterWhatsapp = parsed.reporterWhatsapp
    ? normalizeWhatsAppNumber(parsed.reporterWhatsapp)
    : undefined;
  return (overrides.create ?? createPublicReport)(
    { ...parsed, reporterWhatsapp },
    target,
  );
};

export type { PublicReportInput };
