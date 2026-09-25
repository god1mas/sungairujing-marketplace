export default function AnalyticsLoading() {
  return (
    <main className="px-4 py-8 sm:px-6" aria-busy="true">
      <div className="mx-auto max-w-5xl">
        <div className="h-9 w-48 animate-pulse rounded bg-neutral-200" />
        <div className="mt-6 h-72 animate-pulse rounded-lg bg-neutral-200" />
        <span className="sr-only">Memuat analytics</span>
      </div>
    </main>
  );
}
