import { expect, test } from "@playwright/test";

test("anonymous visitor cannot access the merchant dashboard", async ({
  page,
}) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Login" }),
  ).toBeVisible();
});
