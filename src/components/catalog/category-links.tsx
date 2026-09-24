import Link from "next/link";
import type { PublicCatalogFilterOptions } from "@/repositories/public-catalog-repository";

export function CategoryLinks({
  categories,
}: {
  categories: PublicCatalogFilterOptions["categories"];
}) {
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="categories-title" className="bg-neutral-50">
      <div className="mx-auto max-w-(--container-app) px-4 py-12 sm:px-6 lg:px-8">
        <h2
          id="categories-title"
          className="text-2xl font-bold tracking-tight text-neutral-900"
        >
          Jelajahi Kategori
        </h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${encodeURIComponent(category.slug)}`}
              className="inline-flex min-h-11 items-center rounded-md border border-brand-200 bg-white px-4 font-semibold text-brand-800 hover:border-brand-400 hover:bg-brand-50"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
