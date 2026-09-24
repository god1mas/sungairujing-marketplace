import type { Metadata } from "next";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { ProductCard } from "@/components/catalog/product-card";
import {
  parseCatalogQuery,
  type CatalogSearchParams,
} from "@/features/catalog/catalog-query";
import {
  getPublicCatalog,
  getPublicCatalogFilterOptions,
} from "@/services/public-catalog-service";

export const metadata: Metadata = {
  title: "Katalog Produk",
  description: "Jelajahi produk UMKM lokal Desa Sungairujing.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const query = parseCatalogQuery(await searchParams);

  const result = await Promise.all([
    getPublicCatalog(query),
    getPublicCatalogFilterOptions(),
  ]).catch(() => null);

  if (!result) {
    return (
      <main id="main-content" className="bg-neutral-50">
        <div className="mx-auto max-w-(--container-app) px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-neutral-900">
            Katalog Produk
          </h1>
          <div
            role="alert"
            className="mt-6 max-w-2xl rounded-lg border border-error-border bg-error-bg p-5 text-error-text"
          >
            Katalog belum dapat dimuat. Silakan coba lagi beberapa saat lagi.
          </div>
        </div>
      </main>
    );
  }

  const [catalog, options] = result;

  return (
    <main id="main-content" className="bg-neutral-50">
      <div className="mx-auto max-w-(--container-app) px-4 py-10 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold text-brand-700">
            Produk lokal Sungairujing
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Katalog Produk
          </h1>
          <p className="mt-3 text-neutral-600">
            Temukan produk UMKM lokal dan hubungi merchant secara langsung.
          </p>
        </header>

        <div className="mt-8">
          <CatalogFilters query={query} options={options} />
        </div>

        <section aria-labelledby="catalog-results" className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <h2 id="catalog-results" className="text-xl font-bold">
              Hasil produk
            </h2>
            <p className="text-sm text-neutral-600">
              {catalog.total} produk ditemukan
            </p>
          </div>

          {catalog.products.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {catalog.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-neutral-200 bg-white px-6 py-12 text-center">
              <h3 className="text-lg font-semibold text-neutral-900">
                Produk tidak ditemukan
              </h3>
              <p className="mt-2 text-neutral-600">
                Coba ubah kata kunci atau filter pencarian Anda.
              </p>
            </div>
          )}
        </section>

        <CatalogPagination query={query} totalPages={catalog.totalPages} />
      </div>
    </main>
  );
}
