import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AlertTriangle, Store } from "lucide-react";
import { MerchantDetailView } from "@/components/merchant/merchant-detail-view";
import { PublicPageHeader } from "@/components/public/public-page-header";
import { PublicStatePanel } from "@/components/public/public-state-panel";
import { getPublicMerchantDetail } from "@/services/public-merchant-service";
import { BRAND_NAME } from "@/constants/branding";
import { createMerchantQr } from "@/services/merchant-qr-service";

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
      description: `Merchant tidak tersedia di ${BRAND_NAME}.`,
      robots: { index: false, follow: false },
    };
  }

  const description = (
    merchant.description ?? `Profil ${merchant.name} di ${BRAND_NAME}.`
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
        <PublicPageHeader
          eyebrow="UMKM Desa Sungairujing"
          title="Profil Merchant"
          description="Kenali merchant lokal dan produk yang mereka tawarkan."
          icon={Store}
        />
        <div className="mx-auto max-w-(--container-app) px-4 py-10 sm:px-6 lg:px-8">
          <PublicStatePanel
            role="alert"
            tone="error"
            icon={AlertTriangle}
            title="Profil merchant belum dapat dimuat"
            description="Silakan coba lagi beberapa saat lagi."
          />
        </div>
      </main>
    );
  }

  if (!result.merchant) notFound();
  const qr = await createMerchantQr(result.merchant.slug);
  return <MerchantDetailView merchant={result.merchant} qr={qr} />;
}
