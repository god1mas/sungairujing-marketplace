import Link from "next/link";
import {
  deleteCategoryAction,
  saveCategoryAction,
} from "@/features/admin-content/actions";
import { getCategories } from "@/services/admin-content-service";
export default async function Page() {
  const items = await getCategories();
  return (
    <main className="px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin">← Admin</Link>
        <h1 className="mt-3 text-3xl font-bold">Kategori</h1>
        <form
          action={saveCategoryAction}
          className="mt-6 grid gap-3 rounded-lg border bg-white p-4 sm:grid-cols-3"
        >
          <input
            name="name"
            required
            placeholder="Nama kategori"
            className="min-h-11 rounded-md border px-3"
          />
          <input
            name="description"
            placeholder="Deskripsi"
            className="min-h-11 rounded-md border px-3"
          />
          <input
            name="sortOrder"
            type="number"
            min="0"
            placeholder="Urutan"
            className="min-h-11 rounded-md border px-3"
          />
          <button className="min-h-11 rounded-md bg-brand-700 px-4 text-white">
            Tambah kategori
          </button>
        </form>
        <ul className="mt-6 space-y-3">
          {items.map((i) => (
            <li key={i.id} className="rounded-lg border bg-white p-4">
              <form
                action={saveCategoryAction}
                className="grid gap-3 sm:grid-cols-4"
              >
                <input type="hidden" name="id" value={i.id} />
                <input
                  name="name"
                  defaultValue={i.name}
                  required
                  className="min-h-11 rounded-md border px-3"
                />
                <input
                  name="description"
                  defaultValue={i.description ?? ""}
                  className="min-h-11 rounded-md border px-3"
                />
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={i.sortOrder ?? ""}
                  className="min-h-11 rounded-md border px-3"
                />
                <button className="min-h-11 rounded-md border border-brand-700">
                  Simpan
                </button>
              </form>
              <form action={deleteCategoryAction} className="mt-2">
                <input type="hidden" name="id" value={i.id} />
                <button className="text-sm font-semibold text-error-text">
                  {i._count.products ? "Nonaktifkan" : "Hapus"} ·{" "}
                  {i._count.products} produk
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
