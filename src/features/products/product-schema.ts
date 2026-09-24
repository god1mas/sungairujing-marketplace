import { ProductAvailability } from "@prisma/client";
import { z } from "zod";

const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} wajib diisi.`).max(max);

const priceSchema = z
  .string()
  .trim()
  .regex(
    /^\d+(?:[.,]\d{1,2})?$/,
    "Harga harus berupa angka dengan maksimal 2 desimal.",
  )
  .transform((value) => value.replace(",", "."))
  .refine(
    (value) => Number(value) <= 999_999_999_999.99,
    "Harga terlalu besar.",
  );

export const productInputSchema = z.object({
  name: requiredText("Nama produk", 120),
  description: requiredText("Deskripsi", 3000),
  price: priceSchema,
  categoryId: z.uuid("Kategori tidak valid."),
  unit: requiredText("Satuan", 50),
  availabilityStatus: z.enum(ProductAvailability, {
    error: "Status ketersediaan tidak valid.",
  }),
});

export const productIdSchema = z.uuid("Produk tidak valid.");

export type ProductInput = z.output<typeof productInputSchema>;
