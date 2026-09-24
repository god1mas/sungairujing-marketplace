import { describe, expect, it } from "vitest";
import {
  buildCheckoutMessage,
  buildWhatsAppUrl,
} from "./build-checkout-message";

describe("checkout WhatsApp helpers", () => {
  it("builds the documented delivery message deterministically", () => {
    const message = buildCheckoutMessage({
      merchantName: "Dapur Bawean",
      items: [{ name: "Kerupuk Ikan", quantity: 2, subtotal: "30000.00" }],
      total: "30000.00",
      buyer: {
        name: "Dimas",
        whatsappNumber: "6281234567890",
        fulfillmentMethod: "DIANTAR",
        address: "Sungairujing",
        note: "Tanpa plastik",
      },
      referenceCode: "SRM-260924-A7K2",
    });

    expect(message).toContain("2x Kerupuk Ikan — Rp 30.000");
    expect(message).toContain("Total estimasi: Rp 30.000");
    expect(message).toContain("Metode: Diantar");
    expect(message).toContain("Alamat: Sungairujing");
    expect(message).toContain("Kode: SRM-260924-A7K2");
    expect(message).toContain("Mohon konfirmasi ketersediaan");
  });

  it("encodes message and rejects a non-canonical merchant number", () => {
    expect(buildWhatsAppUrl("6281234567890", "Halo & terima kasih")).toBe(
      "https://wa.me/6281234567890?text=Halo%20%26%20terima%20kasih",
    );
    expect(() => buildWhatsAppUrl("javascript:alert(1)", "Halo")).toThrow();
  });
});
