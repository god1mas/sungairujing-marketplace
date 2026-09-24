import "server-only";

import sharp from "sharp";
import { EvidenceValidationError } from "./errors";

export const EVIDENCE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export type EvidenceMimeType = (typeof EVIDENCE_MIME_TYPES)[number];

export type EvidenceFileInput = {
  data: ArrayBuffer;
  mimeType: string;
  originalFilename: string;
};

export type ValidatedEvidenceFile = EvidenceFileInput & {
  mimeType: EvidenceMimeType;
  extension: "jpg" | "png" | "webp" | "pdf";
  sizeBytes: number;
};

const MAX_EVIDENCE_FILES = 3;
const MAX_EVIDENCE_BYTES = 8 * 1024 * 1024;

const EVIDENCE_FORMAT: Record<
  EvidenceMimeType,
  { extension: ValidatedEvidenceFile["extension"]; decodedFormat?: string }
> = {
  "image/jpeg": { extension: "jpg", decodedFormat: "jpeg" },
  "image/png": { extension: "png", decodedFormat: "png" },
  "image/webp": { extension: "webp", decodedFormat: "webp" },
  "application/pdf": { extension: "pdf" },
};

const isEvidenceMimeType = (mimeType: string): mimeType is EvidenceMimeType =>
  EVIDENCE_MIME_TYPES.includes(mimeType as EvidenceMimeType);

const isValidPdf = (data: ArrayBuffer): boolean => {
  const bytes = new Uint8Array(data);
  const header = new TextDecoder("ascii").decode(bytes.slice(0, 5));
  const tail = new TextDecoder("ascii").decode(bytes.slice(-1024));
  return header === "%PDF-" && tail.includes("%%EOF");
};

export const assertEvidenceFileCount = (
  incomingCount: number,
  existingCount = 0,
): void => {
  if (
    !Number.isSafeInteger(incomingCount) ||
    !Number.isSafeInteger(existingCount) ||
    incomingCount < 0 ||
    existingCount < 0 ||
    incomingCount + existingCount > MAX_EVIDENCE_FILES
  ) {
    throw new EvidenceValidationError("TOO_MANY_FILES");
  }
};

export const validateEvidenceFile = async (
  input: EvidenceFileInput,
): Promise<ValidatedEvidenceFile> => {
  if (!isEvidenceMimeType(input.mimeType)) {
    throw new EvidenceValidationError("INVALID_MIME");
  }
  if (input.data.byteLength > MAX_EVIDENCE_BYTES) {
    throw new EvidenceValidationError("FILE_TOO_LARGE");
  }

  const format = EVIDENCE_FORMAT[input.mimeType];
  try {
    if (input.mimeType === "application/pdf") {
      if (!isValidPdf(input.data)) {
        throw new EvidenceValidationError("INVALID_FILE");
      }
    } else {
      const metadata = await sharp(Buffer.from(input.data), {
        failOn: "error",
      }).metadata();
      if (metadata.format !== format.decodedFormat) {
        throw new EvidenceValidationError("INVALID_FILE");
      }
    }
  } catch (error) {
    if (error instanceof EvidenceValidationError) {
      throw error;
    }
    throw new EvidenceValidationError("INVALID_FILE");
  }

  return {
    ...input,
    mimeType: input.mimeType,
    extension: format.extension,
    sizeBytes: input.data.byteLength,
  };
};
