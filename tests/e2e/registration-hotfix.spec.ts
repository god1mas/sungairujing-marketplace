import { expect, test } from "@playwright/test";

test("registration page loads and invokes its Server Action", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/register");
  await expect(
    page.getByRole("heading", { level: 1, name: "Daftar sebagai merchant" }),
  ).toBeVisible();

  await page.getByLabel("Nama lengkap pemilik").fill("Siti Aminah");
  await page.getByLabel("Nama merchant").fill("Dapur Siti");
  await page.getByLabel("Nomor WhatsApp").fill("bukan-nomor");
  await page.getByLabel("Password", { exact: true }).fill("rahasia8");
  await page.getByLabel("Alamat merchant").fill("Desa Sungairujing");
  await page
    .getByLabel(
      "Saya menyetujui syarat dan ketentuan Sungairujing Marketplace.",
    )
    .check();
  await page.getByRole("button", { name: "Daftar sebagai merchant" }).click();

  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Periksa kembali data registrasi." }),
  ).toBeVisible();
  await expect(page.getByText("Nomor WhatsApp tidak valid.")).toBeVisible();
  expect(pageErrors).not.toContainEqual(
    expect.stringContaining(
      'A "use server" file can only export async functions, found object.',
    ),
  );
});
