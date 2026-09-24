import { describe, expect, it } from "vitest";
import { InvalidStoragePathError } from "./errors";
import {
  assertSafeStoragePath,
  createBannerImagePath,
  createMerchantLogoPath,
  createProductImagePath,
  createStorageObjectPath,
  createVerificationEvidencePath,
} from "./path";

describe("storage object paths", () => {
  it("generates documented server-controlled public-media namespaces", () => {
    const createId = () => "generated-id";

    expect(createMerchantLogoPath("merchant-a", "webp", createId)).toBe(
      "merchants/merchant-a/logo/generated-id.webp",
    );
    expect(
      createProductImagePath("merchant-a", "product-a", "webp", createId),
    ).toBe("merchants/merchant-a/products/product-a/generated-id.webp");
    expect(createBannerImagePath("banner-a", "webp", createId)).toBe(
      "banners/banner-a/generated-id.webp",
    );
    expect(
      createVerificationEvidencePath(
        "merchant-a",
        "submission-a",
        "pdf",
        createId,
      ),
    ).toBe("verification/merchant-a/submission-a/generated-id.pdf");
  });

  it.each([
    "../merchant/file.webp",
    "/absolute/file.webp",
    "merchant\\file.webp",
    "merchant//file.webp",
    "merchant/./file.webp",
  ])("rejects unsafe path %s", (path) => {
    expect(() => assertSafeStoragePath(path)).toThrow(InvalidStoragePathError);
  });

  it("rejects unsafe tenant segments, extensions, and generated names", () => {
    expect(() =>
      createStorageObjectPath({
        segments: ["merchants", "../merchant-b"],
        extension: "webp",
      }),
    ).toThrow(InvalidStoragePathError);
    expect(() =>
      createStorageObjectPath({
        segments: ["merchants", "merchant-a"],
        extension: "webp/../../pdf",
      }),
    ).toThrow(InvalidStoragePathError);
    expect(() =>
      createStorageObjectPath({
        segments: ["merchants", "merchant-a"],
        extension: "webp",
        createId: () => "../chosen-name",
      }),
    ).toThrow(InvalidStoragePathError);
  });
});
