export default function VerificationLoading() {
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8" aria-busy="true">
      <div className="mx-auto max-w-4xl animate-pulse">
        <div className="h-8 w-64 rounded bg-neutral-200" />
        <div className="mt-6 h-32 rounded-lg bg-neutral-200" />
      </div>
      <span className="sr-only">Memuat status verifikasi</span>
    </main>
  );
}
