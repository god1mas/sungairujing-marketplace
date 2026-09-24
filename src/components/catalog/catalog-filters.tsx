import Link from "next/link";
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
    "min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none";

  return (
    <form
      action="/products"
      method="get"
      role="search"
      aria-label="Cari dan filter produk"
      className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-4">
          <label htmlFor="catalog-search" className="text-sm font-semibold">
            Cari produk atau merchant
          </label>
          <input
            id="catalog-search"
            name="q"
            type="search"
            maxLength={100}
            defaultValue={query.q}
            placeholder="Cari produk atau merchant..."
            className={`${fieldClass} mt-1`}
          />
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
            defaultValue={query.availability ?? ""}
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
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          className="min-h-11 rounded-md bg-brand-600 px-5 font-semibold text-white hover:bg-brand-700"
        >
          Terapkan
        </button>
        <Link
          href="/products"
          className="inline-flex min-h-11 items-center rounded-md border border-neutral-300 px-5 font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Reset filter
        </Link>
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
