import type { Metadata } from "next";
import { AlertTriangle, Store, StoreIcon } from "lucide-react";
import { MerchantCard } from "@/components/merchant/merchant-card";
import { PublicPageHeader } from "@/components/public/public-page-header";
import { PublicStatePanel } from "@/components/public/public-state-panel";
import { BRAND_NAME } from "@/constants/branding";
import { getPublicMerchants } from "@/services/public-merchant-service";

export const metadata: Metadata = {
  title: "Daftar Merchant",
  description: `Kenali UMKM lokal yang bergabung di ${BRAND_NAME}.`,
  alternates: { canonical: "/merchants" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: `Merchant ${BRAND_NAME}`,
    description: `Kenali UMKM lokal yang bergabung di ${BRAND_NAME}.`,
  },
};

export default async function MerchantsPage() {
  const result = await getPublicMerchants()
    .then((merchants) => ({ merchants, unavailable: false as const }))
    .catch(() => ({ merchants: [], unavailable: true as const }));

  return (
    <main id="main-content" className="bg-neutral-50">
      <PublicPageHeader
        eyebrow="UMKM Desa Sungairujing"
        title="Semua Merchant"
        description="Kenali merchant lokal, temukan produk unggulan, dan hubungi mereka secara langsung."
        icon={Store}
      />
      <div className="mx-auto max-w-(--container-app) px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {result.unavailable ? (
          <PublicStatePanel
            role="alert"
            tone="error"
            icon={AlertTriangle}
            title="Daftar merchant belum dapat dimuat"
            description="Silakan coba lagi beberapa saat lagi."
          />
        ) : result.merchants.length > 0 ? (
          <section
            aria-label="Daftar merchant"
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {result.merchants.map((merchant) => (
              <MerchantCard key={merchant.id} merchant={merchant} />
            ))}
          </section>
        ) : (
          <PublicStatePanel
            icon={StoreIcon}
            title="Belum ada merchant publik"
            description="Daftar merchant belum tersedia saat ini."
          />
        )}
      </div>
    </main>
  );
}
