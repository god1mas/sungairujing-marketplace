import type { Metadata } from "next";
import { CategoryLinks } from "@/components/catalog/category-links";
import { getPublicCatalogFilterOptions } from "@/services/public-catalog-service";
import { getPopularProducts } from "@/services/analytics-service";
import { ProductCard } from "@/components/catalog/product-card";

export const metadata: Metadata = {
  title: "Marketplace Produk Lokal Sungairujing",
  description:
    "Temukan produk UMKM Desa Sungairujing dan terhubung langsung dengan merchant lokal.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: "Sungairujing Marketplace",
    description:
      "Temukan produk UMKM Desa Sungairujing dan terhubung langsung dengan merchant lokal.",
  },
};

export default async function Home() {
  let categories: { name: string; slug: string }[] = [];
  let popularProducts: Awaited<ReturnType<typeof getPopularProducts>> = [];

  try {
    categories = (await getPublicCatalogFilterOptions()).categories;
  } catch {
    // The public homepage remains available when its optional data is unavailable.
  }
  try {
    popularProducts = await getPopularProducts();
  } catch {
    // Popular analytics is optional; the homepage remains available.
  }

  return (
    <main id="main-content">
      <section className="border-b border-brand-100 bg-brand-50">
        <div className="mx-auto max-w-(--container-app) px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-wide text-brand-700">
              Marketplace lokal UMKM Desa Sungairujing
            </p>
            <h1 className="mt-3 text-3xl leading-tight font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              Temukan Produk Lokal Sungairujing
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-700 sm:text-lg">
              Jelajahi produk UMKM lokal dan terhubung langsung dengan merchant
              untuk mendapatkan informasi lebih lanjut.
            </p>

            <form
              action="/products"
              className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
              method="get"
              role="search"
            >
              <div className="flex-1">
                <label className="sr-only" htmlFor="search">
                  Cari produk atau merchant
                </label>
                <input
                  id="search"
                  name="q"
                  type="search"
                  placeholder="Cari produk atau merchant..."
                  className="min-h-12 w-full rounded-md border border-neutral-300 bg-white px-4 text-neutral-900 shadow-sm placeholder:text-neutral-500 focus:border-brand-600 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="min-h-12 rounded-md bg-brand-600 px-6 font-semibold text-white hover:bg-brand-700"
              >
                Cari
              </button>
            </form>
          </div>
        </div>
      </section>

      <CategoryLinks categories={categories} />

      <section
        aria-labelledby="popular-products-title"
        className="bg-neutral-50"
      >
        <div className="mx-auto max-w-(--container-app) px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-brand-700">
            Berdasarkan kunjungan detail produk
          </p>
          <h2
            id="popular-products-title"
            className="mt-1 text-2xl font-bold text-neutral-900"
          >
            Produk Populer
          </h2>
          {popularProducts.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {popularProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-neutral-600">
              Belum ada data kunjungan produk yang cukup.
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="about-title" className="bg-white">
        <div className="mx-auto max-w-(--container-app) px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-brand-700">
              Tentang marketplace
            </p>
            <h2
              id="about-title"
              className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
            >
              Mendekatkan produk lokal dengan masyarakat
            </h2>
            <p className="mt-4 text-base leading-7 text-neutral-700">
              Sungairujing Marketplace membantu masyarakat menemukan produk UMKM
              Desa Sungairujing. Informasi produk tersedia dalam satu tempat,
              sementara komunikasi dan kesepakatan dilakukan langsung dengan
              merchant.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
