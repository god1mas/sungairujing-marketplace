import "server-only";

import { z } from "zod";
import { StorageConfigurationError } from "./errors";
import type { StorageBucket } from "./types";

const bucketName = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/);

const storageEnvironmentSchema = z
  .object({
    SUPABASE_URL: z.url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    SUPABASE_PUBLIC_MEDIA_BUCKET: bucketName,
    SUPABASE_PRIVATE_EVIDENCE_BUCKET: bucketName,
  })
  .refine(
    (environment) =>
      environment.SUPABASE_PUBLIC_MEDIA_BUCKET !==
      environment.SUPABASE_PRIVATE_EVIDENCE_BUCKET,
    { message: "Bucket publik dan privat harus berbeda." },
  );

export type StorageConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  buckets: Record<StorageBucket, string>;
};

export const readStorageConfig = (
  environment: Partial<NodeJS.ProcessEnv> = process.env,
): StorageConfig => {
  const parsed = storageEnvironmentSchema.safeParse(environment);
  if (!parsed.success) {
    throw new StorageConfigurationError();
  }

  return {
    supabaseUrl: parsed.data.SUPABASE_URL,
    serviceRoleKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY,
    buckets: {
      publicMedia: parsed.data.SUPABASE_PUBLIC_MEDIA_BUCKET,
      privateEvidence: parsed.data.SUPABASE_PRIVATE_EVIDENCE_BUCKET,
    },
  };
};
