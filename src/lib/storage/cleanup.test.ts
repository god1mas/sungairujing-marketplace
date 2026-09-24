import { describe, expect, it, vi } from "vitest";
import type { ObjectStorage } from "./types";

vi.mock("server-only", () => ({}));

import { persistWithStorageCompensation } from "./cleanup";

const storage = (): ObjectStorage => ({
  upload: vi.fn(),
  remove: vi.fn(async () => undefined),
  getPublicUrl: vi.fn(),
  createSignedUrl: vi.fn(),
});

describe("storage persistence compensation", () => {
  it("keeps uploaded objects after persistence succeeds", async () => {
    const objectStorage = storage();

    await expect(
      persistWithStorageCompensation({
        references: [{ bucket: "publicMedia", path: "safe/object.webp" }],
        storage: objectStorage,
        persist: vi.fn().mockResolvedValue("saved"),
      }),
    ).resolves.toBe("saved");
    expect(objectStorage.remove).not.toHaveBeenCalled();
  });

  it("removes every uploaded object after persistence fails", async () => {
    const objectStorage = storage();
    const persistenceError = new Error("database persistence failed");
    const references = [
      { bucket: "publicMedia", path: "safe/public.webp" },
      {
        bucket: "privateEvidence",
        path: "verification/merchant-a/submission-a/evidence.pdf",
      },
    ] as const;

    await expect(
      persistWithStorageCompensation({
        references: [...references],
        storage: objectStorage,
        persist: vi.fn().mockRejectedValue(persistenceError),
      }),
    ).rejects.toBe(persistenceError);
    expect(objectStorage.remove).toHaveBeenCalledTimes(2);
    expect(objectStorage.remove).toHaveBeenCalledWith(references[0]);
    expect(objectStorage.remove).toHaveBeenCalledWith(references[1]);
  });
});
