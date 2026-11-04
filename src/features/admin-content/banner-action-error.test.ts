import { describe, expect, it } from "vitest";
import {
  StorageConfigurationError,
  StorageOperationError,
} from "@/lib/storage/errors";
import {
  getBannerActionErrorCode,
  getBannerActionErrorMessage,
} from "./banner-action-error";

describe("banner action errors", () => {
  it("maps missing Storage configuration to safe UI feedback", () => {
    const code = getBannerActionErrorCode(new StorageConfigurationError());

    expect(code).toBe("storage-configuration");
    expect(getBannerActionErrorMessage(code ?? undefined)).toBe(
      "Penyimpanan gambar belum dikonfigurasi untuk lingkungan ini. Hubungi pengelola aplikasi.",
    );
  });

  it("maps provider failures without exposing provider details", () => {
    const code = getBannerActionErrorCode(new StorageOperationError());
    const message = getBannerActionErrorMessage(code ?? undefined);

    expect(code).toBe("storage-operation");
    expect(message).toBe(
      "Gambar banner belum berhasil diproses. Silakan coba kembali.",
    );
    expect(message).not.toContain("Supabase");
  });

  it("does not hide unrelated failures", () => {
    expect(getBannerActionErrorCode(new Error("unexpected"))).toBeNull();
    expect(getBannerActionErrorMessage("unexpected")).toBeNull();
  });
});
