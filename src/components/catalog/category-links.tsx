import Link from "next/link";
import { ArrowUpRight, Tags } from "lucide-react";
import { SectionHeading } from "@/components/public/section-heading";
import type { PublicCatalogFilterOptions } from "@/repositories/public-catalog-repository";

const categoryToneClasses = [
  "border-brand-200 bg-brand-50 text-brand-800",
  "border-accent-yellow/50 bg-accent-yellow/15 text-brand-900",
  "border-accent-orange/50 bg-accent-orange/15 text-brand-900",
] as const;

export function CategoryLinks({
  categories,
}: {
  categories: PublicCatalogFilterOptions["categories"];
}) {
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="categories-title" className="bg-cream-50">
      <div className="mx-auto max-w-(--container-app) px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SectionHeading
          id="categories-title"
          eyebrow="Temukan lebih cepat"
          title="Jelajahi Kategori"
          description="Pilih kategori untuk menemukan produk lokal yang Anda butuhkan."
          icon={Tags}
          tone="yellow"
          action={
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center gap-2 rounded-md font-semibold text-brand-700 hover:text-brand-800"
            >
              Semua produk
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          }
        />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {categories.map((category, index) => (
            <Link
              key={category.slug}
              href={`/products?category=${encodeURIComponent(category.slug)}`}
              className={`group flex min-h-20 items-center justify-between gap-2 rounded-lg border p-3 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none sm:p-4 ${categoryToneClasses[index % categoryToneClasses.length]}`}
            >
              <span className="min-w-0 break-words">{category.name}</span>
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
