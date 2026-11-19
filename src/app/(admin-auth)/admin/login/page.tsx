import type { Metadata } from "next";
import { BrandLogo } from "@/components/branding/brand-logo";
import { AdminLoginForm } from "@/features/auth/components/admin-login-form";

export const metadata: Metadata = {
  title: "Login Super Admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center px-4 py-10 sm:px-6">
      <section
        aria-labelledby="admin-login-title"
        className="mx-auto w-full max-w-md rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:p-8"
      >
        <BrandLogo className="mx-auto h-24 w-auto" preload sizes="129px" />
        <h1
          id="admin-login-title"
          className="mt-5 text-3xl font-bold tracking-tight text-neutral-900"
        >
          Login Super Admin
        </h1>
        <p className="mt-3 text-neutral-600">
          Masuk menggunakan username dan password admin.
        </p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
