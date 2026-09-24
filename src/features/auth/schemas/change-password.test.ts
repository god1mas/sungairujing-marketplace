import { describe, expect, it } from "vitest";
import { changePasswordSchema } from "./change-password";

describe("changePasswordSchema", () => {
  it("accepts the documented password-change fields", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "password-lama",
        newPassword: "password-baru",
      }).success,
    ).toBe(true);
  });

  it.each([
    { currentPassword: "", newPassword: "password-baru" },
    { currentPassword: "password-lama", newPassword: "pendek" },
  ])("rejects invalid password data", (input) => {
    expect(changePasswordSchema.safeParse(input).success).toBe(false);
  });
});
