import Link from "next/link";
import { notFound } from "next/navigation";
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
    <main className="px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/admin/merchants">← Merchant</Link>
        <h1 className="text-3xl font-bold">{m.name}</h1>
        <form
          action={updateMerchantAction.bind(null, id)}
          className="grid gap-4 rounded-lg border bg-white p-5"
        >
          <label>
            Nama
            <input
              name="name"
              required
              defaultValue={m.name}
              className="mt-1 block min-h-11 w-full rounded-md border px-3"
            />
          </label>
          <label>
            Deskripsi
            <textarea
              name="description"
              defaultValue={m.description ?? ""}
              className="mt-1 block w-full rounded-md border p-3"
            />
          </label>
          <label>
            Alamat
            <textarea
              name="address"
              required
              defaultValue={m.address}
              className="mt-1 block w-full rounded-md border p-3"
            />
          </label>
          <label>
            Status operasional
            <select
              name="operationalStatus"
              defaultValue={m.operationalStatus}
              className="mt-1 block min-h-11 w-full rounded-md border px-3"
            >
              <option value="BUKA">Buka</option>
              <option value="TUTUP">Tutup</option>
              <option value="LIBUR_SEMENTARA">Libur sementara</option>
            </select>
          </label>
          <label>
            WhatsApp login dan publik
            <input
              name="whatsapp"
              required
              defaultValue={m.publicWhatsappNumber}
              className="mt-1 block min-h-11 w-full rounded-md border px-3"
            />
          </label>
          <button className="min-h-11 rounded-md bg-brand-700 text-white">
            Simpan perubahan
          </button>
        </form>
        <form
          action={deleteMerchantAction.bind(null, id)}
          className="rounded-lg border border-error-border p-5"
        >
          <h2 className="font-bold">Hapus permanen</h2>
          <p className="text-sm">
            Ketik HAPUS {m.name}. Snapshot laporan tetap dipertahankan.
          </p>
          <input
            name="confirmation"
            required
            className="mt-3 min-h-11 w-full rounded-md border px-3"
          />
          <button className="mt-3 min-h-11 rounded-md bg-error-text px-4 text-white">
            Hapus merchant permanen
          </button>
        </form>
      </div>
    </main>
  );
}
