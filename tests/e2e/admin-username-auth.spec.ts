import { expect, test } from "@playwright/test";

test("admin login is public, separate from merchant login, and not indexed", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await expect(
    page.getByRole("heading", { level: 1, name: "Login Super Admin" }),
  ).toBeVisible();
  await expect(page.getByLabel("Username")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  await expect(page.getByRole("link", { name: "Daftar merchant" })).toHaveCount(
    0,
  );
});

test("anonymous admin entry redirects to admin login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("merchant login and public entry remain WhatsApp-only", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Masuk" }).first(),
  ).toHaveAttribute("href", "/login");
  await page.goto("/login");
  await expect(page.getByLabel("Nomor WhatsApp")).toBeVisible();
  await expect(page.getByLabel("Username")).toHaveCount(0);
});
