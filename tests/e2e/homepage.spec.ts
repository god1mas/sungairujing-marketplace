import { expect, test } from "@playwright/test";

test("anonymous homepage exposes the public shell and search", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Temukan Produk Lokal Sungairujing",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Marketplace lokal UMKM Desa Sungairujing"),
  ).toBeVisible();
  await expect(
    page.getByRole("searchbox", { name: "Cari produk atau merchant" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Masuk" }).first(),
  ).toHaveAttribute("href", "/login");
});

test("public navigation remains usable at a small mobile width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Cari" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Keranjang" })).toBeVisible();
  await expect(page.getByText("Menu", { exact: true })).toBeVisible();
});

test("anonymous visitor can open the product catalog", async ({ page }) => {
  await page.goto("/products?q=kerupuk&sort=price_asc");

  await expect(
    page.getByRole("heading", { level: 1, name: "Katalog Produk" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/products\?q=kerupuk&sort=price_asc$/);
  await expect(
    page.getByRole("link", { name: "Masuk" }).first(),
  ).toHaveAttribute("href", "/login");
});

test("malformed public product slug returns a safe not-found response", async ({
  page,
}) => {
  await page.goto("/products/INVALID-SLUG");

  await expect(page.getByText("This page could not be found.")).toBeVisible();
});

test("anonymous visitor can open the public merchant listing", async ({
  page,
}) => {
  await page.goto("/merchants");

  await expect(
    page.getByRole("heading", { level: 1, name: "Semua Merchant" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Masuk" }).first(),
  ).toHaveAttribute("href", "/login");
});

test("malformed merchant slug returns a safe not-found response", async ({
  page,
}) => {
  await page.goto("/merchant/INVALID-SLUG");

  await expect(page.getByText("This page could not be found.")).toBeVisible();
});
