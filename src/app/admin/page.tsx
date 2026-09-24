import Link from "next/link";
import { LogoutButton } from "@/features/auth/components/logout-button";

export default function AdminPage() {
  return (
    <main className="flex min-h-screen items-center px-4 py-10 sm:px-6">
      <section className="mx-auto w-full max-w-xl rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-brand-700">
          Area administrasi
        </p>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">
          Super Admin
        </h1>
        <p className="mt-3 text-neutral-600">
          Kelola pengajuan verifikasi merchant tanpa memengaruhi hak merchant
          untuk berjualan.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/verifications"
            className="min-h-11 rounded-md bg-brand-700 px-4 py-2 font-semibold text-white"
          >
            Verifikasi merchant
          </Link>
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}
