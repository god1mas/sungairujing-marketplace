import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleOff,
  FileText,
  MapPin,
  MessageCircle,
  Store,
  Tags,
} from "lucide-react";
import { formatRupiah } from "@/lib/format/currency";
import type { PublicProductDetail } from "@/services/public-product-detail-service";
import { ProductGallery } from "./product-gallery";
import { AddToCart } from "@/components/cart/add-to-cart";
import { TrackedWhatsAppLink } from "@/components/analytics/tracked-whatsapp-link";
import { ReportForm } from "@/components/reports/report-form";
import { ShareButton } from "@/components/sharing/share-button";

export function ProductDetailView({
  product,
}: {
  product: PublicProductDetail;
}) {
  const isAvailable = product.availability === "TERSEDIA";

  return (
    <main id="main-content" className="bg-neutral-50">
      <div className="mx-auto max-w-(--container-app) px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-neutral-600">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/products" className="hover:text-brand-700">
                Produk
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-neutral-900">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid overflow-hidden rounded-xl border border-brand-100 bg-white shadow-sm lg:grid-cols-2">
          <div className="p-3 sm:p-5 lg:p-6">
            <ProductGallery name={product.name} images={product.images} />
          </div>

          <article className="border-t border-brand-100 bg-cream-50 p-5 sm:p-7 lg:border-t-0 lg:border-l lg:p-8">
            <p className="text-sm font-semibold text-brand-700">
              Produk UMKM Sungairujing
            </p>
            <h1 className="mt-2 text-3xl leading-tight font-bold tracking-tight text-neutral-900 sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-3xl font-bold text-brand-700">
              {formatRupiah(product.price)}
              <span className="ml-1 text-sm font-normal text-neutral-600">
                / {product.unit}
              </span>
            </p>

            <div className="mt-5">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${
                  isAvailable
                    ? "border-success-border bg-success-bg text-success-text"
                    : "border-warning-border bg-warning-bg text-warning-text"
                }`}
              >
                {isAvailable ? (
                  <CheckCircle2 aria-hidden="true" className="size-4" />
                ) : (
                  <CircleOff aria-hidden="true" className="size-4" />
                )}
                {isAvailable ? "Tersedia" : "Habis"}
              </span>
              {!isAvailable ? (
                <p className="mt-2 text-sm text-neutral-600">
                  Produk sedang habis. Ketersediaan dapat berubah setelah
                  dikonfirmasi oleh merchant.
                </p>
              ) : null}
            </div>

            <AddToCart
              productId={product.id}
              merchantId={product.merchant.id}
              disabled={!isAvailable}
            />
            {product.merchant.whatsappUrl ? (
              <TrackedWhatsAppLink
                href={product.merchant.whatsappUrl}
                source="PRODUCT_DETAIL"
                productSlug={product.slug}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand-600 bg-white px-5 font-semibold text-brand-700 transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                <MessageCircle aria-hidden="true" className="size-4" />
                Tanya via WhatsApp
              </TrackedWhatsAppLink>
            ) : null}
            <ShareButton
              title={product.name}
              path={`/products/${encodeURIComponent(product.slug)}`}
            />

            <section
              aria-labelledby="merchant-title"
              className="mt-8 rounded-xl border border-brand-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                  <Store aria-hidden="true" className="size-4" />
                </span>
                <h2 id="merchant-title" className="text-lg font-bold">
                  Informasi Merchant
                </h2>
              </div>
              <Link
                href={`/merchant/${product.merchant.slug}`}
                className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-brand-700 transition-colors hover:text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                {product.merchant.name}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <p className="mt-1 flex items-start gap-2 text-sm leading-6 text-neutral-600">
                <MapPin
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-orange-500"
                />
                <span>{product.merchant.address}</span>
              </p>
            </section>
          </article>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[2fr_1fr]">
          <section
            aria-labelledby="description-title"
            className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-center gap-2">
              <FileText aria-hidden="true" className="size-5 text-brand-700" />
              <h2 id="description-title" className="text-xl font-bold">
                Deskripsi Produk
              </h2>
            </div>
            <p className="mt-3 whitespace-pre-line leading-7 text-neutral-700">
              {product.description}
            </p>
          </section>
          <section
            aria-labelledby="category-title"
            className="rounded-xl border border-orange-100 bg-orange-50 p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-center gap-2">
              <Tags aria-hidden="true" className="size-5 text-orange-700" />
              <h2 id="category-title" className="text-xl font-bold">
                Kategori
              </h2>
            </div>
            <Link
              href={`/products?category=${encodeURIComponent(product.category.slug)}`}
              className="mt-3 inline-flex min-h-11 items-center rounded-full border border-orange-200 bg-white px-4 font-semibold text-brand-800 transition-colors hover:bg-orange-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              {product.category.name}
            </Link>
          </section>
        </div>
        <ReportForm targetType="PRODUCT" targetSlug={product.slug} />
      </div>
    </main>
  );
}
