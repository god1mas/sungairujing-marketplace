import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Handshake,
  MapPin,
  Megaphone,
  MessageCircle,
  PackageSearch,
  Search,
  ShoppingBag,
  Store,
  TrendingUp,
} from "lucide-react";
import { CategoryLinks } from "@/components/catalog/category-links";
import { ProductCard } from "@/components/catalog/product-card";
import { SectionHeading } from "@/components/public/section-heading";
import { getPublicHomepageContent } from "@/services/admin-content-service";
import { getPopularProducts } from "@/services/analytics-service";
import { getPublicCatalogFilterOptions } from "@/services/public-catalog-service";
import {
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_PATH,
  BRAND_LOGO_WIDTH,
  BRAND_NAME,
} from "@/constants/branding";

const marketplaceSteps = [
  {
    icon: Search,
    title: "Cari produk lokal",
    description: "Temukan produk dari UMKM Desa Sungairujing.",
  },
  {
    icon: Store,
    title: "Kenali merchant",
    description: "Lihat profil, lokasi, dan informasi produknya.",
  },
  {
    icon: MessageCircle,
    title: "Hubungi langsung",
    description: "Lanjutkan komunikasi dengan merchant melalui WhatsApp.",
  },
] as const;

const merchantStatusPresentation = {
  BUKA: { label: "Buka", dot: "bg-brand-400" },
  TUTUP: { label: "Tutup", dot: "bg-neutral-400" },
  LIBUR_SEMENTARA: { label: "Libur sementara", dot: "bg-accent-orange" },
} as const;

export const metadata: Metadata = {
  title: BRAND_NAME,
  description:
    "Temukan produk UMKM Desa Sungairujing dan terhubung langsung dengan merchant lokal.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: BRAND_NAME,
    description:
      "Temukan produk UMKM Desa Sungairujing dan terhubung langsung dengan merchant lokal.",
    images: [
      {
        url: BRAND_LOGO_PATH,
        width: BRAND_LOGO_WIDTH,
        height: BRAND_LOGO_HEIGHT,
        alt: `Logo ${BRAND_NAME}`,
      },
    ],
  },
};

