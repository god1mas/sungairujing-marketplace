import { Star, Store } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  deleteFeaturedAction,
  saveFeaturedAction,
} from "@/features/admin-content/actions";
import { getFeatured } from "@/services/admin-content-service";
export default async function Page() {
  const [items, candidates] = await getFeatured();
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        title="Merchant pilihan"
        description="Atur maksimal lima merchant aktif yang ditampilkan khusus pada beranda."
        actions={
          <span className="inline-flex min-h-10 items-center rounded-full border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700">
            {items.length}/5 terisi
          </span>
        }
      />

      <section className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-start gap-3 border-b border-neutral-200 px-5 py-4 sm:px-6">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <Star aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="font-bold text-neutral-900">Tambah penempatan</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Pilih merchant aktif dan posisi tampil dari 1 sampai 5.
            </p>
          </div>
        </div>
        <form
          action={saveFeaturedAction}
          className="grid gap-4 p-5 sm:grid-cols-[1fr_8rem_auto] sm:items-end sm:p-6"
        >
          <label className="text-sm font-semibold text-neutral-800">
            Merchant aktif
            <select
              name="merchantId"
              required
              className="mt-2 min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 font-normal"
            >
              <option value="">Pilih merchant aktif</option>
              {candidates.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-neutral-800">
            Posisi
            <input
              name="sortOrder"
              type="number"
              min="1"
              max="5"
              required
              placeholder="1–5"
              className="mt-2 min-h-11 w-full rounded-md border border-neutral-300 px-3 font-normal"
            />
          </label>
          <button className="min-h-11 rounded-md bg-brand-600 px-4 font-bold text-white hover:bg-brand-700">
            Tambahkan
          </button>
        </form>
      </section>

      <section aria-labelledby="featured-list-title">
        <h2
          id="featured-list-title"
          className="text-xl font-bold text-neutral-900"
        >
          Urutan tampil
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Merchant dibekukan tidak akan muncul publik meskipun masih tersimpan.
        </p>
        {items.length ? (
          <ul className="mt-4 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
            {items.map((i) => (
              <li
                key={i.id}
                className="flex flex-col gap-4 border-b border-neutral-200 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-md bg-brand-800 font-bold text-white">
                    {i.sortOrder}
                  </span>
                  <span className="flex size-10 items-center justify-center rounded-md bg-neutral-100 text-neutral-600">
                    <Store aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <p className="font-bold text-neutral-900">
                      {i.merchant.name}
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={i.merchant.status} />
                    </div>
                  </div>
                </div>
                <form action={deleteFeaturedAction}>
                  <input type="hidden" name="id" value={i.id} />
                  <button className="min-h-11 rounded-md px-3 text-sm font-bold text-error-text hover:bg-error-bg">
                    Hapus penempatan
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center">
            <Star
              aria-hidden="true"
              className="mx-auto size-8 text-neutral-400"
            />
            <p className="mt-3 font-bold text-neutral-900">
              Belum ada merchant pilihan
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
