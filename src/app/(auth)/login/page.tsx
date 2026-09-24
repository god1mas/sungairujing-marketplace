import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Login merchant dan Super Admin Sungairujing Marketplace.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; passwordChanged?: string }>;
}) {
  const { registered, passwordChanged } = await searchParams;

  return (
    <main className="flex min-h-screen items-center px-4 py-10 sm:px-6">
      <section
        aria-labelledby="login-title"
        className="mx-auto w-full max-w-md rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:p-8"
      >
        <p className="text-sm font-semibold text-brand-700">
          Sungairujing Marketplace
        </p>
        <h1
          id="login-title"
          className="mt-2 text-3xl font-bold tracking-tight text-neutral-900"
        >
          Login
        </h1>
        <p className="mt-3 text-neutral-600">
          Gunakan nomor WhatsApp dan password akun Anda.
        </p>

        <LoginForm
          registered={registered === "1"}
          passwordChanged={passwordChanged === "1"}
        />

        <p className="mt-6 text-center text-sm text-neutral-600">
          Belum memiliki akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand-700 underline-offset-4 hover:underline"
          >
            Daftar merchant
          </Link>
        </p>
      </section>
    </main>
  );
}
