import Image from "next/image";
import Link from "next/link";
import { formatRupiah } from "@/lib/format/currency";
import { DeleteProductControl } from "./delete-product-control";
import type { getMerchantProducts } from "@/services/merchant-product-service";

type Products = Awaited<ReturnType<typeof getMerchantProducts>>;

export function MerchantProductList({
  products,
  readOnly = false,
}: {
  products: Products;
  readOnly?: boolean;
}) {
  if (products.length === 0) {
    return (
      <section className="mt-8 rounded-lg border border-neutral-200 bg-white p-8 text-center">
        <h2 className="text-xl font-bold">Belum ada produk</h2>
        <p className="mt-2 text-neutral-600">
          Tambahkan produk pertama untuk mulai mengisi etalase merchant.
        </p>
        {!readOnly ? (
          <Link
            href="/dashboard/products/new"
            className="mt-5 inline-flex min-h-11 items-center rounded-md bg-brand-700 px-5 font-semibold text-white"
          >
            Tambah Produk
          </Link>
        ) : (
          <p className="mt-3 text-sm text-warning-text">
            Penambahan produk dinonaktifkan selama akun dibekukan.
          </p>
        )}
      </section>
    );
  }

  return (
    <div className="mt-6 grid gap-4">
      {products.map((product) => (
        <article
          key={product.id}
          className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-md bg-neutral-100 sm:size-28">
              {product.image ? (
                <Image
                  src={product.image.url}
                  alt={product.image.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 112px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full items-center justify-center p-3 text-center text-sm text-neutral-500">
                  Foto belum tersedia
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">{product.name}</h2>
                  <p className="mt-1 text-sm text-neutral-600">
                    {product.categoryName} · {formatRupiah(product.price)} /{" "}
                    {product.unit}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm font-semibold">
                  <span
                    className={`rounded-sm border px-2.5 py-1 ${
                      product.availabilityStatus === "TERSEDIA"
                        ? "border-success-border bg-success-bg text-success-text"
                        : "border-warning-border bg-warning-bg text-warning-text"
                    }`}
                  >
                    {product.availabilityStatus === "TERSEDIA"
                      ? "Tersedia"
                      : "Habis"}
                  </span>
                  {product.moderationStatus === "SUSPENDED" ? (
                    <span className="rounded-sm border border-error-border bg-error-bg px-2.5 py-1 text-error-text">
                      Dibekukan
                    </span>
                  ) : null}
                </div>
              </div>

              {product.moderationStatus === "SUSPENDED" ? (
                <p className="mt-3 text-sm text-error-text">
                  Produk tidak tampil secara publik.
                  {product.suspensionReason
                    ? ` Alasan: ${product.suspensionReason}`
                    : ""}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-4">
                <Link
                  href={`/dashboard/products/${product.id}/edit`}
                  className="inline-flex min-h-11 items-center rounded-md border border-neutral-300 px-4 py-2 font-semibold"
                >
                  {readOnly ? "Lihat" : "Edit"}
                </Link>
                {!readOnly ? (
                  <DeleteProductControl
                    productId={product.id}
                    productName={product.name}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
