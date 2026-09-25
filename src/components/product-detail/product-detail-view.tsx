import Link from "next/link";
import { formatRupiah } from "@/lib/format/currency";
import type { PublicProductDetail } from "@/services/public-product-detail-service";
import { ProductGallery } from "./product-gallery";
import { AddToCart } from "@/components/cart/add-to-cart";
import { TrackedWhatsAppLink } from "@/components/analytics/tracked-whatsapp-link";
import { ReportForm } from "@/components/reports/report-form";

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

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery name={product.name} images={product.images} />

          <article>
            <p className="text-sm font-semibold text-brand-700">
              Produk UMKM Sungairujing
            </p>
            <h1 className="mt-2 text-3xl leading-tight font-bold tracking-tight text-neutral-900 sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-2xl font-bold text-brand-700">
              {formatRupiah(product.price)}
              <span className="ml-1 text-sm font-normal text-neutral-600">
                / {product.unit}
              </span>
            </p>

            <div className="mt-5">
              <span
                className={`inline-flex rounded-sm border px-3 py-1.5 text-sm font-semibold ${
                  isAvailable
                    ? "border-success-border bg-success-bg text-success-text"
                    : "border-warning-border bg-warning-bg text-warning-text"
                }`}
              >
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
                className="mt-3 inline-flex min-h-11 items-center rounded-md border border-brand-600 px-5 font-semibold text-brand-700"
              >
                Tanya via WhatsApp
              </TrackedWhatsAppLink>
            ) : null}

            <section
              aria-labelledby="merchant-title"
              className="mt-8 rounded-lg border border-neutral-200 bg-white p-5"
            >
              <h2 id="merchant-title" className="text-lg font-bold">
                Informasi Merchant
              </h2>
              <Link
                href={`/merchant/${product.merchant.slug}`}
                className="mt-2 inline-flex min-h-11 items-center font-semibold text-brand-700 hover:text-brand-800"
              >
                {product.merchant.name}
              </Link>
              <p className="mt-1 text-sm leading-6 text-neutral-600">
                {product.merchant.address}
              </p>
            </section>
          </article>
        </div>

        <div className="mt-10 grid gap-8 border-t border-neutral-200 pt-8 lg:grid-cols-[2fr_1fr]">
          <section aria-labelledby="description-title">
            <h2 id="description-title" className="text-xl font-bold">
              Deskripsi Produk
            </h2>
            <p className="mt-3 whitespace-pre-line leading-7 text-neutral-700">
              {product.description}
            </p>
          </section>
          <section aria-labelledby="category-title">
            <h2 id="category-title" className="text-xl font-bold">
              Kategori
            </h2>
            <Link
              href={`/products?category=${encodeURIComponent(product.category.slug)}`}
              className="mt-3 inline-flex min-h-11 items-center rounded-md border border-brand-200 bg-white px-4 font-semibold text-brand-800 hover:bg-brand-50"
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
