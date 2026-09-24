"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { getSession, signIn } from "next-auth/react";
import { getPostLoginPath } from "@/lib/auth/redirect";

const GENERIC_LOGIN_ERROR = "Nomor WhatsApp atau password tidak sesuai.";

export const LoginForm = ({
  registered = false,
  passwordChanged = false,
}: {
  registered?: boolean;
  passwordChanged?: boolean;
}) => {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          whatsappNumber: String(formData.get("whatsappNumber") ?? ""),
          password: String(formData.get("password") ?? ""),
          redirect: false,
        });

        if (!result?.ok) {
          setError(GENERIC_LOGIN_ERROR);
          return;
        }

        const session = await getSession();
        if (!session?.user.globalRole) {
          setError("Sesi tidak dapat dibuat. Silakan coba lagi.");
          return;
        }

        window.location.assign(getPostLoginPath(session.user.globalRole));
      } catch {
        setError("Login belum berhasil. Silakan coba lagi.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {registered ? (
        <div
          role="status"
          className="rounded-md border border-success-border bg-success-bg px-4 py-3 text-sm text-success-text"
        >
          Registrasi berhasil. Silakan login dengan akun Anda.
        </div>
      ) : null}

      {passwordChanged ? (
        <div
          role="status"
          className="rounded-md border border-success-border bg-success-bg px-4 py-3 text-sm text-success-text"
        >
          Password berhasil diperbarui. Silakan login kembali.
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-md border border-error-border bg-error-bg px-4 py-3 text-sm text-error-text"
        >
          {error}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="whatsappNumber"
          className="font-medium text-neutral-800"
        >
          Nomor WhatsApp
        </label>
        <input
          id="whatsappNumber"
          name="whatsappNumber"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Contoh: 0812 3456 7890"
          required
          disabled={isPending}
          className="mt-2 min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder:text-neutral-400"
        />
      </div>

      <div>
        <label htmlFor="password" className="font-medium text-neutral-800">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isPending}
          className="mt-2 min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="min-h-11 w-full rounded-md bg-brand-700 px-4 py-3 font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Memproses..." : "Login"}
      </button>

      <p className="text-center text-sm text-neutral-600">
        <Link
          href="/forgot-password"
          className="font-medium text-brand-700 underline-offset-4 hover:underline"
        >
          Lupa password?
        </Link>
      </p>
    </form>
  );
};
