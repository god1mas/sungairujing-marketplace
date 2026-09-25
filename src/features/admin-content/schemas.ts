import { z } from "zod";
const optional = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() ? v.trim() : undefined),
    z.string().max(max).optional(),
  );
export const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: optional(500),
  sortOrder: z.coerce.number().int().min(0).max(999).optional(),
});
export const merchantAdminSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: optional(1000),
  address: z.string().trim().min(3).max(1000),
  whatsapp: z.string().trim(),
  operationalStatus: z.enum(["BUKA", "TUTUP", "LIBUR_SEMENTARA"]),
});
const safeUrl = z
  .string()
  .trim()
  .refine(
    (v) =>
      v.startsWith("/") ||
      (() => {
        try {
          return new URL(v).protocol === "https:";
        } catch {
          return false;
        }
      })(),
    "Gunakan path internal atau URL HTTPS.",
  );
export const bannerSchema = z
  .object({
    title: z.string().trim().min(2).max(120),
    description: optional(500),
    ctaText: optional(50),
    targetUrl: z.preprocess(
      (v) => (typeof v === "string" && v.trim() ? v.trim() : undefined),
      safeUrl.optional(),
    ),
    startAt: z.coerce.date().optional(),
    endAt: z.coerce.date().optional(),
    isActive: z.boolean(),
  })
  .refine((v) => !v.startAt || !v.endAt || v.startAt < v.endAt, {
    path: ["endAt"],
    message: "Waktu selesai harus setelah waktu mulai.",
  });
export const featuredSchema = z.object({
  merchantId: z.uuid(),
  sortOrder: z.coerce.number().int().min(1).max(5),
});
