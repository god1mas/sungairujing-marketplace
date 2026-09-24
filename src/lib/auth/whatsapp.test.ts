import { describe, expect, it } from "vitest";
import {
  InvalidWhatsAppNumberError,
  normalizeWhatsAppNumber,
} from "./whatsapp";

describe("normalizeWhatsAppNumber", () => {
  it.each([
    ["0812 3456-7890", "6281234567890"],
    ["+62 812-3456-7890", "6281234567890"],
    ["6281234567890", "6281234567890"],
    ["(0812) 3456.7890", "6281234567890"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeWhatsAppNumber(input)).toBe(expected);
  });

  it.each(["", "12345", "abc081234567890", "+081234567890"])(
    "rejects unsupported input %s",
    (input) => {
      expect(() => normalizeWhatsAppNumber(input)).toThrow(
        InvalidWhatsAppNumberError,
      );
    },
  );
});
