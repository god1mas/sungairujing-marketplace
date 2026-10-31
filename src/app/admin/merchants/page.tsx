import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { getMerchants } from "@/services/admin-content-service";

export default async function Page() {
  const items = await getMerchants();
  return (
    <div className="space-y-8">
      <PageHeader
        title="Merchant"
        description="Tinjau profil, status, dan jumlah produk setiap merchant terdaftar."
        actions={
          <span className="inline-flex min-h-10 items-center rounded-full border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700">
            {items.length} merchant
          </span>
        }
      />
      {items.length ? (
        <ul className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          {items.map((m) => (
            <li
              key={m.id}
              className="flex flex-col gap-4 border-b border-neutral-200 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:p-5"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                  <Store aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold text-neutral-900">
                    {m.name}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={m.status} />
                    <span className="text-sm text-neutral-600">
                      {m._count.products} produk
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={`/admin/merchants/${m.id}`}
                className="inline-flex min-h-11 items-center justify-center gap-1 rounded-md border border-brand-200 px-4 text-sm font-bold text-brand-700 hover:bg-brand-50"
              >
                Kelola
                <ChevronRight aria-hidden="true" className="size-4" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <section className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center">
          <Store
            aria-hidden="true"
            className="mx-auto size-8 text-neutral-400"
          />
          <h2 className="mt-3 font-bold text-neutral-900">
            Belum ada merchant
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Merchant yang terdaftar akan muncul di sini.
          </p>
        </section>
      )}
    </div>
  );
}
