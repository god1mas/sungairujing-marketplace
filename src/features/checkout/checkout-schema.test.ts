import { describe, expect, it } from "vitest";
import { checkoutBuyerSchema } from "./checkout-schema";

describe("checkoutBuyerSchema", () => {
  it("requires an address for DIANTAR", () => {
    const result = checkoutBuyerSchema.safeParse({
      name: "Dimas",
      whatsappNumber: "081234567890",
      fulfillmentMethod: "DIANTAR",
      address: "",
    });
    expect(result.success).toBe(false);
  });

  it("allows AMBIL_SENDIRI without address and normalizes WhatsApp", () => {
    expect(
      checkoutBuyerSchema.parse({
        name: "Dimas",
        whatsappNumber: "0812-3456-7890",
        fulfillmentMethod: "AMBIL_SENDIRI",
      }),
    ).toEqual({
      name: "Dimas",
      whatsappNumber: "6281234567890",
      fulfillmentMethod: "AMBIL_SENDIRI",
      address: "",
      note: "",
    });
  });
});
