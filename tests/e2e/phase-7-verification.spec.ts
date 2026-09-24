import { expect, test } from "@playwright/test";

test("anonymous visitors cannot access merchant verification", async ({
  page,
}) => {
  await page.goto("/dashboard/verification");
  await expect(page).toHaveURL(/\/login/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Login" }),
  ).toBeVisible();
});

test("anonymous visitors cannot access the admin verification queue", async ({
  page,
}) => {
  await page.goto("/admin/verifications");
  await expect(page).toHaveURL(/\/login/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Login" }),
  ).toBeVisible();
});
