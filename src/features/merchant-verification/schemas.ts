import { z } from "zod";

export const verificationReviewSchema = z.discriminatedUnion("decision", [
  z.object({
    decision: z.literal("APPROVE"),
    rejectionReason: z.string().optional(),
  }),
  z.object({
    decision: z.literal("REJECT"),
    rejectionReason: z
      .string()
      .trim()
      .min(5, "Alasan penolakan minimal 5 karakter.")
      .max(1000),
  }),
]);
