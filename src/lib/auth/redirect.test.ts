import { describe, expect, it } from "vitest";
import { getPostLoginPath } from "./redirect";

describe("getPostLoginPath", () => {
  it("uses fixed internal destinations derived from the database role", () => {
    expect(getPostLoginPath("USER")).toBe("/dashboard");
    expect(getPostLoginPath("SUPER_ADMIN")).toBe("/admin");
  });
});
