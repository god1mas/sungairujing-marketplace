import { expect, test } from "@playwright/test";

test("anonymous visitor cannot access merchant product management", async ({
  page,
}) => {
  await page.goto("/dashboard/products");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Login" }),
  ).toBeVisible();
});
