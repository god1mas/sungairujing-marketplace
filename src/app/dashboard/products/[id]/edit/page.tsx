import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/dashboard/product-form";
import { ProductImageManager } from "@/components/dashboard/product-image-manager";
import { productIdSchema } from "@/features/products/product-schema";
import {
  getOwnedProductForEdit,
  getProductFormCategories,
  ProductNotFoundError,
} from "@/services/merchant-product-service";
import { getMerchantDashboardAccess } from "@/services/merchant-dashboard-access-service";

export const metadata: Metadata = { title: "Edit Produk" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = productIdSchema.safeParse(rawId);
  if (!id.success) notFound();

  const productRequest = getOwnedProductForEdit(id.data);
  let product;
  try {
    product = await productRequest;
  } catch (error) {
    if (error instanceof ProductNotFoundError) notFound();
    throw error;
  }
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
        <h1 className="mt-5 text-3xl font-bold tracking-tight">Edit Produk</h1>
        <p className="mt-3 text-neutral-600">
          Slug produk tetap dipertahankan agar tautan publik stabil.
        </p>
        {categories.length > 0 ? (
          <ProductForm
            categories={categories}
            product={product}
            readOnly={access.readOnly}
          />
        ) : (
          <p
            role="alert"
            className="mt-8 rounded-md border border-warning-border bg-warning-bg p-4 text-warning-text"
          >
            Belum ada kategori aktif. Produk belum dapat diperbarui.
          </p>
        )}
        <ProductImageManager
          productId={product.id}
          images={product.images}
          readOnly={access.readOnly}
        />
      </div>
    </main>
  );
}
