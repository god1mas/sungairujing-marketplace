import Link from "next/link";
import { getPendingVerifications } from "@/services/merchant-verification-service";

export default async function AdminVerificationsPage() {
  const submissions = await getPendingVerifications();
  return (
    <main className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin" className="text-sm font-semibold text-brand-700">
          ← Area administrasi
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-neutral-900">
          Verifikasi merchant
        </h1>
        <p className="mt-2 text-neutral-600">
          Tinjau pengajuan berdasarkan urutan masuk.
        </p>
        {submissions.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-neutral-300 p-6 text-neutral-600">
            Tidak ada pengajuan yang menunggu peninjauan.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
            {submissions.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4"
              >
                <div>
                  <p className="font-bold text-neutral-900">
                    {item.merchant.name}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {item._count.evidences} bukti ·{" "}
                    {new Intl.DateTimeFormat("id-ID", {
                      dateStyle: "medium",
                    }).format(item.submittedAt)}
                  </p>
                </div>
                <Link
                  href={`/admin/verifications/${item.id}`}
                  className="min-h-11 rounded-md border border-brand-700 px-4 py-2 font-semibold text-brand-700"
                >
                  Tinjau
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
