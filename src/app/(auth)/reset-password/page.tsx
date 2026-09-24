import type { Metadata } from "next";
import Link from "next/link";
import { PASSWORD_RECOVERY_UNAVAILABLE_MESSAGE } from "@/services/password-recovery-contract";

export const metadata: Metadata = { title: "Reset Password" };

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center px-4 py-10 sm:px-6">
      <section className="mx-auto w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-brand-700">Keamanan akun</p>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">
          Reset password
        </h1>
        <p className="mt-3 text-neutral-600">
          {PASSWORD_RECOVERY_UNAVAILABLE_MESSAGE} Tidak ada token atau pesan
          pemulihan yang dibuat saat fitur belum aktif.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex min-h-11 items-center font-semibold text-brand-700 underline-offset-4 hover:underline"
        >
          Kembali ke login
        </Link>
      </section>
    </main>
  );
}
