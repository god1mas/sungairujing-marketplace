import { notFound } from "next/navigation";
import { AlertTriangle, Save } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  deleteMerchantAction,
  updateMerchantAction,
} from "@/features/admin-content/actions";
import { getMerchant } from "@/services/admin-content-service";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const m = await getMerchant(id);
  if (!m) notFound();
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        eyebrow="Kelola merchant"
        title={m.name}
        description="Perbarui informasi publik dan status operasional merchant."
        backHref="/admin/merchants"
        backLabel="Daftar merchant"
        actions={<StatusBadge status={m.status} />}
      />
      <section className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-bold text-neutral-900">
            Informasi merchant
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Data ini digunakan pada profil publik merchant.
          </p>
        </div>
        <form
          action={updateMerchantAction.bind(null, id)}
          className="grid gap-5 p-5 sm:p-6"
        >
          <label className="font-semibold text-neutral-800">
            Nama merchant
            <input
              name="name"
              required
              defaultValue={m.name}
              className="mt-2 block min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 font-normal"
            />
          </label>
          <label className="font-semibold text-neutral-800">
            Deskripsi
            <textarea
              name="description"
              defaultValue={m.description ?? ""}
              rows={4}
              className="mt-2 block w-full rounded-md border border-neutral-300 bg-white p-3 font-normal"
            />
          </label>
          <label className="font-semibold text-neutral-800">
            Alamat
            <textarea
              name="address"
              required
              defaultValue={m.address}
              rows={3}
              className="mt-2 block w-full rounded-md border border-neutral-300 bg-white p-3 font-normal"
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="font-semibold text-neutral-800">
              Status operasional
              <select
                name="operationalStatus"
                defaultValue={m.operationalStatus}
                className="mt-2 block min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 font-normal"
              >
                <option value="BUKA">Buka</option>
                <option value="TUTUP">Tutup</option>
                <option value="LIBUR_SEMENTARA">Libur sementara</option>
              </select>
            </label>
            <label className="font-semibold text-neutral-800">
              WhatsApp login dan publik
              <input
                name="whatsapp"
                required
                defaultValue={m.publicWhatsappNumber}
                className="mt-2 block min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 font-normal"
              />
            </label>
          </div>
          <div className="flex justify-end border-t border-neutral-200 pt-5">
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-600 px-5 font-bold text-white hover:bg-brand-700">
              <Save aria-hidden="true" className="size-4" />
              Simpan perubahan
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-error-border bg-error-bg p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-error-text"
          />
          <div>
            <h2 className="font-bold text-error-text">Zona berisiko</h2>
            <p className="mt-1 text-sm leading-6 text-neutral-700">
              Penghapusan merchant bersifat permanen. Snapshot laporan tetap
              dipertahankan sesuai aturan moderasi.
            </p>
          </div>
        </div>
        <form
          action={deleteMerchantAction.bind(null, id)}
          className="mt-5 border-t border-error-border pt-5"
        >
          <label
            htmlFor="merchant-delete-confirmation"
            className="font-semibold text-neutral-800"
          >
            Ketik <strong>HAPUS {m.name}</strong> untuk melanjutkan
          </label>
          <input
            id="merchant-delete-confirmation"
            name="confirmation"
            required
            autoComplete="off"
            className="mt-2 min-h-11 w-full rounded-md border border-error-border bg-white px-3 sm:max-w-xl"
          />
          <p className="mt-2 text-sm text-neutral-600">
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <button className="mt-4 min-h-11 rounded-md bg-error-text px-4 font-bold text-white hover:bg-red-800">
            Hapus merchant permanen
          </button>
        </form>
      </section>
    </div>
  );
}
