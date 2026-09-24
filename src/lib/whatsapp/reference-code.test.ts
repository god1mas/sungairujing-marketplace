import { describe, expect, it } from "vitest";
import { generateReferenceCode } from "./reference-code";

describe("generateReferenceCode", () => {
  it("uses SRM-YYMMDD-XXXX format in the application timezone", () => {
    expect(
      generateReferenceCode(new Date("2026-09-24T01:00:00.000Z"), () => "A7K2"),
    ).toBe("SRM-260924-A7K2");
  });
});
