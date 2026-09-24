import { z } from "zod";
import { normalizeWhatsAppNumber } from "@/lib/auth/whatsapp";

const required = (message: string) => z.string().trim().min(1, message);

export const checkoutBuyerSchema = z
  .object({
    name: required("Nama wajib diisi.").max(100),
    whatsappNumber: required("Nomor WhatsApp wajib diisi.").transform(
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
    fulfillmentMethod: z.enum(["AMBIL_SENDIRI", "DIANTAR"]),
    address: z.string().trim().max(500).optional().default(""),
    note: z.string().trim().max(500).optional().default(""),
  })
  .superRefine((data, context) => {
    if (data.fulfillmentMethod === "DIANTAR" && !data.address) {
      context.addIssue({
        code: "custom",
        path: ["address"],
        message: "Alamat wajib diisi untuk pengantaran.",
      });
    }
  });

export type CheckoutBuyerInput = z.input<typeof checkoutBuyerSchema>;
export type ValidatedCheckoutBuyer = z.output<typeof checkoutBuyerSchema>;
