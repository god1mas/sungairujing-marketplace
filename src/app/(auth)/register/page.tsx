import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/branding/brand-logo";
import { BRAND_NAME } from "@/constants/branding";
import { RegistrationForm } from "@/features/auth/components/registration-form";

export const metadata: Metadata = {
  title: "Daftar Merchant",
  description: `Daftarkan UMKM Anda di ${BRAND_NAME}.`,
};

export default function RegisterPage() {
  return (
    <main className="px-4 py-10 sm:px-6 sm:py-14">
      <section
        aria-labelledby="registration-title"
        className="mx-auto max-w-2xl rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:p-8"
      >
        <BrandLogo className="mx-auto h-24 w-auto" preload sizes="129px" />
        <h1
          id="registration-title"
          className="mt-5 text-3xl font-bold tracking-tight text-neutral-900"
        >
          Daftar sebagai merchant
        </h1>
        <p className="mt-3 text-neutral-600">
          Buat akun pemilik dan profil awal merchant. Setelah berhasil, Anda
          akan diarahkan ke halaman login.
        </p>

        <RegistrationForm />

        <p className="mt-6 text-center text-sm text-neutral-600">
          Sudah memiliki akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-700 underline-offset-4 hover:underline"
          >
            Masuk
          </Link>
        </p>
      </section>
    </main>
  );
}
