import { expect, test } from "@playwright/test";

test("homepage exposes the truthful Produk Populer section", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Produk Populer" }),
  ).toBeVisible();
  await expect(page.getByText("Produk Terlaris")).toHaveCount(0);
});

test("anonymous visitors cannot access merchant analytics", async ({
  page,
}) => {
  await page.goto("/dashboard/analytics");
  await expect(page).toHaveURL(/\/login$/);
});

test("analytics failure does not surface from the public tracking boundary", async ({
  request,
}) => {
  const response = await request.post("/api/analytics/product-view", {
    data: { productId: "d7996028-4b45-4775-b0f3-cb4fa998f88d" },
  });
  expect(response.status()).toBe(204);
  expect(response.headers()["set-cookie"]).toContain("srm_visitor=");
});
