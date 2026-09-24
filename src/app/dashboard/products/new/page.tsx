import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "@/components/dashboard/product-form";
import { getProductFormCategories } from "@/services/merchant-product-service";
import { getMerchantDashboardAccess } from "@/services/merchant-dashboard-access-service";

export const metadata: Metadata = { title: "Tambah Produk" };

export default async function NewProductPage() {
  const [categories, access] = await Promise.all([
    getProductFormCategories(),
    getMerchantDashboardAccess(),
  ]);
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/products"
          className="font-semibold text-brand-700 underline-offset-4 hover:underline"
        >
          ← Kembali ke produk
        </Link>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">
          Tambah Produk
        </h1>
        <p className="mt-3 text-neutral-600">
          Isi informasi produk dan tambahkan hingga lima foto bila tersedia.
        </p>
        {access.readOnly ? (
          <p
            role="status"
            className="mt-8 rounded-md border border-warning-border bg-warning-bg p-4 text-warning-text"
          >
            Produk baru tidak dapat dibuat selama akun merchant dibekukan.
          </p>
        ) : categories.length > 0 ? (
          <ProductForm categories={categories} />
        ) : (
          <p
            role="alert"
            className="mt-8 rounded-md border border-warning-border bg-warning-bg p-4 text-warning-text"
          >
            Belum ada kategori aktif. Produk belum dapat dibuat.
          </p>
        )}
      </div>
    </main>
  );
}
