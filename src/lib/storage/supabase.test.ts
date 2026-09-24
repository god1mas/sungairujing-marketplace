import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  InvalidStoragePathError,
  PrivateStorageUrlError,
  StorageOperationError,
  InvalidSignedStorageUrlError,
} from "./errors";
import { createSupabaseStorage } from "./supabase";

vi.mock("server-only", () => ({}));

const config = {
  supabaseUrl: "https://project.supabase.co",
  serviceRoleKey: "test-only-service-role-placeholder",
  buckets: {
    publicMedia: "public-media",
    privateEvidence: "private-evidence",
  },
} as const;

const provider = vi.hoisted(() => ({
  from: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn(),
  getPublicUrl: vi.fn(),
  createSignedUrl: vi.fn(),
}));

const client = {
  storage: { from: provider.from },
} as unknown as SupabaseClient;

describe("Supabase storage adapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    provider.from.mockReturnValue({
      upload: provider.upload,
      remove: provider.remove,
      getPublicUrl: provider.getPublicUrl,
      createSignedUrl: provider.createSignedUrl,
    });
    provider.upload.mockResolvedValue({
      data: { path: "object" },
      error: null,
    });
    provider.remove.mockResolvedValue({ data: [], error: null });
    provider.getPublicUrl.mockReturnValue({
      data: { publicUrl: "https://cdn.example/object.webp" },
    });
    provider.createSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://signed.example/private" },
      error: null,
    });
  });

  it("uploads only to the configured bucket without overwrite", async () => {
    const storage = createSupabaseStorage({ client, config });
    const data = new ArrayBuffer(4);

    await expect(
      storage.upload({
        bucket: "publicMedia",
        path: "merchants/merchant-a/logo/object.webp",
        data,
        contentType: "image/webp",
        cacheControl: "3600",
      }),
    ).resolves.toEqual({
      bucket: "publicMedia",
      path: "merchants/merchant-a/logo/object.webp",
    });
    expect(provider.from).toHaveBeenCalledWith("public-media");
    expect(provider.upload).toHaveBeenCalledWith(
      "merchants/merchant-a/logo/object.webp",
      data,
      {
        cacheControl: "3600",
        contentType: "image/webp",
        upsert: false,
      },
    );
  });

  it("never creates a public URL for private storage", () => {
    const storage = createSupabaseStorage({ client, config });

    expect(() =>
      storage.getPublicUrl({
        bucket: "privateEvidence",
        path: "verification/merchant-a/submission-a/object.pdf",
      }),
    ).toThrow(PrivateStorageUrlError);
    expect(provider.getPublicUrl).not.toHaveBeenCalled();
  });

  it("maps public URLs through the configured public bucket", () => {
    const storage = createSupabaseStorage({ client, config });

    expect(
      storage.getPublicUrl({
        bucket: "publicMedia",
        path: "banners/banner-a/object.webp",
      }),
    ).toBe("https://cdn.example/object.webp");
    expect(provider.from).toHaveBeenCalledWith("public-media");
  });

  it("provides cleanup removal through the controlled bucket mapping", async () => {
    const storage = createSupabaseStorage({ client, config });

    await storage.remove({
      bucket: "publicMedia",
      path: "banners/banner-a/object.webp",
    });

    expect(provider.remove).toHaveBeenCalledWith([
      "banners/banner-a/object.webp",
    ]);
  });

  it("creates expiring URLs only through the configured private bucket", async () => {
    const storage = createSupabaseStorage({ client, config });

    await expect(
      storage.createSignedUrl(
        {
          bucket: "privateEvidence",
          path: "verification/merchant-a/submission-a/object.pdf",
        },
        300,
      ),
    ).resolves.toBe("https://signed.example/private");
    expect(provider.from).toHaveBeenCalledWith("private-evidence");
    expect(provider.createSignedUrl).toHaveBeenCalledWith(
      "verification/merchant-a/submission-a/object.pdf",
      300,
    );
  });

  it("rejects signed URLs for public objects", async () => {
    const storage = createSupabaseStorage({ client, config });

    await expect(
      storage.createSignedUrl(
        { bucket: "publicMedia", path: "banners/banner-a/object.webp" },
        300,
      ),
    ).rejects.toBeInstanceOf(InvalidSignedStorageUrlError);
    expect(provider.createSignedUrl).not.toHaveBeenCalled();
  });

  it("sanitizes signed URL provider errors", async () => {
    const storage = createSupabaseStorage({ client, config });
    provider.createSignedUrl.mockRejectedValue(
      new Error("provider response containing service-role-value"),
    );

    await expect(
      storage.createSignedUrl(
        {
          bucket: "privateEvidence",
          path: "verification/merchant-a/submission-a/object.pdf",
        },
        300,
      ),
    ).rejects.toEqual(new StorageOperationError());
  });

  it("rejects traversal before calling the provider", async () => {
    const storage = createSupabaseStorage({ client, config });

    await expect(
      storage.upload({
        bucket: "publicMedia",
        path: "../merchant-b/object.webp",
        data: new ArrayBuffer(1),
        contentType: "image/webp",
      }),
    ).rejects.toBeInstanceOf(InvalidStoragePathError);
    expect(provider.from).not.toHaveBeenCalled();
  });

  it("replaces provider errors with a controlled application error", async () => {
    const storage = createSupabaseStorage({ client, config });
    provider.upload.mockRejectedValue(
      new Error("provider response containing service-role-value"),
    );

    await expect(
      storage.upload({
        bucket: "publicMedia",
        path: "banners/banner-a/object.webp",
        data: new ArrayBuffer(1),
        contentType: "image/webp",
      }),
    ).rejects.toEqual(new StorageOperationError());
  });
});
