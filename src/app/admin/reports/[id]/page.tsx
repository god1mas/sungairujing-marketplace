import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ReportStatusForm,
  TargetModerationForm,
} from "@/components/admin/moderation-forms";
import {
  getReportForAdmin,
  ModerationNotFoundError,
} from "@/services/moderation-service";
export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getReportForAdmin(id).catch((error) => {
    if (error instanceof ModerationNotFoundError) return null;
    throw error;
  });
  if (!result) notFound();
  const { report, history } = result;
  return (
    <main className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/admin/reports" className="font-semibold text-brand-700">
          ← Daftar laporan
        </Link>
        <header>
          <p className="text-sm font-semibold text-brand-700">
            {report.targetType} · {report.status}
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            {report.targetNameSnapshot}
          </h1>
        </header>
        <section className="rounded-lg border bg-white p-5">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="font-semibold">Alasan</dt>
              <dd>{report.reason}</dd>
            </div>
            <div>
              <dt className="font-semibold">Dikirim</dt>
              <dd>{report.createdAt.toLocaleString("id-ID")}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-semibold">Detail</dt>
              <dd className="whitespace-pre-wrap">
                {report.details || "Tidak ada detail tambahan."}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Pelapor</dt>
              <dd>{report.reporterName || "Anonim"}</dd>
            </div>
            <div>
              <dt className="font-semibold">WhatsApp pelapor</dt>
              <dd>{report.reporterWhatsapp || "Tidak diberikan"}</dd>
            </div>
          </dl>
        </section>
        <ReportStatusForm reportId={id} status={report.status} />
        {report.reportedProduct &&
        report.reportedProduct.moderationStatus === "ACTIVE" ? (
          <TargetModerationForm
            reportId={id}
            actionType="SUSPEND_PRODUCT"
            targetId={report.reportedProduct.id}
            label="Bekukan produk"
          />
        ) : null}
        {report.reportedMerchant?.status === "ACTIVE" &&
        report.targetType === "MERCHANT" ? (
          <TargetModerationForm
            reportId={id}
            actionType="SUSPEND_MERCHANT"
            targetId={report.reportedMerchant.id}
            label="Bekukan merchant"
          />
        ) : null}
        {report.reportedMerchant?.status === "SUSPENDED" &&
        report.targetType === "MERCHANT" ? (
          <TargetModerationForm
            reportId={id}
            actionType="REACTIVATE_MERCHANT"
            targetId={report.reportedMerchant.id}
            label="Aktifkan kembali merchant"
          />
        ) : null}
        <section>
          <h2 className="text-xl font-bold">Riwayat moderasi</h2>
          {history.length ? (
            <ul className="mt-3 space-y-2">
              {history.map((item) => (
                <li key={item.id} className="rounded-md border bg-white p-3">
                  <strong>{item.actionType}</strong>
                  <p>{item.reason || "Tanpa alasan"}</p>
                  <p className="text-sm text-neutral-600">
                    {item.createdAt.toLocaleString("id-ID")}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-neutral-600">
              Belum ada tindakan moderasi.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
