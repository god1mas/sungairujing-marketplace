"use client";

import { useState, useTransition, type FormEvent } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const GENERIC_ADMIN_LOGIN_ERROR = "Username atau password tidak sesuai.";

export const AdminLoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = await signIn("admin-credentials", {
          username: String(formData.get("username") ?? ""),
          password: String(formData.get("password") ?? ""),
          redirect: false,
        });

        if (!result?.ok) {
          setError(GENERIC_ADMIN_LOGIN_ERROR);
          return;
        }

        const session = await getSession();
        if (session?.user.globalRole !== "SUPER_ADMIN") {
          setError("Sesi tidak dapat dibuat. Silakan coba lagi.");
          return;
        }

        router.replace("/admin");
      } catch {
        setError("Login belum berhasil. Silakan coba lagi.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {error ? (
        <div
          role="alert"
          className="rounded-md border border-error-border bg-error-bg px-4 py-3 text-sm text-error-text"
        >
          {error}
        </div>
      ) : null}
      <div>
        <label htmlFor="adminUsername" className="font-medium text-neutral-800">
          Username
        </label>
        <input
          id="adminUsername"
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={32}
          required
          disabled={isPending}
          className="mt-2 min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900"
        />
      </div>
      <div>
        <label htmlFor="adminPassword" className="font-medium text-neutral-800">
          Password
        </label>
        <input
          id="adminPassword"
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
        {isPending ? "Memproses..." : "Masuk sebagai Admin"}
      </button>
    </form>
  );
};
