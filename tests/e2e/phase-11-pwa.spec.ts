import { expect, test } from "@playwright/test";

test("exposes a valid PWA manifest without requiring installation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    "href",
    "/manifest.webmanifest",
  );
  const response = await page.request.get("/manifest.webmanifest");
  expect(response.ok()).toBeTruthy();
  const manifest = await response.json();
  expect(manifest.name).toBe("Sungairujing Marketplace");
  expect(manifest.icons).toHaveLength(2);
});

test("keeps protected dashboard unavailable to anonymous visitors", async ({
  page,
}) => {
  await page.goto("/dashboard/notifications");
  await expect(page).toHaveURL(/\/login/);
});
