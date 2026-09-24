import { describe, expect, it } from "vitest";
import { productInputSchema } from "./product-schema";

const validInput = {
  name: "Kerupuk Ikan",
  description: "Kerupuk ikan khas Sungairujing.",
  price: "15000.50",
  categoryId: "10000000-0000-4000-8000-000000000001",
  unit: "bungkus",
  availabilityStatus: "TERSEDIA",
};

describe("productInputSchema", () => {
  it("accepts documented product fields without variants or inventory", () => {
    expect(productInputSchema.parse(validInput)).toEqual(validInput);
  });

  it("rejects invalid required fields, price, category, and availability", () => {
    const result = productInputSchema.safeParse({
      ...validInput,
      name: "",
      price: "12.345",
      categoryId: "category-a",
      availabilityStatus: "PENDING",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      expect(fields.name).toBeDefined();
      expect(fields.price).toBeDefined();
      expect(fields.categoryId).toBeDefined();
      expect(fields.availabilityStatus).toBeDefined();
    }
  });
});
