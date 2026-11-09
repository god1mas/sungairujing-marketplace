import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  PackageSearch,
  SearchX,
  ShoppingBag,
} from "lucide-react";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { ProductCard } from "@/components/catalog/product-card";
import { PublicPageHeader } from "@/components/public/public-page-header";
import { PublicStatePanel } from "@/components/public/public-state-panel";
import { SectionHeading } from "@/components/public/section-heading";
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
        <PublicPageHeader
          eyebrow="Produk lokal Sungairujing"
          title="Katalog Produk"
          description="Temukan produk UMKM lokal dan hubungi merchant secara langsung."
          icon={ShoppingBag}
        />
        <div className="mx-auto max-w-(--container-app) px-4 py-10 sm:px-6 lg:px-8">
          <PublicStatePanel
            tone="error"
            icon={AlertTriangle}
            title="Katalog belum dapat dimuat"
            description="Silakan coba lagi beberapa saat lagi."
          />
        </div>
      </main>
    );
  }

  const [catalog, options] = result;

  return (
    <main id="main-content" className="bg-neutral-50">
      <PublicPageHeader
        eyebrow="Produk lokal Sungairujing"
        title="Katalog Produk"
        description="Temukan produk UMKM lokal dan hubungi merchant secara langsung."
        icon={ShoppingBag}
      />
      <div className="mx-auto max-w-(--container-app) px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div>
          <CatalogFilters query={query} options={options} />
        </div>

        <section aria-labelledby="catalog-results" className="mt-10">
          <SectionHeading
            id="catalog-results"
            eyebrow={`${catalog.total} produk ditemukan`}
            title="Hasil produk"
            description="Pilih produk yang sesuai dan lihat informasi lengkap dari merchant lokal."
            icon={PackageSearch}
          />

          {catalog.products.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {catalog.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <PublicStatePanel
              className="mt-5"
              icon={SearchX}
              title="Produk tidak ditemukan"
              description="Coba ubah kata kunci atau filter pencarian Anda."
              action={
                <Link
                  href="/products"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-600 px-5 font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  Reset pencarian
                </Link>
              }
            />
          )}
        </section>

        <CatalogPagination query={query} totalPages={catalog.totalPages} />
      </div>
    </main>
  );
}
