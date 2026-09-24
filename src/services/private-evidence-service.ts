import "server-only";

import { GlobalUserRole } from "@prisma/client";
import {
  ForbiddenError,
  requireAuthenticatedUser,
  requireMerchantAdmin,
  requireMerchantOwnership,
  type AuthorizationDependencies,
} from "@/lib/auth/authorization";
import {
  assertEvidenceFileCount,
  validateEvidenceFile,
  type EvidenceFileInput,
  type EvidenceMimeType,
} from "@/lib/storage/evidence";
import { createVerificationEvidencePath } from "@/lib/storage/path";
import { createSupabaseStorage } from "@/lib/storage/supabase";
import type {
  ObjectStorage,
  StorageObjectReference,
} from "@/lib/storage/types";
import {
  findVerificationEvidenceForAccess,
  findVerificationSubmissionForStorage,
  type VerificationEvidenceAccessRecord,
  type VerificationSubmissionStorageRecord,
} from "@/repositories/private-evidence-repository";

export const EVIDENCE_SIGNED_URL_LIFETIME_SECONDS = 5 * 60;

export class PrivateEvidenceNotFoundError extends Error {
  constructor() {
    super("Bukti usaha tidak ditemukan.");
    this.name = "PrivateEvidenceNotFoundError";
  }
}

export type UploadedPrivateEvidence = {
  reference: StorageObjectReference;
  originalFilename: string;
  mimeType: EvidenceMimeType;
  sizeBytes: number;
};

type PrivateEvidenceDependencies = {
  authorization?: AuthorizationDependencies;
  storage?: ObjectStorage;
  findSubmission?: (
    submissionId: string,
    merchantId: string,
  ) => Promise<VerificationSubmissionStorageRecord | null>;
  findEvidence?: (
    evidenceId: string,
  ) => Promise<VerificationEvidenceAccessRecord | null>;
};

const resolveDependencies = (dependencies: PrivateEvidenceDependencies) => ({
  authorization: dependencies.authorization ?? {},
  storage: dependencies.storage,
  findSubmission:
    dependencies.findSubmission ?? findVerificationSubmissionForStorage,
  findEvidence: dependencies.findEvidence ?? findVerificationEvidenceForAccess,
});

export const uploadPrivateEvidence = async (
  input: { submissionId: string; files: EvidenceFileInput[] },
  dependencies: PrivateEvidenceDependencies = {},
): Promise<UploadedPrivateEvidence[]> => {
  const resolved = resolveDependencies(dependencies);
  const membership = await requireMerchantAdmin(resolved.authorization);
  const storage = resolved.storage ?? createSupabaseStorage();
  const submission = await resolved.findSubmission(
    input.submissionId,
    membership.merchantId,
  );
  if (!submission) {
    throw new PrivateEvidenceNotFoundError();
  }

  assertEvidenceFileCount(input.files.length, submission.evidenceCount);
  const uploaded: UploadedPrivateEvidence[] = [];

  try {
    for (const file of input.files) {
      const validated = await validateEvidenceFile(file);
      const reference = await storage.upload({
        bucket: "privateEvidence",
        path: createVerificationEvidencePath(
          membership.merchantId,
          submission.id,
          validated.extension,
        ),
        data: validated.data,
        contentType: validated.mimeType,
      });
      uploaded.push({
        reference,
        originalFilename: validated.originalFilename,
        mimeType: validated.mimeType,
        sizeBytes: validated.sizeBytes,
      });
    }
    return uploaded;
  } catch (error) {
    await Promise.allSettled(
      uploaded.map(({ reference }) => storage.remove(reference)),
    );
    throw error;
  }
};

export const createAuthorizedEvidenceSignedUrl = async (
  evidenceId: string,
  dependencies: PrivateEvidenceDependencies = {},
): Promise<string> => {
  const resolved = resolveDependencies(dependencies);
  const user = await requireAuthenticatedUser(resolved.authorization);
  const evidence = await resolved.findEvidence(evidenceId);
  if (!evidence) {
    throw new PrivateEvidenceNotFoundError();
  }

  if (user.globalRole !== GlobalUserRole.SUPER_ADMIN) {
    try {
      await requireMerchantOwnership(
        evidence.merchantId,
        resolved.authorization,
      );
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new PrivateEvidenceNotFoundError();
      }
      throw error;
    }
  }

  const storage = resolved.storage ?? createSupabaseStorage();
  return storage.createSignedUrl(
    { bucket: "privateEvidence", path: evidence.storageKey },
    EVIDENCE_SIGNED_URL_LIFETIME_SECONDS,
  );
};
