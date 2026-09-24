import { describe, expect, it } from "vitest";
import { StorageConfigurationError } from "./errors";
import { readStorageConfig } from "./config";

const validEnvironment = {
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "test-only-service-role-placeholder",
  SUPABASE_PUBLIC_MEDIA_BUCKET: "public-media",
  SUPABASE_PRIVATE_EVIDENCE_BUCKET: "private-evidence",
};

describe("storage configuration", () => {
  it("maps server configuration to fixed logical buckets", () => {
    expect(readStorageConfig(validEnvironment)).toEqual({
      supabaseUrl: "https://project.supabase.co",
      serviceRoleKey: "test-only-service-role-placeholder",
      buckets: {
        publicMedia: "public-media",
        privateEvidence: "private-evidence",
      },
    });
  });

  it.each([
    {},
    { ...validEnvironment, SUPABASE_SERVICE_ROLE_KEY: "" },
    {
      ...validEnvironment,
      SUPABASE_PRIVATE_EVIDENCE_BUCKET: "public-media",
    },
    { ...validEnvironment, SUPABASE_PUBLIC_MEDIA_BUCKET: "../unsafe" },
  ])("fails closed for invalid or unsafe configuration", (environment) => {
    expect(() => readStorageConfig(environment)).toThrow(
      StorageConfigurationError,
    );
  });

  it("does not expose configuration values in errors", () => {
    const secret = "sensitive-service-role-value";
    let message = "";
    try {
      readStorageConfig({
        ...validEnvironment,
        SUPABASE_URL: "not-a-url",
        SUPABASE_SERVICE_ROLE_KEY: secret,
      });
    } catch (error) {
      message = String(error);
    }

    expect(message).not.toContain(secret);
  });
});
