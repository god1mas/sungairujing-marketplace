import { VerificationSubmissionStatus } from "@prisma/client";
import { VerificationUploadForm } from "@/components/dashboard/verification-upload-form";
import { getMerchantVerification } from "@/services/merchant-verification-service";

const labels = {
  BELUM_DIVERIFIKASI: "Belum diverifikasi",
  TERVERIFIKASI: "Terverifikasi",
  DITOLAK: "Ditolak",
} as const;
const submissionLabels = {
  PENDING: "Menunggu peninjauan",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
} as const;
const date = (value: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);

export default async function MerchantVerificationPage() {
  const merchant = await getMerchantVerification();
  const hasPending = merchant.verificationSubmissions.some(
    (item) => item.status === VerificationSubmissionStatus.PENDING,
  );
  const canSubmit =
    merchant.verificationStatus !== "TERVERIFIKASI" && !hasPending;
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold text-brand-700">Merchant</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">
          Verifikasi merchant
        </h1>
        <p className="mt-2 text-neutral-600">
          Verifikasi bersifat non-blocking. Merchant tetap dapat berjualan
          selama proses peninjauan.
        </p>
        <section
          aria-labelledby="current-status"
          className="mt-6 rounded-lg border border-neutral-200 bg-white p-5"
        >
          <h2
            id="current-status"
            className="text-lg font-bold text-neutral-900"
          >
            Status saat ini
          </h2>
          <p className="mt-2 inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-800">
            {labels[merchant.verificationStatus]}
          </p>
          {merchant.verificationStatus === "DITOLAK" &&
          merchant.verificationSubmissions[0]?.rejectionReason ? (
            <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
              <strong>Alasan:</strong>{" "}
              {merchant.verificationSubmissions[0].rejectionReason}
            </p>
          ) : null}
          {hasPending ? (
            <p className="mt-3 text-sm text-neutral-600">
              Pengajuan sedang ditinjau Super Admin. Evidence tidak dapat
              diganti selama peninjauan.
            </p>
          ) : null}
        </section>
        {canSubmit ? <VerificationUploadForm /> : null}
        <section aria-labelledby="history" className="mt-8">
          <h2 id="history" className="text-xl font-bold text-neutral-900">
            Riwayat pengajuan
          </h2>
          {merchant.verificationSubmissions.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed border-neutral-300 p-5 text-neutral-600">
              Belum ada pengajuan verifikasi.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {merchant.verificationSubmissions.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-neutral-200 bg-white p-4"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <strong>{submissionLabels[item.status]}</strong>
                    <time
                      dateTime={item.submittedAt.toISOString()}
                      className="text-sm text-neutral-500"
                    >
                      {date(item.submittedAt)}
                    </time>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600">
                    {item.evidences.length} berkas bukti
                  </p>
                  {item.rejectionReason ? (
                    <p className="mt-2 text-sm text-red-700">
                      Alasan: {item.rejectionReason}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
