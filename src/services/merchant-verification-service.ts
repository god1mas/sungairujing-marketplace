import "server-only";

import { randomUUID } from "node:crypto";
import { VerificationSubmissionStatus } from "@prisma/client";
import { z } from "zod";
import {
  requireMerchantAdmin,
  requireSuperAdmin,
} from "@/lib/auth/authorization";
import { EvidenceValidationError } from "@/lib/storage/errors";
import { createSupabaseStorage } from "@/lib/storage/supabase";
import { uploadPrivateEvidence } from "./private-evidence-service";
import {
  attachVerificationEvidences,
  createPendingVerificationSubmission,
  deleteEmptyVerificationSubmission,
  findMerchantVerification,
  findVerificationSubmissionForReview,
  listPendingVerificationSubmissions,
  reviewVerificationSubmission,
} from "@/repositories/merchant-verification-repository";

export class VerificationConflictError extends Error {}
export class VerificationNotFoundError extends Error {}

const defaults = {
  authorizeMerchant: requireMerchantAdmin,
  authorizeAdmin: requireSuperAdmin,
  findMerchant: findMerchantVerification,
  createPending: createPendingVerificationSubmission,
  attachEvidences: attachVerificationEvidences,
  deleteEmpty: deleteEmptyVerificationSubmission,
  listPending: listPendingVerificationSubmissions,
  findReview: findVerificationSubmissionForReview,
  review: reviewVerificationSubmission,
  upload: uploadPrivateEvidence,
  createStorage: createSupabaseStorage,
};
export type MerchantVerificationDependencies = Partial<typeof defaults>;
const deps = (overrides: MerchantVerificationDependencies) => ({
  ...defaults,
  ...overrides,
});

export const getMerchantVerification = async (
  overrides: MerchantVerificationDependencies = {},
) => {
  const resolved = deps(overrides);
  const membership = await resolved.authorizeMerchant();
  const merchant = await resolved.findMerchant(membership.merchantId);
  if (!merchant) throw new VerificationNotFoundError();
  return merchant;
};

export const submitMerchantVerification = async (
  files: File[],
  overrides: MerchantVerificationDependencies = {},
) => {
  if (files.length < 1) throw new EvidenceValidationError("INVALID_FILE");
  const resolved = deps(overrides);
  const membership = await resolved.authorizeMerchant();
  const current = await resolved.findMerchant(membership.merchantId);
  if (!current) throw new VerificationNotFoundError();
  if (
    current.verificationStatus === "TERVERIFIKASI" ||
    current.verificationSubmissions.some(
      (item) => item.status === VerificationSubmissionStatus.PENDING,
    )
  ) {
    throw new VerificationConflictError();
  }

  const submissionId = randomUUID();
  const created = await resolved.createPending(
    membership.merchantId,
    submissionId,
  );
  if (!created) throw new VerificationConflictError();
  const storage = resolved.createStorage();
  let uploaded: Awaited<ReturnType<typeof uploadPrivateEvidence>> = [];
  try {
    uploaded = await resolved.upload(
      {
        submissionId,
        files: await Promise.all(
          files.map(async (file) => ({
            data: await file.arrayBuffer(),
            mimeType: file.type,
            originalFilename: file.name,
          })),
        ),
      },
      { storage },
    );
    await resolved.attachEvidences(
      submissionId,
      uploaded.map((item) => ({
        storageKey: item.reference.path,
        originalFilename: item.originalFilename,
        mimeType: item.mimeType,
        sizeBytes: item.sizeBytes,
      })),
    );
    return { submissionId };
  } catch (error) {
    await Promise.allSettled(
      uploaded.map(({ reference }) => storage.remove(reference)),
    );
    await resolved
      .deleteEmpty(
        submissionId,
        membership.merchantId,
        current.verificationStatus,
      )
      .catch(() => undefined);
    throw error;
  }
};

export const getPendingVerifications = async (
  overrides: MerchantVerificationDependencies = {},
) => {
  const resolved = deps(overrides);
  await resolved.authorizeAdmin();
  return resolved.listPending();
};

export const getVerificationForReview = async (
  submissionId: string,
  overrides: MerchantVerificationDependencies = {},
) => {
  const resolved = deps(overrides);
  await resolved.authorizeAdmin();
  if (!z.uuid().safeParse(submissionId).success) {
    throw new VerificationNotFoundError();
  }
  const submission = await resolved.findReview(submissionId);
  if (!submission) throw new VerificationNotFoundError();
  return submission;
};

export const decideVerification = async (
  input: {
    submissionId: string;
    decision: "APPROVE" | "REJECT";
    rejectionReason?: string;
  },
  overrides: MerchantVerificationDependencies = {},
) => {
  const resolved = deps(overrides);
  const admin = await resolved.authorizeAdmin();
  if (!z.uuid().safeParse(input.submissionId).success) {
    throw new VerificationConflictError();
  }
  const result = await resolved.review({ ...input, reviewerUserId: admin.id });
  if (!result) throw new VerificationConflictError();
  return result;
};
