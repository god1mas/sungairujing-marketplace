import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readStorageConfig, type StorageConfig } from "./config";
import {
  InvalidSignedStorageUrlError,
  PrivateStorageUrlError,
  StorageOperationError,
} from "./errors";
import { assertSafeStoragePath } from "./path";
import type {
  ObjectStorage,
  StorageObjectReference,
  StorageUploadInput,
} from "./types";

export const createSupabaseServerClient = (
  config: StorageConfig = readStorageConfig(),
): SupabaseClient =>
  createClient(config.supabaseUrl, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

export const createSupabaseStorage = ({
  client = createSupabaseServerClient(),
  config = readStorageConfig(),
}: {
  client?: SupabaseClient;
  config?: StorageConfig;
} = {}): ObjectStorage => {
  const bucketName = (bucket: StorageObjectReference["bucket"]) =>
    config.buckets[bucket];

  return {
    async upload(input: StorageUploadInput) {
      assertSafeStoragePath(input.path);
      try {
        const { error } = await client.storage
          .from(bucketName(input.bucket))
          .upload(input.path, input.data, {
            cacheControl: input.cacheControl,
            contentType: input.contentType,
            upsert: false,
          });

        if (error) {
          throw new StorageOperationError();
        }
      } catch {
        throw new StorageOperationError();
      }

      return { bucket: input.bucket, path: input.path };
    },

    async remove(reference: StorageObjectReference) {
      assertSafeStoragePath(reference.path);
      try {
        const { error } = await client.storage
          .from(bucketName(reference.bucket))
          .remove([reference.path]);

        if (error) {
          throw new StorageOperationError();
        }
      } catch {
        throw new StorageOperationError();
      }
    },

    getPublicUrl(reference: StorageObjectReference) {
      assertSafeStoragePath(reference.path);
      if (reference.bucket !== "publicMedia") {
        throw new PrivateStorageUrlError();
      }

      try {
        return client.storage
          .from(bucketName(reference.bucket))
          .getPublicUrl(reference.path).data.publicUrl;
      } catch {
        throw new StorageOperationError();
      }
    },

    async createSignedUrl(reference, expiresInSeconds) {
      assertSafeStoragePath(reference.path);
      if (
        reference.bucket !== "privateEvidence" ||
        !Number.isSafeInteger(expiresInSeconds) ||
        expiresInSeconds <= 0
      ) {
        throw new InvalidSignedStorageUrlError();
      }

      try {
        const { data, error } = await client.storage
          .from(bucketName(reference.bucket))
          .createSignedUrl(reference.path, expiresInSeconds);
        if (error || !data.signedUrl) {
          throw new StorageOperationError();
        }
        return data.signedUrl;
      } catch {
        throw new StorageOperationError();
      }
    },
  };
};
