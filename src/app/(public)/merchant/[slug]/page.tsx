import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { MerchantDetailView } from "@/components/merchant/merchant-detail-view";
import { getPublicMerchantDetail } from "@/services/public-merchant-service";

type MerchantPageProps = { params: Promise<{ slug: string }> };
const loadMerchant = cache(getPublicMerchantDetail);

export async function generateMetadata({
  params,
}: MerchantPageProps): Promise<Metadata> {
  const { slug } = await params;
  const merchant = await loadMerchant(slug).catch(() => null);

  if (!merchant) {
    return {
      title: "Merchant Tidak Ditemukan",
      description: "Merchant tidak tersedia di Sungairujing Marketplace.",
      robots: { index: false, follow: false },
    };
  }

  const description = (
    merchant.description ??
    `Profil ${merchant.name} di Sungairujing Marketplace.`
  )
    .trim()
    .slice(0, 160);
  const canonical = `/merchant/${encodeURIComponent(merchant.slug)}`;

  return {
    title: merchant.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "id_ID",
      title: merchant.name,
      description,
      url: canonical,
      ...(merchant.logo
        ? { images: [{ url: merchant.logo.url, alt: merchant.logo.alt }] }
        : {}),
    },
  };
}

export default async function MerchantPage({ params }: MerchantPageProps) {
  const { slug } = await params;
  const result = await loadMerchant(slug)
    .then((merchant) => ({ merchant, unavailable: false as const }))
    .catch(() => ({ merchant: null, unavailable: true as const }));

  if (result.unavailable) {
    return (
      <main id="main-content" className="bg-neutral-50">
        <div className="mx-auto max-w-(--container-app) px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Profil Merchant</h1>
          <div
            role="alert"
            className="mt-6 max-w-2xl rounded-lg border border-error-border bg-error-bg p-5 text-error-text"
          >
            Profil merchant belum dapat dimuat. Silakan coba lagi beberapa saat
            lagi.
          </div>
        </div>
      </main>
    );
  }

  if (!result.merchant) notFound();
  return <MerchantDetailView merchant={result.merchant} />;
}
