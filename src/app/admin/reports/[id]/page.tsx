import { notFound } from "next/navigation";
import { Clock3, FileText, UserRound } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
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
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow={`Laporan ${report.targetType.toLowerCase()}`}
        title={report.targetNameSnapshot}
        description="Tinjau detail laporan dan tentukan tindakan secara manual."
        backHref="/admin/reports"
        backLabel="Daftar laporan"
        actions={<StatusBadge status={report.status} />}
      />
      <section className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-bold text-neutral-900">
            Informasi laporan
          </h2>
        </div>
        <dl className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <dt className="flex items-center gap-2 text-sm font-semibold text-neutral-500">
              <FileText aria-hidden="true" className="size-4" /> Alasan
            </dt>
            <dd className="mt-1 font-semibold text-neutral-900">
              {report.reason.replaceAll("_", " ")}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-sm font-semibold text-neutral-500">
              <Clock3 aria-hidden="true" className="size-4" /> Dikirim
            </dt>
            <dd className="mt-1 font-semibold text-neutral-900">
              {report.createdAt.toLocaleString("id-ID")}
            </dd>
          </div>
          <div className="rounded-md bg-neutral-50 p-4 sm:col-span-2">
            <dt className="text-sm font-semibold text-neutral-500">Detail</dt>
            <dd className="mt-2 whitespace-pre-wrap text-neutral-800">
              {report.details || "Tidak ada detail tambahan."}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-sm font-semibold text-neutral-500">
              <UserRound aria-hidden="true" className="size-4" /> Pelapor
            </dt>
            <dd className="mt-1 font-semibold text-neutral-900">
              {report.reporterName || "Anonim"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-neutral-500">
              WhatsApp pelapor
            </dt>
            <dd className="mt-1 font-semibold text-neutral-900">
              {report.reporterWhatsapp || "Tidak diberikan"}
            </dd>
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
      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold">Riwayat moderasi</h2>
        {history.length ? (
          <ul className="mt-3 space-y-2">
            {history.map((item) => (
              <li
                key={item.id}
                className="rounded-md border border-neutral-200 bg-neutral-50 p-4"
              >
                <strong className="text-neutral-900">{item.actionType}</strong>
                <p className="mt-1 text-neutral-700">
                  {item.reason || "Tanpa alasan"}
                </p>
                <p className="text-sm text-neutral-600">
                  {item.createdAt.toLocaleString("id-ID")}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-neutral-600">Belum ada tindakan moderasi.</p>
        )}
      </section>
    </div>
  );
}
