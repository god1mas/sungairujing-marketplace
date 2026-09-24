import { describe, expect, it, vi } from "vitest";
import type { ObjectStorage } from "@/lib/storage/types";

vi.mock("server-only", () => ({}));

import {
  decideVerification,
  getMerchantVerification,
  submitMerchantVerification,
  VerificationConflictError,
} from "./merchant-verification-service";

const membership = { merchantId: "merchant-a", userId: "user-a" };
const submissionId = "9a09e835-ecb7-45f4-8dc5-25f96d38ac90";
const current = (
  status:
    "BELUM_DIVERIFIKASI" | "TERVERIFIKASI" | "DITOLAK" = "BELUM_DIVERIFIKASI",
) => ({
  id: "merchant-a",
  name: "Warung A",
  verificationStatus: status,
  verificationSubmissions: [],
});
const storage: ObjectStorage = {
  upload: vi.fn(),
  remove: vi.fn(async () => undefined),
  getPublicUrl: vi.fn(),
  createSignedUrl: vi.fn(),
};

describe("merchant verification service", () => {
  it("scopes merchant state to the authenticated membership", async () => {
    const findMerchant = vi.fn().mockResolvedValue(current());
    await getMerchantVerification({
      authorizeMerchant: vi.fn().mockResolvedValue(membership),
      findMerchant,
    });
    expect(findMerchant).toHaveBeenCalledWith("merchant-a");
  });

  it("creates one pending submission and persists private evidence metadata", async () => {
    const attachEvidences = vi.fn().mockResolvedValue({ count: 1 });
    const upload = vi.fn().mockResolvedValue([
      {
        reference: {
          bucket: "privateEvidence",
          path: "verification/merchant-a/submission/file.pdf",
        },
        originalFilename: "izin.pdf",
        mimeType: "application/pdf",
        sizeBytes: 20,
      },
    ]);
    await submitMerchantVerification(
      [new File(["%PDF-1\n%%EOF"], "izin.pdf", { type: "application/pdf" })],
      {
        authorizeMerchant: vi.fn().mockResolvedValue(membership),
        findMerchant: vi.fn().mockResolvedValue(current("DITOLAK")),
        createPending: vi.fn().mockResolvedValue({ id: "submission-a" }),
        upload,
        attachEvidences,
        createStorage: () => storage,
      },
    );
    expect(upload).toHaveBeenCalledWith(
      expect.objectContaining({ submissionId: expect.any(String) }),
      { storage },
    );
    expect(attachEvidences).toHaveBeenCalledWith(expect.any(String), [
      expect.objectContaining({
        storageKey: expect.stringContaining("verification/"),
      }),
    ]);
  });

  it("blocks a second pending submission", async () => {
    await expect(
      submitMerchantVerification(
        [new File(["x"], "proof.pdf", { type: "application/pdf" })],
        {
          authorizeMerchant: vi.fn().mockResolvedValue(membership),
          findMerchant: vi.fn().mockResolvedValue({
            ...current(),
            verificationSubmissions: [{ status: "PENDING" }],
          }),
        },
      ),
    ).rejects.toBeInstanceOf(VerificationConflictError);
  });

  it("cleans uploaded objects and restores the previous state if metadata persistence fails", async () => {
    const deleteEmpty = vi.fn().mockResolvedValue({ count: 1 });
    await expect(
      submitMerchantVerification(
        [new File(["x"], "proof.pdf", { type: "application/pdf" })],
        {
          authorizeMerchant: vi.fn().mockResolvedValue(membership),
          findMerchant: vi.fn().mockResolvedValue(current("DITOLAK")),
          createPending: vi.fn().mockResolvedValue({ id: "submission-a" }),
          upload: vi.fn().mockResolvedValue([
            {
              reference: { bucket: "privateEvidence", path: "private.pdf" },
              originalFilename: "proof.pdf",
              mimeType: "application/pdf",
              sizeBytes: 1,
            },
          ]),
          attachEvidences: vi.fn().mockRejectedValue(new Error("db failed")),
          deleteEmpty,
          createStorage: () => storage,
        },
      ),
    ).rejects.toThrow("db failed");
    expect(storage.remove).toHaveBeenCalledWith({
      bucket: "privateEvidence",
      path: "private.pdf",
    });
    expect(deleteEmpty).toHaveBeenCalledWith(
      expect.any(String),
      "merchant-a",
      "DITOLAK",
    );
  });

  it("requires admin authorization before an atomic decision", async () => {
    const review = vi
      .fn()
      .mockResolvedValue({ merchantId: "merchant-a", approved: true });
    await decideVerification(
      { submissionId, decision: "APPROVE" },
      {
        authorizeAdmin: vi.fn().mockResolvedValue({ id: "admin-a" }),
        review,
      },
    );
    expect(review).toHaveBeenCalledWith({
      submissionId,
      decision: "APPROVE",
      reviewerUserId: "admin-a",
    });
  });

  it("rejects normal merchants before any admin read or decision", async () => {
    const listPending = vi.fn();
    const review = vi.fn();
    const denied = new Error("forbidden");
    const { getPendingVerifications } =
      await import("./merchant-verification-service");
    await expect(
      getPendingVerifications({
        authorizeAdmin: vi.fn().mockRejectedValue(denied),
        listPending,
      }),
    ).rejects.toBe(denied);
    await expect(
      decideVerification(
        { submissionId, decision: "APPROVE" },
        {
          authorizeAdmin: vi.fn().mockRejectedValue(denied),
          review,
        },
      ),
    ).rejects.toBe(denied);
    expect(listPending).not.toHaveBeenCalled();
    expect(review).not.toHaveBeenCalled();
  });
});
