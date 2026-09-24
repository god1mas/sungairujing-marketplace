import type { Metadata } from "next";
import Link from "next/link";
import { MerchantProductList } from "@/components/dashboard/merchant-product-list";
import { getMerchantProducts } from "@/services/merchant-product-service";
import { getMerchantDashboardAccess } from "@/services/merchant-dashboard-access-service";

export const metadata: Metadata = { title: "Produk Merchant" };

export default async function MerchantProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const [products, query, access] = await Promise.all([
    getMerchantProducts(),
    searchParams,
    getMerchantDashboardAccess(),
  ]);

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand-700">Produk</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Kelola Produk
            </h1>
            <p className="mt-3 text-neutral-600">
              Produk aktif, habis, dan dibekukan tetap terlihat di area ini.
            </p>
          </div>
          {!access.readOnly ? (
            <Link
              href="/dashboard/products/new"
              className="inline-flex min-h-11 items-center rounded-md bg-brand-700 px-5 font-semibold text-white"
            >
              Tambah Produk
            </Link>
          ) : null}
        </div>

        {query.created === "1" ? (
          <p
            role="status"
            className="mt-6 rounded-md border border-success-border bg-success-bg p-3 text-success-text"
          >
            Produk berhasil dibuat dan langsung aktif tanpa antrean persetujuan.
          </p>
        ) : null}

        <MerchantProductList products={products} readOnly={access.readOnly} />
      </div>
    </main>
  );
}
