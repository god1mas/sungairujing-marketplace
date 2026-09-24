import { describe, expect, it } from "vitest";
import { formatRupiah } from "./currency";

describe("formatRupiah", () => {
  it("formats an IDR amount without fabricated decimals", () => {
    expect(formatRupiah("15000.00")).toMatch(/Rp\s?15\.000/);
  });
});
