import { expect, test } from "@playwright/test";

test.describe("Phase 5 cart foundation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("shows an empty accountless cart safely", async ({ page }) => {
    await page.goto("/cart");

    await expect(
      page.getByRole("heading", { name: "Cart", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Cart masih kosong")).toBeVisible();
  });

  test("does not invent checkout data for an empty cart", async ({ page }) => {
    await page.goto("/checkout/merchant-tidak-ada");

    await expect(
      page.getByRole("heading", { name: "Checkout via WhatsApp" }),
    ).toBeVisible();
    await expect(
      page.getByText("Tidak ada produk untuk merchant ini di cart."),
    ).toBeVisible();
  });
});
