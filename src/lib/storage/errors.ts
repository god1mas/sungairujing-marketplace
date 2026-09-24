export class StorageConfigurationError extends Error {
  constructor() {
    super("Konfigurasi penyimpanan belum tersedia.");
    this.name = "StorageConfigurationError";
  }
}

export class InvalidStoragePathError extends Error {
  constructor() {
    super("Path penyimpanan tidak valid.");
    this.name = "InvalidStoragePathError";
  }
}

export class StorageOperationError extends Error {
  constructor() {
    super("Operasi penyimpanan belum berhasil.");
    this.name = "StorageOperationError";
  }
}

export class PrivateStorageUrlError extends Error {
  constructor() {
    super("Object privat tidak memiliki URL publik.");
    this.name = "PrivateStorageUrlError";
  }
}

export class InvalidSignedStorageUrlError extends Error {
  constructor() {
    super("URL sementara hanya tersedia untuk object privat.");
    this.name = "InvalidSignedStorageUrlError";
  }
}

export type ImageValidationErrorCode =
  "INVALID_MIME" | "FILE_TOO_LARGE" | "TOO_MANY_FILES" | "INVALID_IMAGE";

export class ImageValidationError extends Error {
  constructor(public readonly code: ImageValidationErrorCode) {
    super("Berkas gambar tidak valid.");
    this.name = "ImageValidationError";
  }
}

export type EvidenceValidationErrorCode =
  "INVALID_MIME" | "FILE_TOO_LARGE" | "TOO_MANY_FILES" | "INVALID_FILE";

export class EvidenceValidationError extends Error {
  constructor(public readonly code: EvidenceValidationErrorCode) {
    super("Berkas bukti usaha tidak valid.");
    this.name = "EvidenceValidationError";
  }
}
