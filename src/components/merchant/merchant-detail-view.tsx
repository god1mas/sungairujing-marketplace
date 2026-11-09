import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  MapPin,
  MessageCircle,
  PackageOpen,
  QrCode,
} from "lucide-react";
import { ProductCard } from "@/components/catalog/product-card";
import { PublicStatePanel } from "@/components/public/public-state-panel";
import { SectionHeading } from "@/components/public/section-heading";
import type { PublicMerchantDetail } from "@/services/public-merchant-service";
import { MerchantLogo } from "./merchant-logo";
import { MerchantStatus } from "./merchant-status";
import { TrackedWhatsAppLink } from "@/components/analytics/tracked-whatsapp-link";
import { ReportForm } from "@/components/reports/report-form";
import { MerchantQr } from "./merchant-qr";

export function MerchantDetailView({
  merchant,
  qr = null,
}: {
  merchant: PublicMerchantDetail;
  qr?: { url: string; dataUrl: string } | null;
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

        <header className="relative overflow-hidden rounded-xl border border-brand-100 bg-white p-5 shadow-sm sm:p-8">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand-500 via-yellow-400 to-orange-400"
          />
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <MerchantLogo merchant={merchant} size="detail" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                  {merchant.name}
                </h1>
                {merchant.isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-success-border bg-success-bg px-2.5 py-1 text-sm font-semibold text-success-text">
                    <BadgeCheck aria-hidden="true" className="size-4" />
                    Terverifikasi
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

          <div className="mt-8 grid gap-4 border-t border-neutral-200 pt-6 md:grid-cols-2">
            <section
              aria-labelledby="merchant-address-title"
              className="rounded-xl border border-orange-100 bg-orange-50 p-5"
            >
              <div className="flex items-center gap-2">
                <MapPin aria-hidden="true" className="size-5 text-orange-700" />
                <h2 id="merchant-address-title" className="font-bold">
                  Alamat
                </h2>
              </div>
              <p className="mt-2 leading-6 text-neutral-600">
                {merchant.address}
              </p>
            </section>
            <section
              aria-labelledby="merchant-hours-title"
              className="rounded-xl border border-brand-100 bg-brand-50 p-5"
            >
              <div className="flex items-center gap-2">
                <Clock3 aria-hidden="true" className="size-5 text-brand-700" />
                <h2 id="merchant-hours-title" className="font-bold">
                  Jam Operasional
                </h2>
              </div>
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
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg bg-brand-600 px-5 font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              <MessageCircle aria-hidden="true" className="size-5" />
              Hubungi merchant via WhatsApp
            </TrackedWhatsAppLink>
          ) : null}
          <section
            aria-labelledby="merchant-qr-title"
            className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-5"
          >
            <div className="flex items-center gap-2">
              <QrCode aria-hidden="true" className="size-5 text-brand-700" />
              <h2 id="merchant-qr-title" className="font-bold">
                QR Merchant
              </h2>
            </div>
            <p className="mt-1 text-sm text-neutral-600">
              Pindai untuk membuka halaman publik merchant ini.
            </p>
            <MerchantQr merchantName={merchant.name} qr={qr} />
          </section>
        </header>

        <section aria-labelledby="merchant-products-title" className="mt-10">
          <SectionHeading
            id="merchant-products-title"
            eyebrow="Produk merchant"
            title={`Produk dari ${merchant.name}`}
            description="Jelajahi produk publik yang tersedia dari merchant ini."
            icon={PackageOpen}
            action={
              <Link
                href={`/products?merchant=${encodeURIComponent(merchant.slug)}`}
                className="inline-flex min-h-11 items-center gap-2 font-semibold text-brand-700 transition-colors hover:text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                Lihat di katalog
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            }
          />

          {merchant.products.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {merchant.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <PublicStatePanel
              className="mt-5"
              icon={PackageOpen}
              title="Belum ada produk yang tersedia"
              description="Merchant ini belum memiliki produk publik saat ini."
            />
          )}
        </section>
        <ReportForm targetType="MERCHANT" targetSlug={merchant.slug} />
      </div>
    </main>
  );
}
