import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
      className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl border border-neutral-200 bg-white p-2 shadow-sm sm:gap-4 sm:p-3"
    >
      {query.page > 1 ? (
        <Link
          href={createCatalogHref(query, { page: query.page - 1 })}
          className="inline-flex min-h-11 items-center justify-self-start rounded-lg border border-neutral-300 bg-white px-3 font-semibold text-neutral-700 transition-colors hover:border-brand-200 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:px-4"
        >
          <ArrowLeft aria-hidden="true" className="size-4 sm:mr-2" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </Link>
      ) : (
        <span />
      )}
      <p className="text-center text-xs text-neutral-600 sm:text-sm">
        Halaman {query.page} dari {totalPages}
      </p>
      {query.page < totalPages ? (
        <Link
          href={createCatalogHref(query, { page: query.page + 1 })}
          className="inline-flex min-h-11 items-center justify-self-end rounded-lg border border-neutral-300 bg-white px-3 font-semibold text-neutral-700 transition-colors hover:border-brand-200 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:px-4"
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <ArrowRight aria-hidden="true" className="size-4 sm:ml-2" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
