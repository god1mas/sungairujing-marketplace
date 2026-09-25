import { expect, test } from "@playwright/test";

test("serves the public site with the Phase 12 security headers", async ({
  request,
}) => {
  const response = await request.get("/");
  const headers = response.headers();

  expect(response.ok()).toBeTruthy();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
});

test("anonymous direct dashboard resource URL manipulation is rejected", async ({
  page,
}) => {
  await page.goto(
    "/dashboard/products/10000000-0000-4000-8000-000000000001/edit",
  );
  await expect(page).toHaveURL(/\/login$/);
});

test("anonymous direct admin resource URL manipulation is rejected", async ({
  page,
}) => {
  await page.goto("/admin/reports/10000000-0000-4000-8000-000000000001");
  await expect(page).toHaveURL(/\/login$/);
});

test("analytics mutation rejects a cross-origin request", async ({
  request,
}) => {
  const response = await request.post("/api/analytics/product-view", {
    headers: { origin: "https://evil.example" },
    data: { productId: "10000000-0000-4000-8000-000000000001" },
  });

  expect(response.status()).toBe(403);
});
