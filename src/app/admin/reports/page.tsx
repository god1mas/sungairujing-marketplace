import Link from "next/link";
import { getReportsForAdmin } from "@/services/moderation-service";
export default async function ReportsPage() {
  const reports = await getReportsForAdmin();
  return (
    <main className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin" className="font-semibold text-brand-700">
          ← Area administrasi
        </Link>
        <h1 className="mt-3 text-3xl font-bold">Laporan publik</h1>
        <p className="mt-2 text-neutral-600">
          Tinjau sinyal dari pengunjung. Laporan tidak otomatis membekukan
          target.
        </p>
        {reports.length ? (
          <ul className="mt-6 divide-y divide-neutral-200 rounded-lg border bg-white">
            {reports.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4"
              >
                <div>
                  <p className="font-bold">{item.targetNameSnapshot}</p>
                  <p className="text-sm text-neutral-600">
                    {item.targetType} · {item.reason} · {item.status}
                  </p>
                </div>
                <Link
                  href={`/admin/reports/${item.id}`}
                  className="min-h-11 rounded-md border border-brand-700 px-4 py-2 font-semibold text-brand-700"
                >
                  Tinjau
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 rounded-lg border border-dashed p-6">
            Belum ada laporan.
          </p>
        )}
      </div>
    </main>
  );
}