export default async function Home() {
  let categories: { name: string; slug: string }[] = [];
  let popularProducts: Awaited<ReturnType<typeof getPopularProducts>> = [];
  let content: Awaited<ReturnType<typeof getPublicHomepageContent>> = {
    banners: [],
    featured: [],
  };

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
  try {
    content = await getPublicHomepageContent();
  } catch {
    // Optional managed homepage content must not take down discovery.
  }

  return (
    <main id="main-content">
      <section className="relative overflow-hidden border-b border-brand-100 bg-cream-50">
        <div
          aria-hidden="true"
          className="absolute top-12 right-[8%] size-28 rounded-full bg-accent-yellow/20 sm:size-40"
        />
        <div
          aria-hidden="true"
          className="absolute -right-12 bottom-8 size-40 rounded-full bg-accent-orange/15 sm:size-56"
        />
        <div className="relative mx-auto grid max-w-(--container-app) gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)] lg:items-center lg:gap-14 lg:px-8 lg:py-20">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-bold tracking-wide text-brand-700 sm:text-sm">
              <MapPin aria-hidden="true" className="size-4" />
              Marketplace lokal UMKM Desa Sungairujing
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl leading-tight font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              Temukan Produk Lokal Sungairujing
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-700 sm:text-lg">
              Jelajahi produk UMKM lokal dan terhubung langsung dengan merchant
              untuk mendapatkan informasi lebih lanjut.
            </p>

            <form
              action="/products"
              className="mt-7 flex max-w-2xl flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-2 shadow-md sm:flex-row"
              method="get"
              role="search"
            >
              <div className="relative flex-1">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-neutral-400"
                />
                <label className="sr-only" htmlFor="search">
                  Cari produk atau merchant
                </label>
                <input
                  id="search"
                  name="q"
                  type="search"
                  placeholder="Cari produk atau merchant..."
                  className="min-h-12 w-full rounded-md border border-neutral-200 bg-white pr-4 pl-11 text-neutral-900 placeholder:text-neutral-500 focus:border-brand-600 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand-600 px-6 font-semibold text-white hover:bg-brand-700"
              >
                Cari
                <ArrowRight aria-hidden="true" className="size-4" />
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
              <Link
                href="/products"
                className="inline-flex min-h-11 items-center gap-2 text-brand-700 hover:text-brand-800"
              >
                <ShoppingBag aria-hidden="true" className="size-4" />
                Lihat katalog
              </Link>
              <Link
                href="/merchants"
                className="inline-flex min-h-11 items-center gap-2 text-brand-700 hover:text-brand-800"
              >
                <Store aria-hidden="true" className="size-4" />
                Kenali merchant
              </Link>
            </div>
          </div>

          <aside
            aria-label="Cara menggunakan marketplace"
            className="relative hidden overflow-hidden rounded-xl border border-brand-700 bg-brand-800 p-5 text-white shadow-md sm:p-6 lg:block lg:p-7"
          >
            <div
              aria-hidden="true"
              className="absolute -top-10 -right-10 size-36 rounded-full bg-accent-yellow/15"
            />
            <div className="relative">
              <p className="text-xs font-bold tracking-[0.14em] text-brand-200 uppercase">
                Belanja lebih dekat
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Dari desa, untuk masyarakat
              </h2>
              <div className="mt-5 space-y-3">
                {marketplaceSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/8 p-3.5"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white text-brand-800">
                      <step.icon aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <p className="font-bold">
                        <span className="mr-1.5 text-brand-200">
                          {index + 1}.
                        </span>
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-sm leading-5 text-brand-100">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 flex items-center gap-2 rounded-lg bg-accent-yellow px-4 py-3 text-sm font-bold text-brand-900">
                <Handshake aria-hidden="true" className="size-5 shrink-0" />
                Kesepakatan dilakukan langsung dengan merchant.
              </p>
            </div>
          </aside>

          <div className="rounded-lg border border-brand-700 bg-brand-800 p-4 text-white shadow-sm lg:hidden">
            <p className="text-xs font-bold tracking-[0.14em] text-brand-200 uppercase">
              Belanja lebih dekat
            </p>
            <p className="mt-1 text-sm leading-6 text-brand-50">
              Cari produk dan merchant lokal, lalu hubungi penjual langsung
              melalui WhatsApp.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[0.6875rem] font-semibold">
              {marketplaceSteps.map((step) => (
                <div
                  key={step.title}
                  className="flex min-w-0 flex-col items-center gap-1.5 rounded-md bg-white/8 p-2"
                >
                  <step.icon aria-hidden="true" className="size-4" />
                  <span className="line-clamp-2">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {content.featured.length ? (
        <section className="bg-white" aria-labelledby="featured-title">
          <div className="mx-auto max-w-(--container-app) px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <SectionHeading
              id="featured-title"
              eyebrow="Kenal lebih dekat"
              title="Merchant Pilihan"
              description="Jelajahi UMKM lokal yang dipilih untuk tampil di halaman utama."
              icon={Store}
              tone="orange"
              action={
                <Link
                  href="/merchants"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md font-semibold text-brand-700 hover:text-brand-800"
                >
                  Semua merchant
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              }
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
              {content.featured.map((merchant, index) => {
                const status =
                  merchantStatusPresentation[merchant.operationalStatus];
                return (
                  <Link
                    key={merchant.id}
                    href={`/merchant/${merchant.slug}`}
                    className="group flex min-h-44 flex-col rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    <span
                      aria-hidden="true"
                      className={`flex size-11 items-center justify-center rounded-lg text-lg font-bold text-brand-900 ${
                        index % 2 === 0
                          ? "bg-accent-orange/25"
                          : "bg-accent-yellow/25"
                      }`}
                    >
                      {merchant.name.trim().charAt(0).toUpperCase() || "M"}
                    </span>
                    <span className="mt-4 line-clamp-2 font-bold text-neutral-900 group-hover:text-brand-700">
                      {merchant.name}
                    </span>
                    <span className="mt-1 line-clamp-2 text-sm leading-5 text-neutral-600">
                      {merchant.description ?? merchant.address}
                    </span>
                    <span className="mt-auto flex items-center gap-2 pt-3 text-xs font-semibold text-neutral-600">
                      <span
                        aria-hidden="true"
                        className={`size-2 rounded-full ${status.dot}`}
                      />
                      {status.label}
                      <ArrowRight
                        aria-hidden="true"
                        className="ml-auto size-4 text-brand-700 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
                      />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {content.banners.length ? (
        <section className="bg-neutral-50" aria-labelledby="promo-title">
          <div className="mx-auto max-w-(--container-app) px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <SectionHeading
              id="promo-title"
              eyebrow="Informasi terbaru"
              title="Kabar & Promo"
              description="Temukan kabar dan penawaran dari UMKM Desa Sungairujing."
              icon={Megaphone}
            />
            <div className="mt-6 grid gap-4">
              {content.banners.map((banner) => (
                <article
                  key={banner.id}
                  className="min-w-0 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm lg:grid lg:grid-cols-2"
                >
                  <div className="flex min-w-0 items-center justify-center overflow-hidden bg-neutral-100">
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title}
                      width={960}
                      height={480}
                      sizes="(min-width: 1024px) 50vw, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)"
                      className="block h-auto max-h-[32rem] w-full max-w-full object-contain lg:max-h-[28rem]"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 border-t border-neutral-200 bg-cream-50/50 p-5 sm:p-6 lg:flex lg:flex-col lg:justify-center lg:border-t-0 lg:border-l lg:p-8">
                    <p className="text-xs font-bold tracking-[0.14em] text-brand-700 uppercase">
                      Info untuk warga
                    </p>
                    <h2 className="text-xl font-bold break-words sm:text-2xl">
                      {banner.title}
                    </h2>
                    {banner.description ? (
                      <p className="mt-2 break-words text-neutral-600">
                        {banner.description}
                      </p>
                    ) : null}
                    {banner.targetUrl ? (
                      <a
                        href={banner.targetUrl}
                        className="mt-4 inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-md bg-brand-700 px-4 text-center font-semibold break-words text-white hover:bg-brand-800 lg:self-start"
                      >
                        {banner.ctaText || "Lihat selengkapnya"}
                        <ArrowRight
                          aria-hidden="true"
                          className="size-4 shrink-0"
                        />
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CategoryLinks categories={categories} />

      <section aria-labelledby="popular-products-title" className="bg-white">
        <div className="mx-auto max-w-(--container-app) px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <SectionHeading
            id="popular-products-title"
            eyebrow="Berdasarkan kunjungan detail produk"
            title="Produk Populer"
            description="Produk yang paling sering dilihat pengunjung dalam periode terbaru."
            icon={TrendingUp}
            action={
              <Link
                href="/products"
                className="inline-flex min-h-11 items-center gap-2 rounded-md font-semibold text-brand-700 hover:text-brand-800"
              >
                Lihat katalog
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            }
          />
          {popularProducts.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {popularProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-dashed border-brand-200 bg-brand-50 p-5 text-neutral-600 sm:p-6">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white text-brand-700 shadow-sm">
                <PackageSearch aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="font-bold text-neutral-900">
                  Produk populer segera hadir
                </p>
                <p className="mt-1 text-sm leading-6">
                  Belum ada data kunjungan produk yang cukup.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section
        aria-labelledby="about-title"
        className="bg-brand-800 text-white"
      >
        <div className="mx-auto grid max-w-(--container-app) gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold tracking-[0.14em] text-brand-200 uppercase">
              Tentang marketplace
            </p>
            <h2
              id="about-title"
              className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl"
            >
              Mendekatkan produk lokal dengan masyarakat
            </h2>
            <p className="mt-4 text-base leading-7 text-brand-50">
              {BRAND_NAME} membantu masyarakat menemukan produk UMKM Desa
              Sungairujing. Informasi produk tersedia dalam satu tempat,
              sementara komunikasi dan kesepakatan dilakukan langsung dengan
              merchant.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              {
                icon: ShoppingBag,
                title: "Produk lokal mudah ditemukan",
                description:
                  "Jelajahi katalog berdasarkan produk dan kategori.",
              },
              {
                icon: Store,
                title: "Informasi merchant yang jelas",
                description: "Kenali usaha lokal sebelum menghubungi penjual.",
              },
              {
                icon: MessageCircle,
                title: "Komunikasi langsung",
                description:
                  "Tanyakan ketersediaan dan detail melalui WhatsApp.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/8 p-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-yellow text-brand-900">
                  <item.icon aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <h3 className="font-bold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-brand-100">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
