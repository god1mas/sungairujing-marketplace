import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";

export const metadata: Metadata = { title: "Keamanan Akun Admin" };

export default function AdminAccountPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Keamanan akun"
        title="Pengaturan akun"
        description="Kelola kredensial Super Admin yang sedang digunakan."
      />
      <section className="max-w-2xl rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <KeyRound aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              Ubah password
            </h2>
            <p className="mt-1 text-sm leading-6 text-neutral-600">
              Masukkan password lama untuk melindungi perubahan keamanan akun.
            </p>
          </div>
        </div>
        <div className="mt-6 border-t border-neutral-200 pt-1">
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  );
}
