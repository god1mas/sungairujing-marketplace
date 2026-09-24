import "server-only";

import type { ObjectStorage, StorageObjectReference } from "./types";

export const persistWithStorageCompensation = async <Result>({
  references,
  storage,
  persist,
}: {
  references: StorageObjectReference[];
  storage: ObjectStorage;
  persist: () => Promise<Result>;
}): Promise<Result> => {
  try {
    return await persist();
  } catch (error) {
    await Promise.allSettled(
      references.map((reference) => storage.remove(reference)),
    );
    throw error;
  }
};
