import type { Metadata } from "next";
import { MerchantCard } from "@/components/merchant/merchant-card";
import { getPublicMerchants } from "@/services/public-merchant-service";

export const metadata: Metadata = {
  title: "Daftar Merchant",
  description: "Kenali UMKM lokal yang bergabung di Sungairujing Marketplace.",
  alternates: { canonical: "/merchants" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: "Merchant Sungairujing Marketplace",
    description:
      "Kenali UMKM lokal yang bergabung di Sungairujing Marketplace.",
  },
};

export default async function MerchantsPage() {
  const result = await getPublicMerchants()
    .then((merchants) => ({ merchants, unavailable: false as const }))
    .catch(() => ({ merchants: [], unavailable: true as const }));

  return (
    <main id="main-content" className="bg-neutral-50">
      <div className="mx-auto max-w-(--container-app) px-4 py-10 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold text-brand-700">
            UMKM Desa Sungairujing
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Semua Merchant
          </h1>
          <p className="mt-3 leading-7 text-neutral-600">
            Temukan profil dan produk dari merchant lokal Sungairujing.
          </p>
        </header>

        {result.unavailable ? (
          <div
            role="alert"
            className="mt-8 max-w-2xl rounded-lg border border-error-border bg-error-bg p-5 text-error-text"
          >
            Daftar merchant belum dapat dimuat. Silakan coba lagi beberapa saat
            lagi.
          </div>
        ) : result.merchants.length > 0 ? (
          <section
            aria-label="Daftar merchant"
            className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {result.merchants.map((merchant) => (
              <MerchantCard key={merchant.id} merchant={merchant} />
            ))}
          </section>
        ) : (
          <div className="mt-8 rounded-lg border border-neutral-200 bg-white px-6 py-12 text-center">
            <h2 className="text-lg font-semibold">Belum ada merchant publik</h2>
            <p className="mt-2 text-neutral-600">
              Daftar merchant belum tersedia saat ini.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
