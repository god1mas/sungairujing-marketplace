import "server-only";

import { prisma } from "@/lib/db/prisma";

export type VerificationSubmissionStorageRecord = {
  id: string;
  merchantId: string;
  evidenceCount: number;
};

export type VerificationEvidenceAccessRecord = {
  id: string;
  storageKey: string;
  merchantId: string;
};

export const findVerificationSubmissionForStorage = async (
  submissionId: string,
  merchantId: string,
): Promise<VerificationSubmissionStorageRecord | null> => {
  const submission = await prisma.verificationSubmission.findFirst({
    where: { id: submissionId, merchantId },
    select: {
      id: true,
      merchantId: true,
      _count: { select: { evidences: true } },
    },
  });

  return submission
    ? {
        id: submission.id,
        merchantId: submission.merchantId,
        evidenceCount: submission._count.evidences,
      }
    : null;
};

export const findVerificationEvidenceForAccess = async (
  evidenceId: string,
): Promise<VerificationEvidenceAccessRecord | null> => {
  const evidence = await prisma.verificationEvidence.findUnique({
    where: { id: evidenceId },
    select: {
      id: true,
      storageKey: true,
      submission: { select: { merchantId: true } },
    },
  });

  return evidence
    ? {
        id: evidence.id,
        storageKey: evidence.storageKey,
        merchantId: evidence.submission.merchantId,
      }
    : null;
};
