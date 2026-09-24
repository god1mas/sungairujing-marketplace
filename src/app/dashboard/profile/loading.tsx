export default function MerchantProfileLoading() {
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div
        className="mx-auto max-w-4xl animate-pulse"
        aria-label="Memuat profil merchant"
      >
        <div className="h-8 w-56 rounded bg-neutral-200" />
        <div className="mt-8 h-72 rounded-lg bg-neutral-200" />
        <span className="sr-only">Memuat profil merchant…</span>
      </div>
    </main>
  );
}
