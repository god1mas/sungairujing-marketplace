export default function ProductDetailLoading() {
  return (
    <main id="main-content" className="bg-neutral-50" aria-busy="true">
      <div className="mx-auto grid max-w-(--container-app) gap-5 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-12">
        <div className="aspect-square animate-pulse rounded-xl bg-neutral-200" />
        <div className="rounded-xl border border-brand-100 bg-cream-50 p-6">
          <p className="text-sm font-semibold text-brand-700">
            Memuat detail produk
          </p>
          <div className="mt-4 h-10 w-3/4 animate-pulse rounded bg-neutral-200" />
          <div className="mt-5 h-8 w-1/3 animate-pulse rounded bg-neutral-200" />
        </div>
      </div>
    </main>
  );
}
