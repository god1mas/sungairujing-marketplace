import { describe, expect, it } from "vitest";
import { adminLoginSchema } from "./admin-login";

describe("adminLoginSchema", () => {
  it("normalizes a valid username", () => {
    expect(
      adminLoginSchema.parse({
        username: " ADMIN_SUNGAIRUJING ",
        password: "password-benar",
      }).username,
    ).toBe("admin_sungairujing");
  });

  it.each(["bad username", "a", "admin@email", "a".repeat(33)])(
    "rejects invalid username %s",
    (username) => {
      expect(
        adminLoginSchema.safeParse({ username, password: "password" }).success,
      ).toBe(false);
    },
  );
});
