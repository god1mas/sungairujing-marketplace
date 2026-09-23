import { expect, test } from "@playwright/test";

test("homepage shows the Sungairujing Marketplace identity", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Sungairujing Marketplace",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Marketplace lokal UMKM Desa Sungairujing"),
  ).toBeVisible();
  await expect(page.getByText("Status development")).toBeVisible();
});
