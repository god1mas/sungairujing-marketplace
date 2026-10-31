import Link from "next/link";
import { BadgeCheck, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { getPendingVerifications } from "@/services/merchant-verification-service";

export default async function AdminVerificationsPage() {
  const submissions = await getPendingVerifications();
  return (
    <div className="space-y-8">
      <PageHeader
        title="Verifikasi merchant"
        description="Tinjau pengajuan berdasarkan urutan masuk. Verifikasi tidak menghalangi merchant untuk berjualan."
        actions={
          <span className="inline-flex min-h-10 items-center rounded-full border border-warning-border bg-warning-bg px-3 text-sm font-semibold text-warning-text">
            {submissions.length} menunggu
          </span>
        }
      />
      {submissions.length === 0 ? (
        <section className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center">
          <BadgeCheck
            aria-hidden="true"
            className="mx-auto size-8 text-neutral-400"
          />
          <h2 className="mt-3 font-bold text-neutral-900">
            Antrean verifikasi kosong
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Tidak ada pengajuan yang menunggu peninjauan.
          </p>
        </section>
      ) : (
        <ul className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          {submissions.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-4 border-b border-neutral-200 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:p-5"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-warning-bg text-warning-text">
                  <BadgeCheck aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <p className="font-bold text-neutral-900">
                    {item.merchant.name}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status="PENDING" label="Menunggu" />
                    <span className="text-sm text-neutral-600">
                      {item._count.evidences} bukti ·{" "}
                      {new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "medium",
                      }).format(item.submittedAt)}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={`/admin/verifications/${item.id}`}
                className="inline-flex min-h-11 items-center justify-center gap-1 rounded-md border border-brand-200 px-4 text-sm font-bold text-brand-700 hover:bg-brand-50"
              >
                Tinjau
                <ChevronRight aria-hidden="true" className="size-4" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
