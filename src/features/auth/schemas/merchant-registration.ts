import { z } from "zod";
import { normalizeWhatsAppNumber } from "@/lib/auth/whatsapp";

const requiredText = (message: string) => z.string().trim().min(1, message);

export const merchantRegistrationSchema = z.object({
  ownerName: requiredText("Nama pemilik wajib diisi."),
  merchantName: requiredText("Nama merchant wajib diisi.").max(
    100,
    "Nama merchant maksimal 100 karakter.",
  ),
  whatsappNumber: requiredText("Nomor WhatsApp wajib diisi.").transform(
    (value, context) => {
      try {
        return normalizeWhatsAppNumber(value);
      } catch {
        context.addIssue({
          code: "custom",
          message: "Nomor WhatsApp tidak valid.",
        });
        return z.NEVER;
      }
    },
  ),
  password: z.string().min(8, "Password minimal 8 karakter."),
  merchantAddress: requiredText("Alamat merchant wajib diisi."),
  termsAccepted: z.literal(true, {
    error: "Syarat dan ketentuan wajib disetujui.",
  }),
});

export type MerchantRegistrationInput = {
  ownerName: string;
  merchantName: string;
  whatsappNumber: string;
  password: string;
  merchantAddress: string;
  termsAccepted: boolean;
};

export type ValidatedMerchantRegistrationInput = z.output<
  typeof merchantRegistrationSchema
>;
