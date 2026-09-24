import {
  GlobalUserRole,
  MerchantMembershipRole,
  MerchantStatus,
  MerchantVerificationStatus,
} from "@prisma/client";
import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";
import {
  UnauthenticatedError,
  type AuthorizationDependencies,
} from "@/lib/auth/authorization";
import type { ObjectStorage, StorageUploadInput } from "@/lib/storage/types";

vi.mock("server-only", () => ({}));

import {
  createAuthorizedEvidenceSignedUrl,
  EVIDENCE_SIGNED_URL_LIFETIME_SECONDS,
  PrivateEvidenceNotFoundError,
  uploadPrivateEvidence,
} from "./private-evidence-service";

const version = new Date("2026-09-24T00:00:00.000Z");

const authorization = ({
  role = GlobalUserRole.USER,
  membershipMerchantId = "merchant-a",
  hasMembership = true,
  authenticated = true,
}: {
  role?: GlobalUserRole;
  membershipMerchantId?: string;
  hasMembership?: boolean;
  authenticated?: boolean;
} = {}): AuthorizationDependencies => ({
  getSession: vi.fn().mockResolvedValue(
    authenticated
      ? {
          user: {
            id: "user-a",
            globalRole: role,
            userVersion: version.toISOString(),
          },
          expires: "2026-09-25T00:00:00.000Z",
        }
      : null,
  ),
  findUser: vi.fn().mockResolvedValue({
    id: "user-a",
    globalRole: role,
    isActive: true,
    updatedAt: version,
  }),
  findMembership: vi.fn().mockImplementation(({ merchantId }) =>
    hasMembership && (!merchantId || merchantId === membershipMerchantId)
      ? Promise.resolve({
          id: "membership-a",
          userId: "user-a",
          merchantId: membershipMerchantId,
          role: MerchantMembershipRole.OWNER,
          merchant: {
            status: MerchantStatus.ACTIVE,
            verificationStatus: MerchantVerificationStatus.BELUM_DIVERIFIKASI,
          },
        })
      : Promise.resolve(null),
  ),
});

const storage = (): ObjectStorage => ({
  upload: vi.fn(async (input: StorageUploadInput) => ({
    bucket: input.bucket,
    path: input.path,
  })),
  remove: vi.fn(async () => undefined),
  getPublicUrl: vi.fn(() => {
    throw new Error("private evidence must not use public URLs");
  }),
  createSignedUrl: vi.fn(async () => "https://signed.example/evidence"),
});

const imageFile = async () => ({
  data: Uint8Array.from(
    await sharp({
      create: {
        width: 10,
        height: 10,
        channels: 3,
        background: "#15803d",
      },
    })
      .jpeg()
      .toBuffer(),
  ).buffer,
  mimeType: "image/jpeg",
  originalFilename: "usaha.jpg",
});

