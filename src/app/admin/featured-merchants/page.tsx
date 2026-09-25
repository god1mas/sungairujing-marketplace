import Link from "next/link";
import {
  deleteFeaturedAction,
  saveFeaturedAction,
} from "@/features/admin-content/actions";
import { getFeatured } from "@/services/admin-content-service";
export default async function Page() {
  const [items, candidates] = await getFeatured();
  return (
    <main className="px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/admin">← Admin</Link>
        <h1 className="mt-3 text-3xl font-bold">Merchant pilihan</h1>
        <form
          action={saveFeaturedAction}
          className="mt-6 flex flex-wrap gap-3 rounded-lg border bg-white p-4"
        >
          <select
            name="merchantId"
            required
            className="min-h-11 rounded-md border px-3"
          >
            <option value="">Pilih merchant aktif</option>
            {candidates.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <input
            name="sortOrder"
            type="number"
            min="1"
            max="5"
            required
            placeholder="Posisi 1–5"
            className="min-h-11 rounded-md border px-3"
          />
          <button className="rounded-md bg-brand-700 px-4 text-white">
            Tambahkan
          </button>
        </form>
        <ul className="mt-5 space-y-2">
          {items.map((i) => (
            <li
              key={i.id}
              className="flex justify-between rounded-lg border bg-white p-4"
            >
              <span>
                {i.sortOrder}. {i.merchant.name} ({i.merchant.status})
              </span>
              <form action={deleteFeaturedAction}>
                <input type="hidden" name="id" value={i.id} />
                <button className="font-semibold text-error-text">
                  Hapus penempatan
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
