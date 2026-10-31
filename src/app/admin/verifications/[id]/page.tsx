import { notFound } from "next/navigation";
import { ExternalLink, FileCheck2, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { VerificationReviewForm } from "@/components/admin/verification-review-form";
import { createAuthorizedEvidenceSignedUrl } from "@/services/private-evidence-service";
import {
  getVerificationForReview,
  VerificationNotFoundError,
} from "@/services/merchant-verification-service";

export default async function VerificationReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let submission;
  try {
    submission = await getVerificationForReview(id);
  } catch (error) {
    if (error instanceof VerificationNotFoundError) notFound();
    throw error;
  }
  const evidenceLinks = await Promise.all(
    submission.evidences.map(async (item) => ({
      ...item,
      url: await createAuthorizedEvidenceSignedUrl(item.id),
    })),
  );
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="Tinjau pengajuan"
        title={submission.merchant.name}
        description="Periksa informasi merchant dan bukti usaha privat sebelum mengambil keputusan."
        backHref="/admin/verifications"
        backLabel="Daftar verifikasi"
        actions={<StatusBadge status={submission.status} />}
      />
      <section className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-bold text-neutral-900">
            Informasi merchant
          </h2>
        </div>
        <dl className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <dt className="flex items-center gap-2 text-sm font-semibold text-neutral-500">
              <Phone aria-hidden="true" className="size-4" /> WhatsApp publik
            </dt>
            <dd className="mt-1 font-semibold text-neutral-900">
              {submission.merchant.publicWhatsappNumber}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-sm font-semibold text-neutral-500">
              <MapPin aria-hidden="true" className="size-4" /> Alamat
            </dt>
            <dd className="mt-1 font-semibold text-neutral-900">
              {submission.merchant.address}
            </dd>
          </div>
        </dl>
      </section>
      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-info-bg text-info-text">
            <FileCheck2 aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              Bukti usaha privat
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Tautan bersifat sementara dan hanya tersedia bagi pengguna
              berwenang.
            </p>
          </div>
        </div>
        <ul className="mt-3 space-y-2">
          {evidenceLinks.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="min-w-0 truncate font-semibold text-neutral-800">
                {item.originalFilename}
              </span>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-brand-200 px-4 text-sm font-bold text-brand-700 hover:bg-brand-50"
              >
                Buka bukti
                <ExternalLink aria-hidden="true" className="size-4" />
              </a>
            </li>
          ))}
        </ul>
      </section>
      {submission.status === "PENDING" ? (
        <VerificationReviewForm submissionId={submission.id} />
      ) : (
        <section className="rounded-lg border border-neutral-200 bg-neutral-100 p-5">
          <p className="font-semibold text-neutral-800">
            Pengajuan ini sudah diproses: {submission.status}.
          </p>
        </section>
      )}
    </div>
  );
}
