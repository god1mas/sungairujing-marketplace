import { z } from "zod";

export const openingHourDays = [
  ["senin", "Senin"],
  ["selasa", "Selasa"],
  ["rabu", "Rabu"],
  ["kamis", "Kamis"],
  ["jumat", "Jumat"],
  ["sabtu", "Sabtu"],
  ["minggu", "Minggu"],
] as const;

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Gunakan format waktu HH:mm.");

const openingHourSchema = z
  .object({
    closed: z.boolean(),
    open: timeSchema.optional(),
    close: timeSchema.optional(),
  })
  .superRefine((value, context) => {
    if (!value.closed && (!value.open || !value.close)) {
      context.addIssue({
        code: "custom",
        message: "Jam buka dan tutup wajib diisi.",
      });
    }
    if (
      !value.closed &&
      value.open &&
      value.close &&
      value.open >= value.close
    ) {
      context.addIssue({
        code: "custom",
        message: "Jam tutup harus setelah jam buka.",
      });
    }
  })
  .transform((value) =>
    value.closed
      ? { closed: true as const }
      : { closed: false as const, open: value.open!, close: value.close! },
  );

export const openingHoursSchema = z.object(
  Object.fromEntries(
    openingHourDays.map(([key]) => [key, openingHourSchema]),
  ) as Record<(typeof openingHourDays)[number][0], typeof openingHourSchema>,
);

export const merchantProfileSchema = z.object({
  name: z.string().trim().min(1, "Nama merchant wajib diisi.").max(100),
  description: z
    .string()
    .trim()
    .max(2000)
    .transform((value) => value || null),
  address: z.string().trim().min(1, "Alamat merchant wajib diisi.").max(1000),
  operationalStatus: z.enum(["BUKA", "TUTUP", "LIBUR_SEMENTARA"]),
  openingHours: openingHoursSchema,
});

export type MerchantProfileInput = z.output<typeof merchantProfileSchema>;
export type OpeningHours = z.output<typeof openingHoursSchema>;
