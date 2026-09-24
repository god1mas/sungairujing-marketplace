import { expect, test } from "@playwright/test";

test("anonymous visitor cannot access merchant profile management", async ({
  page,
}) => {
  await page.goto("/dashboard/profile");
  await expect(page).toHaveURL(/\/login$/);
});

test("anonymous visitor cannot access merchant account settings", async ({
  page,
}) => {
  await page.goto("/dashboard/account");
  await expect(page).toHaveURL(/\/login$/);
});
