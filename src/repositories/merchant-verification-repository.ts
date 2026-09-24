import {
  MerchantVerificationStatus,
  NotificationType,
  Prisma,
  VerificationSubmissionStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export const findMerchantVerification = (merchantId: string) =>
  prisma.merchant.findUnique({
    where: { id: merchantId },
    select: {
      id: true,
      name: true,
      verificationStatus: true,
      verificationSubmissions: {
        orderBy: { submittedAt: "desc" },
        select: {
          id: true,
          status: true,
          submittedAt: true,
          reviewedAt: true,
          rejectionReason: true,
          evidences: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              originalFilename: true,
              mimeType: true,
              sizeBytes: true,
            },
          },
        },
      },
    },
  });

export const createPendingVerificationSubmission = async (
  merchantId: string,
  submissionId: string,
) =>
  prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${merchantId}))`;
    const pending = await tx.verificationSubmission.findFirst({
      where: { merchantId, status: VerificationSubmissionStatus.PENDING },
      select: { id: true },
    });
    if (pending) return null;
    await tx.merchant.update({
      where: { id: merchantId },
      data: {
        verificationStatus: MerchantVerificationStatus.BELUM_DIVERIFIKASI,
      },
    });
    return tx.verificationSubmission.create({
      data: {
        id: submissionId,
        merchantId,
        status: VerificationSubmissionStatus.PENDING,
      },
      select: { id: true },
    });
  });

export const attachVerificationEvidences = (
  submissionId: string,
  evidences: Array<{
    storageKey: string;
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
  }>,
) =>
  prisma.verificationEvidence.createMany({
    data: evidences.map((evidence) => ({
      ...evidence,
      sizeBytes: BigInt(evidence.sizeBytes),
      submissionId,
    })),
  });

export const deleteEmptyVerificationSubmission = (
  submissionId: string,
  merchantId: string,
  previousStatus: MerchantVerificationStatus,
) =>
  prisma.$transaction(async (tx) => {
    const deleted = await tx.verificationSubmission.deleteMany({
      where: { id: submissionId, merchantId, evidences: { none: {} } },
    });
    if (deleted.count === 1) {
      await tx.merchant.update({
        where: { id: merchantId },
        data: { verificationStatus: previousStatus },
      });
    }
    return deleted;
  });

export const listPendingVerificationSubmissions = () =>
  prisma.verificationSubmission.findMany({
    where: {
      status: VerificationSubmissionStatus.PENDING,
      evidences: { some: {} },
    },
    orderBy: { submittedAt: "asc" },
    select: {
      id: true,
      submittedAt: true,
      merchant: {
        select: { id: true, name: true, verificationStatus: true },
      },
      _count: { select: { evidences: true } },
    },
  });

export const findVerificationSubmissionForReview = (submissionId: string) =>
  prisma.verificationSubmission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      status: true,
      submittedAt: true,
      reviewedAt: true,
      rejectionReason: true,
      merchant: {
        select: {
          id: true,
          name: true,
          address: true,
          publicWhatsappNumber: true,
          verificationStatus: true,
        },
      },
      evidences: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          originalFilename: true,
          mimeType: true,
          sizeBytes: true,
        },
      },
    },
  });

export const reviewVerificationSubmission = (input: {
  submissionId: string;
  reviewerUserId: string;
  decision: "APPROVE" | "REJECT";
  rejectionReason?: string;
}) =>
  prisma.$transaction(
    async (tx) => {
      const submission = await tx.verificationSubmission.findUnique({
        where: { id: input.submissionId },
        select: {
          id: true,
          status: true,
          merchantId: true,
          merchant: {
            select: {
              name: true,
              memberships: {
                where: { isActive: true },
                select: { userId: true },
              },
            },
          },
          evidences: { take: 1, select: { id: true } },
        },
      });
      if (
        !submission ||
        submission.status !== VerificationSubmissionStatus.PENDING ||
        submission.evidences.length === 0
      )
        return null;

      const approved = input.decision === "APPROVE";
      const updated = await tx.verificationSubmission.updateMany({
        where: {
          id: input.submissionId,
          status: VerificationSubmissionStatus.PENDING,
        },
        data: {
          status: approved
            ? VerificationSubmissionStatus.APPROVED
            : VerificationSubmissionStatus.REJECTED,
          reviewedAt: new Date(),
          reviewedByUserId: input.reviewerUserId,
          rejectionReason: approved ? null : input.rejectionReason,
        },
      });
      if (updated.count !== 1) return null;

      await tx.merchant.update({
        where: { id: submission.merchantId },
        data: {
          verificationStatus: approved
            ? MerchantVerificationStatus.TERVERIFIKASI
            : MerchantVerificationStatus.DITOLAK,
        },
      });
      if (submission.merchant.memberships.length > 0) {
        await tx.notification.createMany({
          data: submission.merchant.memberships.map(({ userId }) => ({
            recipientUserId: userId,
            merchantId: submission.merchantId,
            type: approved
              ? NotificationType.VERIFICATION_APPROVED
              : NotificationType.VERIFICATION_REJECTED,
            title: approved ? "Verifikasi disetujui" : "Verifikasi ditolak",
            message: approved
              ? `Verifikasi ${submission.merchant.name} telah disetujui.`
              : `Verifikasi ${submission.merchant.name} ditolak: ${input.rejectionReason}`,
          })),
        });
      }
      return { merchantId: submission.merchantId, approved };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
