import Link from "next/link";
import {
  deleteBannerAction,
  saveBannerAction,
} from "@/features/admin-content/actions";
import { getBanners } from "@/services/admin-content-service";
const Form = ({
  item,
}: {
  item?: Awaited<ReturnType<typeof getBanners>>[number];
}) => (
  <form
    action={saveBannerAction}
    className="grid gap-3 rounded-lg border bg-white p-4 sm:grid-cols-2"
  >
    <input type="hidden" name="id" value={item?.id ?? ""} />
    <label>
      Judul
      <input
        name="title"
        required
        defaultValue={item?.title}
        className="mt-1 block min-h-11 w-full rounded-md border px-3"
      />
    </label>
    <label>
      Gambar {item ? "(opsional saat edit)" : ""}
      <input
        name="image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required={!item}
        className="mt-1 block w-full"
      />
    </label>
    <label>
      Deskripsi
      <input
        name="description"
        defaultValue={item?.description ?? ""}
        className="mt-1 block min-h-11 w-full rounded-md border px-3"
      />
    </label>
    <label>
      Teks tombol
      <input
        name="ctaText"
        defaultValue={item?.ctaText ?? ""}
        className="mt-1 block min-h-11 w-full rounded-md border px-3"
      />
    </label>
    <label>
      URL tujuan
      <input
        name="targetUrl"
        defaultValue={item?.targetUrl ?? ""}
        className="mt-1 block min-h-11 w-full rounded-md border px-3"
      />
    </label>
    <label>
      Mulai
      <input
        name="startAt"
        type="datetime-local"
        className="mt-1 block min-h-11 w-full rounded-md border px-3"
      />
    </label>
    <label>
      Selesai
      <input
        name="endAt"
        type="datetime-local"
        className="mt-1 block min-h-11 w-full rounded-md border px-3"
      />
    </label>
    <label>
      <input name="isActive" type="checkbox" defaultChecked={item?.isActive} />{" "}
      Aktif
    </label>
    <button className="min-h-11 rounded-md bg-brand-700 text-white">
      Simpan banner
    </button>
  </form>
);
export default async function Page() {
  const items = await getBanners();
  return (
    <main className="px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <Link href="/admin">← Admin</Link>
        <h1 className="text-3xl font-bold">Banner</h1>
        <Form />
        {items.map((i) => (
          <section key={i.id}>
            <Form item={i} />
            <form action={deleteBannerAction}>
              <input type="hidden" name="id" value={i.id} />
              <button className="mt-2 font-semibold text-error-text">
                Hapus banner
              </button>
            </form>
          </section>
        ))}
      </div>
    </main>
  );
}
