import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  StorageConfigurationError,
  StorageOperationError,
} from "@/lib/storage/errors";

const mocks = vi.hoisted(() => ({
  deleteBanner: vi.fn(),
  redirect: vi.fn(),
  revalidatePath: vi.fn(),
  saveBanner: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/services/admin-content-service", () => ({
  deleteBanner: mocks.deleteBanner,
  saveBanner: mocks.saveBanner,
}));

import { deleteBannerAction, saveBannerAction } from "./actions";

const redirectSignal = new Error("NEXT_REDIRECT");

describe("banner server action error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.redirect.mockImplementation(() => {
      throw redirectSignal;
    });
  });

  it("redirects a configuration failure to safe banner UI feedback", async () => {
    mocks.saveBanner.mockRejectedValue(new StorageConfigurationError());

    await expect(saveBannerAction(new FormData())).rejects.toBe(redirectSignal);

    expect(mocks.redirect).toHaveBeenCalledWith(
      "/admin/banners?error=storage-configuration",
    );
  });

  it("redirects a provider failure to safe banner UI feedback", async () => {
    mocks.deleteBanner.mockRejectedValue(new StorageOperationError());
    const formData = new FormData();
    formData.set("id", "18faef4c-aac3-4cb7-b7b8-c786d20cfb13");

    await expect(deleteBannerAction(formData)).rejects.toBe(redirectSignal);

    expect(mocks.redirect).toHaveBeenCalledWith(
      "/admin/banners?error=storage-operation",
    );
  });

  it("does not hide an unrelated server failure", async () => {
    const unexpected = new Error("unexpected");
    mocks.saveBanner.mockRejectedValue(unexpected);

    await expect(saveBannerAction(new FormData())).rejects.toBe(unexpected);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
