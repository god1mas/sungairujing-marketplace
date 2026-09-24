import { describe, expect, it } from "vitest";
import { merchantRegistrationSchema } from "./merchant-registration";

const validInput = {
  ownerName: "Siti Aminah",
  merchantName: "Dapur Siti",
  whatsappNumber: "0812 3456-7890",
  password: "rahasia8",
  merchantAddress: "Desa Sungairujing",
  termsAccepted: true as const,
};

describe("merchantRegistrationSchema", () => {
  it("validates required registration data and canonicalizes WhatsApp", () => {
    const result = merchantRegistrationSchema.parse(validInput);

    expect(result.whatsappNumber).toBe("6281234567890");
    expect(result.ownerName).toBe("Siti Aminah");
  });

  it.each([
    [{ ...validInput, ownerName: "" }, "ownerName"],
    [{ ...validInput, password: "pendek" }, "password"],
    [{ ...validInput, whatsappNumber: "123" }, "whatsappNumber"],
    [{ ...validInput, termsAccepted: false }, "termsAccepted"],
  ])("rejects invalid input for %s", (input, field) => {
    const result = merchantRegistrationSchema.safeParse(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toHaveProperty(field);
    }
  });
});
