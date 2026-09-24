import "server-only";

import sharp from "sharp";
import { ImageValidationError } from "./errors";

export const PUBLIC_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type PublicImageMimeType = (typeof PUBLIC_IMAGE_MIME_TYPES)[number];
export type PublicImagePurpose = "product" | "merchantLogo" | "banner";

export type PublicImageInput = {
  data: ArrayBuffer;
  mimeType: string;
};

export type ProcessedPublicImage = {
  data: ArrayBuffer;
  contentType: "image/webp";
  extension: "webp";
  sizeBytes: number;
  width: number;
  height: number;
};

const IMAGE_RULES: Record<
  PublicImagePurpose,
  { maxBytes: number; maxWidth: number; maxHeight?: number; quality: number }
> = {
  product: {
    maxBytes: 5 * 1024 * 1024,
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 80,
  },
  merchantLogo: {
    maxBytes: 3 * 1024 * 1024,
    maxWidth: 800,
    maxHeight: 800,
    quality: 82,
  },
  banner: { maxBytes: 8 * 1024 * 1024, maxWidth: 1920, quality: 82 },
};

const DECODED_FORMAT_BY_MIME: Record<PublicImageMimeType, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

const isPublicImageMimeType = (
  mimeType: string,
): mimeType is PublicImageMimeType =>
  PUBLIC_IMAGE_MIME_TYPES.includes(mimeType as PublicImageMimeType);

const toExactArrayBuffer = (buffer: Buffer): ArrayBuffer => {
  const copy = new Uint8Array(buffer.byteLength);
  copy.set(buffer);
  return copy.buffer;
};

export const assertProductImageCount = (count: number): void => {
  if (!Number.isSafeInteger(count) || count < 0 || count > 5) {
    throw new ImageValidationError("TOO_MANY_FILES");
  }
};

export const processPublicImage = async (
  purpose: PublicImagePurpose,
  input: PublicImageInput,
): Promise<ProcessedPublicImage> => {
  const rules = IMAGE_RULES[purpose];

  if (!isPublicImageMimeType(input.mimeType)) {
    throw new ImageValidationError("INVALID_MIME");
  }
  if (input.data.byteLength > rules.maxBytes) {
    throw new ImageValidationError("FILE_TOO_LARGE");
  }

  try {
    const source = sharp(Buffer.from(input.data), { failOn: "error" });
    const metadata = await source.metadata();
    if (metadata.format !== DECODED_FORMAT_BY_MIME[input.mimeType]) {
      throw new ImageValidationError("INVALID_IMAGE");
    }

    const resize = rules.maxHeight
      ? {
          width: rules.maxWidth,
          height: rules.maxHeight,
          fit: "inside" as const,
          withoutEnlargement: true,
        }
      : { width: rules.maxWidth, withoutEnlargement: true };

    const { data, info } = await source
      .rotate()
      .resize(resize)
      .webp({ quality: rules.quality })
      .toBuffer({ resolveWithObject: true });

    return {
      data: toExactArrayBuffer(data),
      contentType: "image/webp",
      extension: "webp",
      sizeBytes: data.byteLength,
      width: info.width,
      height: info.height,
    };
  } catch (error) {
    if (error instanceof ImageValidationError) {
      throw error;
    }
    throw new ImageValidationError("INVALID_IMAGE");
  }
};
