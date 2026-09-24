export default function ProductsLoading() {
  return (
    <main id="main-content" className="bg-neutral-50" aria-busy="true">
      <div className="mx-auto max-w-(--container-app) px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-brand-700">Memuat katalog</p>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">
          Katalog Produk
        </h1>
        <div className="mt-8 h-48 animate-pulse rounded-lg bg-neutral-200" />
      </div>
    </main>
  );
}
