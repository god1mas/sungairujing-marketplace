export default function ProductsLoading() {
  return (
    <main id="main-content" className="bg-neutral-50" aria-busy="true">
      <div className="border-b border-brand-100 bg-cream-50">
        <div className="mx-auto max-w-(--container-app) px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-brand-700">Memuat katalog</p>
          <h1 className="mt-2 text-3xl font-bold text-neutral-900">
            Katalog Produk
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-(--container-app) px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-xl bg-neutral-200" />
      </div>
    </main>
  );
}
