import { z } from "zod";
import { normalizeWhatsAppNumber } from "@/lib/auth/whatsapp";

export const loginSchema = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .min(1, "Nomor WhatsApp wajib diisi.")
    .transform((value, context) => {
      try {
        return normalizeWhatsAppNumber(value);
      } catch {
        context.addIssue({
          code: "custom",
          message: "Nomor WhatsApp atau password tidak sesuai.",
        });
        return z.NEVER;
      }
    }),
  password: z.string().min(1, "Password wajib diisi."),
});

export type LoginInput = z.input<typeof loginSchema>;
