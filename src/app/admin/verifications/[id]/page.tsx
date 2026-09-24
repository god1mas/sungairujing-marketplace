import Link from "next/link";
import { notFound } from "next/navigation";
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
    <main className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin/verifications"
          className="text-sm font-semibold text-brand-700"
        >
          ← Daftar verifikasi
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-neutral-900">
          Tinjau {submission.merchant.name}
        </h1>
        <dl className="mt-6 grid gap-4 rounded-lg border border-neutral-200 bg-white p-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-neutral-500">WhatsApp publik</dt>
            <dd className="font-semibold">
              {submission.merchant.publicWhatsappNumber}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-500">Alamat</dt>
            <dd className="font-semibold">{submission.merchant.address}</dd>
          </div>
        </dl>
        <section className="my-6">
          <h2 className="text-xl font-bold text-neutral-900">
            Bukti usaha privat
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Tautan berikut bersifat sementara dan hanya tersedia bagi pengguna
            berwenang.
          </p>
          <ul className="mt-3 space-y-2">
            {evidenceLinks.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-neutral-200 bg-white p-3"
              >
                <span>{item.originalFilename}</span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-brand-700"
                >
                  Buka bukti
                </a>
              </li>
            ))}
          </ul>
        </section>
        {submission.status === "PENDING" ? (
          <VerificationReviewForm submissionId={submission.id} />
        ) : (
          <p className="rounded-lg bg-neutral-100 p-4 font-semibold">
            Pengajuan ini sudah diproses: {submission.status}.
          </p>
        )}
      </div>
    </main>
  );
}
