"use client";

import { AlertCircle } from "lucide-react";

export default function VerificationReviewError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section className="mx-auto max-w-xl rounded-lg border border-error-border bg-white p-6 shadow-sm">
      <span className="flex size-11 items-center justify-center rounded-md bg-error-bg text-error-text">
        <AlertCircle aria-hidden="true" className="size-5" />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-neutral-900">
        Bukti belum dapat dibuka
      </h1>
      <p className="mt-2 text-neutral-600">
        Tautan privat atau data pengajuan belum dapat dimuat. Silakan coba lagi.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 min-h-11 rounded-md bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
      >
        Coba lagi
      </button>
    </section>
  );
}
