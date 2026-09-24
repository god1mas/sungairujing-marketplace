import { randomUUID } from "node:crypto";
import { InvalidStoragePathError } from "./errors";

const SAFE_SEGMENT_PATTERN = /^[a-zA-Z0-9_-]+$/;
const SAFE_PATH_SEGMENT_PATTERN = /^[a-zA-Z0-9_.-]+$/;
const SAFE_EXTENSION_PATTERN = /^[a-z0-9]+$/;

const assertSafeSegment = (segment: string) => {
  if (!SAFE_SEGMENT_PATTERN.test(segment)) {
    throw new InvalidStoragePathError();
  }
};

export const assertSafeStoragePath = (path: string): void => {
  if (
    !path ||
    path.startsWith("/") ||
    path.includes("\\") ||
    path
      .split("/")
      .some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new InvalidStoragePathError();
  }

  if (
    path.split("/").some((segment) => !SAFE_PATH_SEGMENT_PATTERN.test(segment))
  ) {
    throw new InvalidStoragePathError();
  }
};

export const createStorageObjectPath = ({
  segments,
  extension,
  createId = randomUUID,
}: {
  segments: string[];
  extension: string;
  createId?: () => string;
}): string => {
  segments.forEach(assertSafeSegment);
  if (!SAFE_EXTENSION_PATTERN.test(extension)) {
    throw new InvalidStoragePathError();
  }

  const objectId = createId();
  assertSafeSegment(objectId);
  const path = [...segments, `${objectId}.${extension}`].join("/");
  assertSafeStoragePath(path);
  return path;
};

export const createMerchantLogoPath = (
  merchantId: string,
  extension: string,
  createId?: () => string,
) =>
  createStorageObjectPath({
    segments: ["merchants", merchantId, "logo"],
    extension,
    createId,
  });

export const createProductImagePath = (
  merchantId: string,
  productId: string,
  extension: string,
  createId?: () => string,
) =>
  createStorageObjectPath({
    segments: ["merchants", merchantId, "products", productId],
    extension,
    createId,
  });

export const createBannerImagePath = (
  bannerId: string,
  extension: string,
  createId?: () => string,
) =>
  createStorageObjectPath({
    segments: ["banners", bannerId],
    extension,
    createId,
  });

export const createVerificationEvidencePath = (
  merchantId: string,
  submissionId: string,
  extension: string,
  createId?: () => string,
) =>
  createStorageObjectPath({
    segments: ["verification", merchantId, submissionId],
    extension,
    createId,
  });
