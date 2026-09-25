import Link from "next/link";
import { ProductCard } from "@/components/catalog/product-card";
import type { PublicMerchantDetail } from "@/services/public-merchant-service";
import { MerchantLogo } from "./merchant-logo";
import { MerchantStatus } from "./merchant-status";
import { TrackedWhatsAppLink } from "@/components/analytics/tracked-whatsapp-link";

export function MerchantDetailView({
  merchant,
}: {
  merchant: PublicMerchantDetail;
}) {
  return (
    <main id="main-content" className="bg-neutral-50">
      <div className="mx-auto max-w-(--container-app) px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-neutral-600">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/merchants" className="hover:text-brand-700">
                Merchant
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-neutral-900">
              {merchant.name}
            </li>
          </ol>
        </nav>

        <header className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <MerchantLogo merchant={merchant} size="detail" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                  {merchant.name}
                </h1>
                {merchant.isVerified ? (
                  <span className="rounded-sm border border-success-border bg-success-bg px-2.5 py-1 text-sm font-semibold text-success-text">
                    ✓ Terverifikasi
                  </span>
                ) : null}
              </div>
              <div className="mt-3">
                <MerchantStatus status={merchant.operationalStatus} />
              </div>
              {merchant.description ? (
                <p className="mt-5 max-w-3xl leading-7 text-neutral-700">
                  {merchant.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-8 grid gap-6 border-t border-neutral-200 pt-6 md:grid-cols-2">
            <section aria-labelledby="merchant-address-title">
              <h2 id="merchant-address-title" className="font-bold">
                Alamat
              </h2>
              <p className="mt-2 leading-6 text-neutral-600">
                {merchant.address}
              </p>
            </section>
            <section aria-labelledby="merchant-hours-title">
              <h2 id="merchant-hours-title" className="font-bold">
                Jam Operasional
              </h2>
              {merchant.openingHours.length > 0 ? (
                <dl className="mt-2 space-y-1 text-sm text-neutral-600">
                  {merchant.openingHours.map((item) => (
                    <div key={item.label} className="flex gap-3">
                      <dt className="font-medium text-neutral-800">
                        {item.label}
                      </dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-2 text-neutral-600">Belum dicantumkan.</p>
              )}
            </section>
          </div>

          {merchant.whatsappUrl ? (
            <TrackedWhatsAppLink
              href={merchant.whatsappUrl}
              source="MERCHANT_PROFILE"
              merchantSlug={merchant.slug}
              className="mt-6 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 font-semibold text-white hover:bg-brand-700"
            >
              Hubungi merchant via WhatsApp
            </TrackedWhatsAppLink>
          ) : null}
        </header>

        <section aria-labelledby="merchant-products-title" className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-brand-700">
                Produk merchant
              </p>
              <h2
                id="merchant-products-title"
                className="mt-1 text-2xl font-bold tracking-tight"
              >
                Produk dari {merchant.name}
              </h2>
            </div>
            <Link
              href={`/products?merchant=${encodeURIComponent(merchant.slug)}`}
              className="inline-flex min-h-11 items-center font-semibold text-brand-700 hover:text-brand-800"
            >
              Lihat di katalog
            </Link>
          </div>

          {merchant.products.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {merchant.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-neutral-200 bg-white px-6 py-10 text-center">
              <h3 className="text-lg font-semibold">
                Belum ada produk yang tersedia
              </h3>
              <p className="mt-2 text-neutral-600">
                Merchant ini belum memiliki produk publik saat ini.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
