import Link from "next/link";
import { ChevronRight, Flag } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { getReportsForAdmin } from "@/services/moderation-service";

export default async function ReportsPage() {
  const reports = await getReportsForAdmin();
  return (
    <div className="space-y-8">
      <PageHeader
        title="Laporan publik"
        description="Tinjau sinyal dari pengunjung. Laporan tidak otomatis membekukan target."
        actions={
          <span className="inline-flex min-h-10 items-center rounded-full border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700">
            {reports.length} laporan
          </span>
        }
      />
      {reports.length ? (
        <ul className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          {reports.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-4 border-b border-neutral-200 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:p-5"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-warning-bg text-warning-text">
                  <Flag aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold text-neutral-900">
                    {item.targetNameSnapshot}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={item.status} />
                    <span className="text-sm text-neutral-600">
                      {item.targetType} · {item.reason.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={`/admin/reports/${item.id}`}
                className="inline-flex min-h-11 items-center justify-center gap-1 rounded-md border border-brand-200 px-4 text-sm font-bold text-brand-700 hover:bg-brand-50"
              >
                Tinjau
                <ChevronRight aria-hidden="true" className="size-4" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <section className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center">
          <Flag
            aria-hidden="true"
            className="mx-auto size-8 text-neutral-400"
          />
          <h2 className="mt-3 font-bold text-neutral-900">Belum ada laporan</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Laporan dari pengunjung akan tampil di sini.
          </p>
        </section>
      )}
    </div>
  );
}
