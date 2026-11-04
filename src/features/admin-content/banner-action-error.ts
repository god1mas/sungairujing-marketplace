import {
  StorageConfigurationError,
  StorageOperationError,
} from "@/lib/storage/errors";

export type BannerActionErrorCode =
  "storage-configuration" | "storage-operation";

export const getBannerActionErrorCode = (
  error: unknown,
): BannerActionErrorCode | null => {
  if (error instanceof StorageConfigurationError) {
    return "storage-configuration";
  }
  if (error instanceof StorageOperationError) {
    return "storage-operation";
  }
  return null;
};

export const getBannerActionErrorMessage = (
  code: string | undefined,
): string | null => {
  if (code === "storage-configuration") {
    return "Penyimpanan gambar belum dikonfigurasi untuk lingkungan ini. Hubungi pengelola aplikasi.";
  }
  if (code === "storage-operation") {
    return "Gambar banner belum berhasil diproses. Silakan coba kembali.";
  }
  return null;
};
