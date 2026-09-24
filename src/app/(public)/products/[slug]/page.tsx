import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ProductDetailView } from "@/components/product-detail/product-detail-view";
import { getPublicProductDetail } from "@/services/public-product-detail-service";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

const loadProduct = cache(getPublicProductDetail);

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug).catch(() => null);

  if (!product) {
    return {
      title: "Produk Tidak Ditemukan",
      description: "Produk tidak tersedia di Sungairujing Marketplace.",
      robots: { index: false, follow: false },
    };
  }

  const description = product.description.trim().slice(0, 160);
  const canonical = `/products/${encodeURIComponent(product.slug)}`;
  const cover = product.images[0];

  return {
    title: product.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "id_ID",
      title: product.name,
      description,
      url: canonical,
      ...(cover ? { images: [{ url: cover.url, alt: cover.alt }] } : {}),
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const result = await loadProduct(slug)
    .then((product) => ({ product, unavailable: false as const }))
    .catch(() => ({ product: null, unavailable: true as const }));

  if (result.unavailable) {
    return (
      <main id="main-content" className="bg-neutral-50">
        <div className="mx-auto max-w-(--container-app) px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-neutral-900">Detail Produk</h1>
          <div
            role="alert"
            className="mt-6 max-w-2xl rounded-lg border border-error-border bg-error-bg p-5 text-error-text"
          >
            Detail produk belum dapat dimuat. Silakan coba lagi beberapa saat
            lagi.
          </div>
        </div>
      </main>
    );
  }

  if (!result.product) notFound();

  return <ProductDetailView product={result.product} />;
}
