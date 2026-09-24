import { describe, expect, it } from "vitest";
import { loginSchema } from "./login";

describe("loginSchema", () => {
  it("accepts credentials and canonicalizes WhatsApp", () => {
    expect(
      loginSchema.parse({
        whatsappNumber: "+62 812-3456-7890",
        password: "rahasia",
      }),
    ).toEqual({
      whatsappNumber: "6281234567890",
      password: "rahasia",
    });
  });

  it.each([
    { whatsappNumber: "", password: "rahasia" },
    { whatsappNumber: "nomor-invalid", password: "rahasia" },
    { whatsappNumber: "081234567890", password: "" },
  ])("rejects malformed login input", (input) => {
    expect(loginSchema.safeParse(input).success).toBe(false);
  });
});
