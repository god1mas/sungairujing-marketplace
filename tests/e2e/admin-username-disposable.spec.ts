import { randomBytes } from "node:crypto";
import {
  PrismaClient,
  GlobalUserRole,
  MerchantMembershipRole,
  MerchantOperationalStatus,
  MerchantVerificationStatus,
} from "@prisma/client";
import { expect, test } from "@playwright/test";
import { hash } from "@node-rs/argon2";

const disposableUrl =
  "postgresql://postgres@127.0.0.1:55433/admin_auth_verify?schema=public";
const enabled = process.env.ADMIN_AUTH_TEST_DATABASE_URL === disposableUrl;

if (process.env.ADMIN_AUTH_TEST_DATABASE_URL && !enabled) {
  throw new Error(
    "E2E integrasi hanya boleh menggunakan PostgreSQL disposable.",
  );
}
if (
  enabled &&
  (process.env.DATABASE_URL !== disposableUrl ||
    process.env.DIRECT_URL !== disposableUrl)
) {
  throw new Error("Server E2E harus menggunakan database disposable.");
}

test.skip(!enabled, "Requires the explicit disposable PostgreSQL URL");

test("admin and merchant login stay separate with real database sessions", async ({
  page,
  browser,
}) => {
  const db = new PrismaClient({ datasources: { db: { url: disposableUrl } } });
  const suffix = randomBytes(6).toString("hex");
  const adminPassword = randomBytes(24).toString("base64url");
  const merchantPassword = randomBytes(24).toString("base64url");
  const admin = await db.user.create({
    data: {
      name: "Admin Browser Integrasi",
      whatsappNumber: `62831${BigInt(`0x${suffix}`).toString().slice(0, 11)}`,
      adminUsername: `admin_${suffix}`,
      passwordHash: await hash(adminPassword),
      globalRole: GlobalUserRole.SUPER_ADMIN,
    },
  });
  const merchantUser = await db.user.create({
    data: {
      name: "Merchant Browser Integrasi",
      whatsappNumber: `62832${BigInt(`0x${suffix}`).toString().slice(0, 11)}`,
      passwordHash: await hash(merchantPassword),
      globalRole: GlobalUserRole.USER,
    },
  });
  const merchant = await db.merchant.create({
    data: {
      name: "Merchant Browser Integrasi",
      slug: `browser-integration-${suffix}`,
      address: "Alamat pengujian disposable",
      publicWhatsappNumber: merchantUser.whatsappNumber,
      operationalStatus: MerchantOperationalStatus.BUKA,
      verificationStatus: MerchantVerificationStatus.BELUM_DIVERIFIKASI,
    },
  });
  await db.merchantMembership.create({
    data: {
      merchantId: merchant.id,
      userId: merchantUser.id,
      role: MerchantMembershipRole.OWNER,
    },
  });

  try {
    await page.goto("/admin/login");
    await page.getByLabel("Username").fill(`admin_${suffix}`);
    await page.getByLabel("Password").fill(adminPassword);
    await page.getByRole("button", { name: "Masuk sebagai Admin" }).click();
    await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: "Ringkasan marketplace" }),
    ).toBeVisible();

    const merchantContext = await browser.newContext();
    try {
      const merchantPage = await merchantContext.newPage();
      await merchantPage.goto("/login");
      await merchantPage
        .getByLabel("Nomor WhatsApp")
        .fill(merchantUser.whatsappNumber);
      await merchantPage.getByLabel("Password").fill(merchantPassword);
      await merchantPage.getByRole("button", { name: "Login" }).click();
      await expect(merchantPage).toHaveURL(/\/dashboard$/);
      await merchantPage.goto("/admin");
      await expect(merchantPage).toHaveURL(/\/dashboard$/);
    } finally {
      await merchantContext.close();
    }

    const oldAdminContext = await browser.newContext();
    try {
      const oldAdminPage = await oldAdminContext.newPage();
      await oldAdminPage.goto("/login");
      await oldAdminPage
        .getByLabel("Nomor WhatsApp")
        .fill(admin.whatsappNumber);
      await oldAdminPage.getByLabel("Password").fill(adminPassword);
      await oldAdminPage.getByRole("button", { name: "Login" }).click();
      await expect(oldAdminPage.locator("form [role='alert']")).toContainText(
        "Nomor WhatsApp atau password tidak sesuai.",
      );
      await expect(oldAdminPage).toHaveURL(/\/login$/);
    } finally {
      await oldAdminContext.close();
    }
  } finally {
    await db.$disconnect();
  }
});
