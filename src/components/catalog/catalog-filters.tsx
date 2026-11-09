import Link from "next/link";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import type { CatalogQuery } from "@/features/catalog/catalog-query";
import type { PublicCatalogFilterOptions } from "@/repositories/public-catalog-repository";

export function CatalogFilters({
  query,
  options,
}: {
  query: CatalogQuery;
  options: PublicCatalogFilterOptions;
}) {
  const fieldClass =
    "min-h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 transition-colors focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <form
      action="/products"
      method="get"
      role="search"
      aria-label="Cari dan filter produk"
      className="overflow-hidden rounded-xl border border-brand-100 bg-white shadow-sm"
    >
      <div className="flex items-start gap-3 border-b border-brand-100 bg-cream-50 px-4 py-4 sm:px-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-yellow-100 text-brand-700">
          <SlidersHorizontal aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2 className="font-bold text-brand-900">Cari dan filter</h2>
          <p className="mt-0.5 text-sm text-neutral-600">
            Persempit hasil berdasarkan kebutuhan Anda.
          </p>
        </div>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-4">
          <label htmlFor="catalog-search" className="text-sm font-semibold">
            Cari produk atau merchant
          </label>
          <div className="relative mt-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
            />
            <input
              id="catalog-search"
              name="q"
              type="search"
              maxLength={100}
              defaultValue={query.q}
              placeholder="Cari produk atau merchant..."
              className={`${fieldClass} pl-10`}
            />
          </div>
        </div>

        <FilterSelect
          id="category"
          label="Kategori"
          defaultValue={query.category}
          options={options.categories}
          emptyLabel="Semua kategori"
          className={fieldClass}
        />
        <FilterSelect
          id="merchant"
          label="Merchant"
          defaultValue={query.merchant}
          options={options.merchants}
          emptyLabel="Semua merchant"
          className={fieldClass}
        />
        <div>
          <label htmlFor="availability" className="text-sm font-semibold">
            Ketersediaan
          </label>
          <select
            id="availability"
            name="availability"
            defaultValue={query.availability?.toLowerCase() ?? ""}
            className={`${fieldClass} mt-1`}
          >
            <option value="">Semua status</option>
            <option value="tersedia">Tersedia</option>
            <option value="habis">Habis</option>
          </select>
        </div>
        <div>
          <label htmlFor="sort" className="text-sm font-semibold">
            Urutkan
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={query.sort}
            className={`${fieldClass} mt-1`}
          >
            <option value="newest">Terbaru</option>
            <option value="price_asc">Harga terendah</option>
            <option value="price_desc">Harga tertinggi</option>
          </select>
        </div>
        <div>
          <label htmlFor="minPrice" className="text-sm font-semibold">
            Harga minimum
          </label>
          <input
            id="minPrice"
            name="minPrice"
            type="number"
            min="0"
            step="1"
            defaultValue={query.minPrice}
            className={`${fieldClass} mt-1`}
          />
        </div>
        <div>
          <label htmlFor="maxPrice" className="text-sm font-semibold">
            Harga maksimum
          </label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            min="0"
            step="1"
            defaultValue={query.maxPrice}
            className={`${fieldClass} mt-1`}
          />
        </div>
        <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row lg:col-span-4">
          <button
            type="submit"
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:flex-none"
          >
            <Search aria-hidden="true" className="size-4" />
            Terapkan filter
          </button>
          <Link
            href="/products"
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-300 px-5 font-semibold text-neutral-700 transition-colors hover:border-orange-200 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:flex-none"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Reset filter
          </Link>
        </div>
      </div>
    </form>
  );
}

function FilterSelect({
  id,
  label,
  defaultValue,
  options,
  emptyLabel,
  className,
}: {
  id: string;
  label: string;
  defaultValue?: string;
  options: { name: string; slug: string }[];
  emptyLabel: string;
  className: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <select
        id={id}
        name={id}
        defaultValue={defaultValue ?? ""}
        className={`${className} mt-1`}
      >
        <option value="">{emptyLabel}</option>
        {options.map((option) => (
          <option key={option.slug} value={option.slug}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
