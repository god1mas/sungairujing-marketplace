import Image from "next/image";
import Link from "next/link";
import { formatRupiah } from "@/lib/format/currency";
import type { PublicProductCard } from "@/services/public-catalog-service";

export function ProductCard({ product }: { product: PublicProductCard }) {
  const isAvailable = product.availability === "TERSEDIA";

  return (
    <article className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <Link
        href={`/products/${product.slug}`}
        className="group block focus:outline-none"
        aria-label={`Lihat ${product.name}`}
      >
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          {product.image ? (
            <Image
              src={product.image.url}
              alt={product.image.alt}
              fill
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
              className="object-cover transition-transform group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-neutral-500">
              Foto belum tersedia
            </div>
          )}
        </div>
        <div className="p-4">
          <h2 className="line-clamp-2 min-h-12 font-semibold text-neutral-900 group-hover:text-brand-700">
            {product.name}
          </h2>
          <p className="mt-2 text-lg font-bold text-brand-700">
            {formatRupiah(product.price)}
            <span className="ml-1 text-xs font-normal text-neutral-500">
              / {product.unit}
            </span>
          </p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="truncate text-sm text-neutral-600">
              {product.merchant.name}
            </p>
            <span
              className={`shrink-0 rounded-sm border px-2 py-1 text-xs font-semibold ${
                isAvailable
                  ? "border-success-border bg-success-bg text-success-text"
                  : "border-warning-border bg-warning-bg text-warning-text"
              }`}
            >
              {isAvailable ? "Tersedia" : "Habis"}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
