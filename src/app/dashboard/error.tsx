"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div
        role="alert"
        className="mx-auto max-w-3xl rounded-lg border border-error-border bg-error-bg p-6 text-error-text"
      >
        <h1 className="text-2xl font-bold">Dashboard belum dapat dimuat</h1>
        <p className="mt-2">
          Ringkasan produk sedang tidak tersedia. Silakan coba lagi.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 min-h-11 rounded-md border border-error-border bg-white px-4 py-2 font-semibold"
        >
          Coba lagi
        </button>
      </div>
    </main>
  );
}
