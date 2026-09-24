export type StorageBucket = "publicMedia" | "privateEvidence";

export type StorageObjectReference = {
  bucket: StorageBucket;
  path: string;
};

export type StorageUploadInput = StorageObjectReference & {
  data: ArrayBuffer;
  contentType: string;
  cacheControl?: string;
};

export interface ObjectStorage {
  upload(input: StorageUploadInput): Promise<StorageObjectReference>;
  remove(reference: StorageObjectReference): Promise<void>;
  getPublicUrl(reference: StorageObjectReference): string;
  createSignedUrl(
    reference: StorageObjectReference,
    expiresInSeconds: number,
  ): Promise<string>;
}
