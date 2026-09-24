"use client";

export default function VerificationReviewError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="px-4 py-8 sm:px-6">
      <section className="mx-auto max-w-xl rounded-lg border border-red-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          Bukti belum dapat dibuka
        </h1>
        <p className="mt-2 text-neutral-600">
          Tautan privat atau data pengajuan belum dapat dimuat. Silakan coba
          lagi.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 min-h-11 rounded-md bg-brand-700 px-4 py-2 font-semibold text-white"
        >
          Coba lagi
        </button>
      </section>
    </main>
  );
}