describe("private evidence service", () => {
  it("derives the tenant from active membership and uploads privately", async () => {
    const objectStorage = storage();
    const findSubmission = vi.fn().mockResolvedValue({
      id: "submission-a",
      merchantId: "merchant-a",
      evidenceCount: 0,
    });

    const [result] = await uploadPrivateEvidence(
      { submissionId: "submission-a", files: [await imageFile()] },
      {
        authorization: authorization(),
        storage: objectStorage,
        findSubmission,
      },
    );

    expect(findSubmission).toHaveBeenCalledWith("submission-a", "merchant-a");
    expect(objectStorage.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        bucket: "privateEvidence",
        contentType: "image/jpeg",
        path: expect.stringMatching(
          /^verification\/merchant-a\/submission-a\/[a-f0-9-]+\.jpg$/,
        ),
      }),
    );
    expect(result.reference.bucket).toBe("privateEvidence");
    expect(objectStorage.getPublicUrl).not.toHaveBeenCalled();
  });

  it("denies unauthenticated upload before submission or storage access", async () => {
    const objectStorage = storage();
    const findSubmission = vi.fn();

    await expect(
      uploadPrivateEvidence(
        { submissionId: "submission-a", files: [await imageFile()] },
        {
          authorization: authorization({ authenticated: false }),
          storage: objectStorage,
          findSubmission,
        },
      ),
    ).rejects.toBeInstanceOf(UnauthenticatedError);
    expect(findSubmission).not.toHaveBeenCalled();
    expect(objectStorage.upload).not.toHaveBeenCalled();
  });

  it("cannot upload into a cross-tenant submission", async () => {
    const objectStorage = storage();
    const findSubmission = vi.fn().mockResolvedValue(null);

    await expect(
      uploadPrivateEvidence(
        { submissionId: "submission-b", files: [await imageFile()] },
        {
          authorization: authorization(),
          storage: objectStorage,
          findSubmission,
        },
      ),
    ).rejects.toBeInstanceOf(PrivateEvidenceNotFoundError);
    expect(findSubmission).toHaveBeenCalledWith("submission-b", "merchant-a");
    expect(objectStorage.upload).not.toHaveBeenCalled();
  });

  it("cleans up uploaded private objects after a later batch failure", async () => {
    const objectStorage = storage();
    vi.mocked(objectStorage.upload)
      .mockResolvedValueOnce({
        bucket: "privateEvidence",
        path: "verification/merchant-a/submission-a/first.jpg",
      })
      .mockRejectedValueOnce(new Error("safe mocked provider failure"));

    await expect(
      uploadPrivateEvidence(
        {
          submissionId: "submission-a",
          files: [await imageFile(), await imageFile()],
        },
        {
          authorization: authorization(),
          storage: objectStorage,
          findSubmission: vi.fn().mockResolvedValue({
            id: "submission-a",
            merchantId: "merchant-a",
            evidenceCount: 0,
          }),
        },
      ),
    ).rejects.toThrow();
    expect(objectStorage.remove).toHaveBeenCalledWith({
      bucket: "privateEvidence",
      path: "verification/merchant-a/submission-a/first.jpg",
    });
  });

  it("issues a five-minute signed URL to the owning merchant", async () => {
    const objectStorage = storage();

    await expect(
      createAuthorizedEvidenceSignedUrl("evidence-a", {
        authorization: authorization(),
        storage: objectStorage,
        findEvidence: vi.fn().mockResolvedValue({
          id: "evidence-a",
          merchantId: "merchant-a",
          storageKey: "verification/merchant-a/submission-a/evidence.jpg",
        }),
      }),
    ).resolves.toBe("https://signed.example/evidence");
    expect(objectStorage.createSignedUrl).toHaveBeenCalledWith(
      {
        bucket: "privateEvidence",
        path: "verification/merchant-a/submission-a/evidence.jpg",
      },
      EVIDENCE_SIGNED_URL_LIFETIME_SECONDS,
    );
    expect(EVIDENCE_SIGNED_URL_LIFETIME_SECONDS).toBe(300);
  });

  it("denies cross-tenant and inactive membership signed access", async () => {
    const objectStorage = storage();
    const findEvidence = vi.fn().mockResolvedValue({
      id: "evidence-b",
      merchantId: "merchant-b",
      storageKey: "verification/merchant-b/submission-b/evidence.pdf",
    });

    await expect(
      createAuthorizedEvidenceSignedUrl("evidence-b", {
        authorization: authorization(),
        storage: objectStorage,
        findEvidence,
      }),
    ).rejects.toBeInstanceOf(PrivateEvidenceNotFoundError);
    await expect(
      createAuthorizedEvidenceSignedUrl("evidence-b", {
        authorization: authorization({ hasMembership: false }),
        storage: objectStorage,
        findEvidence,
      }),
    ).rejects.toBeInstanceOf(PrivateEvidenceNotFoundError);
    expect(objectStorage.createSignedUrl).not.toHaveBeenCalled();
  });

  it("allows an authenticated Super Admin without merchant membership", async () => {
    const objectStorage = storage();
    const deps = authorization({
      role: GlobalUserRole.SUPER_ADMIN,
      hasMembership: false,
    });

    await expect(
      createAuthorizedEvidenceSignedUrl("evidence-a", {
        authorization: deps,
        storage: objectStorage,
        findEvidence: vi.fn().mockResolvedValue({
          id: "evidence-a",
          merchantId: "merchant-a",
          storageKey: "verification/merchant-a/submission-a/evidence.jpg",
        }),
      }),
    ).resolves.toBe("https://signed.example/evidence");
    expect(deps.findMembership).not.toHaveBeenCalled();
  });

  it("propagates signed-URL provider failure without falling back to a public URL", async () => {
    const objectStorage = storage();
    vi.mocked(objectStorage.createSignedUrl).mockRejectedValue(
      new Error("provider unavailable"),
    );
    await expect(
      createAuthorizedEvidenceSignedUrl("evidence-a", {
        authorization: authorization({ role: GlobalUserRole.SUPER_ADMIN }),
        storage: objectStorage,
        findEvidence: vi.fn().mockResolvedValue({
          id: "evidence-a",
          merchantId: "merchant-a",
          storageKey: "verification/merchant-a/submission-a/evidence.jpg",
        }),
      }),
    ).rejects.toThrow("provider unavailable");
    expect(objectStorage.getPublicUrl).not.toHaveBeenCalled();
  });
});
