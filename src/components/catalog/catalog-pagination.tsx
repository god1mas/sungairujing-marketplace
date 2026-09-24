import Link from "next/link";
import {
  createCatalogHref,
  type CatalogQuery,
} from "@/features/catalog/catalog-query";

export function CatalogPagination({
  query,
  totalPages,
}: {
  query: CatalogQuery;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Paginasi produk"
      className="mt-8 flex items-center justify-between gap-4"
    >
      {query.page > 1 ? (
        <Link
          href={createCatalogHref(query, { page: query.page - 1 })}
          className="inline-flex min-h-11 items-center rounded-md border border-neutral-300 bg-white px-4 font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Sebelumnya
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-neutral-600">
        Halaman {query.page} dari {totalPages}
      </p>
      {query.page < totalPages ? (
        <Link
          href={createCatalogHref(query, { page: query.page + 1 })}
          className="inline-flex min-h-11 items-center rounded-md border border-neutral-300 bg-white px-4 font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Berikutnya
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
