import Image from "next/image";
import Link from "next/link";
import { ImageOff, Store } from "lucide-react";
import { formatRupiah } from "@/lib/format/currency";
import type { PublicProductCard } from "@/services/public-catalog-service";

export function ProductCard({ product }: { product: PublicProductCard }) {
  const isAvailable = product.availability === "TERSEDIA";

  return (
    <article className="h-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none">
      <Link
        href={`/products/${product.slug}`}
        className="group flex h-full flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-inset"
        aria-label={`Lihat ${product.name}`}
      >
        <div className="relative aspect-square overflow-hidden bg-cream-50">
          {product.image ? (
            <Image
              src={product.image.url}
              alt={product.image.alt}
              fill
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
              className="object-cover transition-transform group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center text-xs text-neutral-500 sm:px-4 sm:text-sm">
              <ImageOff
                aria-hidden="true"
                className="size-6 text-neutral-400"
              />
              <span>Foto belum tersedia</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <h2 className="line-clamp-2 min-h-10 text-sm font-bold text-neutral-900 group-hover:text-brand-700 sm:min-h-12 sm:text-base">
            {product.name}
          </h2>
          <p className="mt-2 text-base font-bold text-brand-700 sm:text-lg">
            {formatRupiah(product.price)}
            <span className="ml-1 text-[0.6875rem] font-normal text-neutral-500 sm:text-xs">
              / {product.unit}
            </span>
          </p>
          <div className="mt-auto flex flex-col items-start gap-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex min-w-0 items-center gap-1.5 truncate text-xs text-neutral-600 sm:text-sm">
              <Store aria-hidden="true" className="size-3.5 shrink-0" />
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
