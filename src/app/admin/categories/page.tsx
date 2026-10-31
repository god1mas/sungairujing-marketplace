import { FolderPlus, Shapes } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import {
  deleteCategoryAction,
  saveCategoryAction,
} from "@/features/admin-content/actions";
import { getCategories } from "@/services/admin-content-service";
export default async function Page() {
  const items = await getCategories();
  return (
    <div className="space-y-8">
      <PageHeader
        title="Kategori"
        description="Kelola kategori global yang tersedia untuk seluruh merchant."
        actions={
          <span className="inline-flex min-h-10 items-center rounded-full border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700">
            {items.length} kategori
          </span>
        }
      />

      <section className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-start gap-3 border-b border-neutral-200 px-5 py-4 sm:px-6">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <FolderPlus aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="font-bold text-neutral-900">Tambah kategori</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Nama kategori akan dinormalisasi untuk mencegah duplikasi.
            </p>
          </div>
        </div>
        <form
          action={saveCategoryAction}
          className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-[1fr_1.5fr_8rem_auto] xl:items-end"
        >
          <label className="text-sm font-semibold text-neutral-800">
            Nama kategori
            <input
              name="name"
              required
              placeholder="Contoh: Makanan"
              className="mt-2 min-h-11 w-full rounded-md border border-neutral-300 px-3 font-normal"
            />
          </label>
          <label className="text-sm font-semibold text-neutral-800">
            Deskripsi
            <input
              name="description"
              placeholder="Deskripsi singkat"
              className="mt-2 min-h-11 w-full rounded-md border border-neutral-300 px-3 font-normal"
            />
          </label>
          <label className="text-sm font-semibold text-neutral-800">
            Urutan
            <input
              name="sortOrder"
              type="number"
              min="0"
              placeholder="0"
              className="mt-2 min-h-11 w-full rounded-md border border-neutral-300 px-3 font-normal"
            />
          </label>
          <button className="min-h-11 rounded-md bg-brand-600 px-4 font-bold text-white hover:bg-brand-700">
            Tambah kategori
          </button>
        </form>
      </section>

      <section aria-labelledby="category-list-title">
        <div className="mb-4">
          <h2
            id="category-list-title"
            className="text-xl font-bold text-neutral-900"
          >
            Daftar kategori
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Kategori yang masih dipakai produk akan dinonaktifkan, bukan
            dihapus.
          </p>
        </div>
        {items.length ? (
          <ul className="space-y-3">
            {items.map((i) => (
              <li
                key={i.id}
                className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <form
                  action={saveCategoryAction}
                  className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1.5fr_8rem_auto] xl:items-end"
                >
                  <input type="hidden" name="id" value={i.id} />
                  <label className="text-sm font-semibold text-neutral-700">
                    Nama
                    <input
                      name="name"
                      defaultValue={i.name}
                      required
                      className="mt-2 min-h-11 w-full rounded-md border border-neutral-300 px-3 font-normal"
                    />
                  </label>
                  <label className="text-sm font-semibold text-neutral-700">
                    Deskripsi
                    <input
                      name="description"
                      defaultValue={i.description ?? ""}
                      className="mt-2 min-h-11 w-full rounded-md border border-neutral-300 px-3 font-normal"
                    />
                  </label>
                  <label className="text-sm font-semibold text-neutral-700">
                    Urutan
                    <input
                      name="sortOrder"
                      type="number"
                      defaultValue={i.sortOrder ?? ""}
                      className="mt-2 min-h-11 w-full rounded-md border border-neutral-300 px-3 font-normal"
                    />
                  </label>
                  <button className="min-h-11 rounded-md border border-brand-300 px-4 font-bold text-brand-700 hover:bg-brand-50">
                    Simpan
                  </button>
                </form>
                <form
                  action={deleteCategoryAction}
                  className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-200 pt-4"
                >
                  <input type="hidden" name="id" value={i.id} />
                  <span className="text-sm text-neutral-600">
                    {i._count.products} produk menggunakan kategori ini
                  </span>
                  <button className="min-h-11 rounded-md px-3 text-sm font-bold text-error-text hover:bg-error-bg">
                    {i._count.products ? "Nonaktifkan" : "Hapus"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center">
            <Shapes
              aria-hidden="true"
              className="mx-auto size-8 text-neutral-400"
            />
            <p className="mt-3 font-bold text-neutral-900">
              Belum ada kategori
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
