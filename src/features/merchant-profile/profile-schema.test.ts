import { describe, expect, it } from "vitest";
import { merchantProfileSchema } from "./profile-schema";

const hours = Object.fromEntries(
  ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"].map(
    (day) => [day, { closed: false, open: "08:00", close: "17:00" }],
  ),
);

describe("merchant profile schema", () => {
  it.each(["BUKA", "TUTUP", "LIBUR_SEMENTARA"])(
    "accepts operational status %s and structured hours",
    (operationalStatus) => {
      expect(
        merchantProfileSchema.safeParse({
          name: "Dapur Sungairujing",
          description: "Masakan lokal",
          address: "Desa Sungairujing",
          operationalStatus,
          openingHours: hours,
        }).success,
      ).toBe(true);
    },
  );

  it("rejects malformed or reversed opening hours", () => {
    expect(
      merchantProfileSchema.safeParse({
        name: "Dapur",
        description: "",
        address: "Desa",
        operationalStatus: "BUKA",
        openingHours: {
          ...hours,
          senin: { closed: false, open: "18:00", close: "08:00" },
        },
      }).success,
    ).toBe(false);
  });

  it("does not accept account or admin fields as editable output", () => {
    const result = merchantProfileSchema.parse({
      name: "Dapur",
      description: "",
      address: "Desa",
      operationalStatus: "TUTUP",
      openingHours: hours,
      whatsappNumber: "628000000000",
      status: "ACTIVE",
      verificationStatus: "TERVERIFIKASI",
    });
    expect(result).not.toHaveProperty("whatsappNumber");
    expect(result).not.toHaveProperty("status");
    expect(result).not.toHaveProperty("verificationStatus");
  });
});
