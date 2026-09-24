import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  verificationSubmission: { findFirst: vi.fn() },
  verificationEvidence: { findUnique: vi.fn() },
}));

vi.mock("@/lib/db/prisma", () => ({ prisma: database }));

import {
  findVerificationEvidenceForAccess,
  findVerificationSubmissionForStorage,
} from "./private-evidence-repository";

describe("private evidence repository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("scopes upload submission lookup to the authorized merchant", async () => {
    database.verificationSubmission.findFirst.mockResolvedValue(null);

    await findVerificationSubmissionForStorage("submission-a", "merchant-a");

    expect(database.verificationSubmission.findFirst).toHaveBeenCalledWith({
      where: { id: "submission-a", merchantId: "merchant-a" },
      select: {
        id: true,
        merchantId: true,
        _count: { select: { evidences: true } },
      },
    });
  });

  it("loads only the storage key and owning merchant for access checks", async () => {
    database.verificationEvidence.findUnique.mockResolvedValue({
      id: "evidence-a",
      storageKey: "verification/merchant-a/submission-a/evidence.pdf",
      submission: { merchantId: "merchant-a" },
    });

    await expect(
      findVerificationEvidenceForAccess("evidence-a"),
    ).resolves.toEqual({
      id: "evidence-a",
      storageKey: "verification/merchant-a/submission-a/evidence.pdf",
      merchantId: "merchant-a",
    });
    expect(database.verificationEvidence.findUnique).toHaveBeenCalledWith({
      where: { id: "evidence-a" },
      select: {
        id: true,
        storageKey: true,
        submission: { select: { merchantId: true } },
      },
    });
  });
});
