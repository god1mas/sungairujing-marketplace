import { ImageIcon, Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
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
  <form action={saveBannerAction} className="grid gap-4 sm:grid-cols-2">
    <input type="hidden" name="id" value={item?.id ?? ""} />
    <label className="text-sm font-semibold text-neutral-800">
      Judul
      <input
        name="title"
        required
        defaultValue={item?.title}
        className="mt-2 block min-h-11 w-full rounded-md border border-neutral-300 px-3 font-normal"
      />
    </label>
    <label className="text-sm font-semibold text-neutral-800">
      Gambar {item ? "(opsional saat edit)" : ""}
      <input
        name="image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required={!item}
        className="mt-2 block min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 font-normal file:mr-3 file:border-0 file:bg-brand-50 file:px-3 file:py-1 file:font-semibold file:text-brand-700"
      />
    </label>
    <label className="text-sm font-semibold text-neutral-800">
      Deskripsi
      <input
        name="description"
        defaultValue={item?.description ?? ""}
        className="mt-2 block min-h-11 w-full rounded-md border border-neutral-300 px-3 font-normal"
      />
    </label>
    <label className="text-sm font-semibold text-neutral-800">
      Teks tombol
      <input
        name="ctaText"
        defaultValue={item?.ctaText ?? ""}
        className="mt-2 block min-h-11 w-full rounded-md border border-neutral-300 px-3 font-normal"
      />
    </label>
    <label className="text-sm font-semibold text-neutral-800 sm:col-span-2">
      URL tujuan
      <input
        name="targetUrl"
        defaultValue={item?.targetUrl ?? ""}
        className="mt-2 block min-h-11 w-full rounded-md border border-neutral-300 px-3 font-normal"
      />
    </label>
    <label className="text-sm font-semibold text-neutral-800">
      Mulai
      <input
        name="startAt"
        type="datetime-local"
        className="mt-2 block min-h-11 w-full rounded-md border border-neutral-300 px-3 font-normal"
      />
    </label>
    <label className="text-sm font-semibold text-neutral-800">
      Selesai
      <input
        name="endAt"
        type="datetime-local"
        className="mt-2 block min-h-11 w-full rounded-md border border-neutral-300 px-3 font-normal"
      />
    </label>
    <label className="flex min-h-11 items-center gap-3 rounded-md border border-neutral-200 px-3 text-sm font-semibold text-neutral-800">
      <input
        name="isActive"
        type="checkbox"
        defaultChecked={item?.isActive}
        className="size-4 accent-brand-600"
      />
      Banner aktif
    </label>
    <button className="min-h-11 rounded-md bg-brand-600 px-4 font-bold text-white hover:bg-brand-700">
      Simpan banner
    </button>
  </form>
);
export default async function Page() {
  const items = await getBanners();
  return (
    <div className="space-y-8">
      <PageHeader
        title="Banner"
        description="Kelola materi promosi yang tampil pada beranda marketplace."
        actions={
          <span className="inline-flex min-h-10 items-center rounded-full border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700">
            {items.length} banner
          </span>
        }
      />

      <section className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-start gap-3 border-b border-neutral-200 px-5 py-4 sm:px-6">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <Plus aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="font-bold text-neutral-900">Banner baru</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Unggah gambar teroptimasi dan tentukan periode tayangnya.
            </p>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <Form />
        </div>
      </section>

      <section aria-labelledby="banner-list-title">
        <h2
          id="banner-list-title"
          className="text-xl font-bold text-neutral-900"
        >
          Banner tersimpan
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Perbarui konten atau hapus banner yang tidak lagi digunakan.
        </p>
        {items.length ? (
          <div className="mt-4 space-y-4">
            {items.map((i) => (
              <section
                key={i.id}
                className="rounded-lg border border-neutral-200 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-md bg-neutral-100 text-neutral-600">
                      <ImageIcon aria-hidden="true" className="size-4" />
                    </span>
                    <h3 className="font-bold text-neutral-900">{i.title}</h3>
                  </div>
                  <StatusBadge
                    status={i.isActive ? "ACTIVE" : "INACTIVE"}
                    label={i.isActive ? "Aktif" : "Tidak aktif"}
                  />
                </div>
                <div className="p-5 sm:p-6">
                  <Form item={i} />
                  <form
                    action={deleteBannerAction}
                    className="mt-5 border-t border-neutral-200 pt-4 text-right"
                  >
                    <input type="hidden" name="id" value={i.id} />
                    <button className="min-h-11 rounded-md px-3 text-sm font-bold text-error-text hover:bg-error-bg">
                      Hapus banner
                    </button>
                  </form>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center">
            <ImageIcon
              aria-hidden="true"
              className="mx-auto size-8 text-neutral-400"
            />
            <p className="mt-3 font-bold text-neutral-900">Belum ada banner</p>
          </div>
        )}
      </section>
    </div>
  );
}
