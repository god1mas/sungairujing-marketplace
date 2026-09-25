import { expect, test } from "@playwright/test";

test("anonymous visitor sees a non-accusatory product report form", async ({
  page,
}) => {
  await page.goto("/products");
  const product = page.locator('a[href^="/products/"]').first();
  if ((await product.count()) === 0) return;
  await product.click();
  await page.getByText("Laporkan produk").click();
  await expect(
    page.getByText(/tidak otomatis membekukan target/i),
  ).toBeVisible();
});

test("anonymous visitor cannot access the admin report queue", async ({
  page,
}) => {
  await page.goto("/admin/reports");
  await expect(page).toHaveURL(/\/login/);
});
