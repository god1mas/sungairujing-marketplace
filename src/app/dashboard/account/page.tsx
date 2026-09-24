import type { Metadata } from "next";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";

export const metadata: Metadata = { title: "Keamanan Akun" };

export default function AccountPage() {
  return (
    <main className="px-4 py-10 sm:px-6">
      <section className="mx-auto max-w-xl rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-sm font-semibold text-brand-700">Pengaturan akun</p>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">
          Ubah password
        </h1>
        <p className="mt-3 text-neutral-600">
          Masukkan password lama untuk melindungi perubahan keamanan akun.
        </p>
        <ChangePasswordForm />
      </section>
    </main>
  );
}
