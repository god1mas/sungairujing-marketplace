export default function AdminVerificationsLoading() {
  return (
    <section className="animate-pulse space-y-8" aria-busy="true">
      <div>
        <div className="h-4 w-24 rounded bg-neutral-200" />
        <div className="mt-3 h-9 w-64 max-w-full rounded bg-neutral-200" />
        <div className="mt-3 h-5 w-96 max-w-full rounded bg-neutral-200" />
      </div>
      <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
        <div className="h-16 rounded-md bg-neutral-100" />
        <div className="h-16 rounded-md bg-neutral-100" />
        <div className="h-16 rounded-md bg-neutral-100" />
      </div>
      <span className="sr-only">Memuat pengajuan verifikasi</span>
    </section>
  );
}
