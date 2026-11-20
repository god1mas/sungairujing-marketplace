export default function ProductsLoading() {
  return (
    <main id="main-content" className="bg-neutral-50" aria-busy="true">
      <div className="border-b border-brand-100 bg-cream-50">
        <div className="mx-auto max-w-(--container-app) px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          <p className="text-sm font-semibold text-brand-700">Memuat katalog</p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl">
            Katalog Produk
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-(--container-app) px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-xl bg-neutral-200" />
      </div>
    </main>
  );
}
