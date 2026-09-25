import { expect, test } from "@playwright/test";
for (const path of [
  "/admin/merchants",
  "/admin/categories",
  "/admin/banners",
  "/admin/featured-merchants",
])
  test(`anonymous visitor cannot access ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login/);
  });
