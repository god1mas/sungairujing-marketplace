import type { GlobalUserRole } from "@prisma/client";
import { loginSchema, type LoginInput } from "@/features/auth/schemas/login";
import { logAuthDiagnostic } from "@/lib/auth/auth-diagnostic";
import { normalizeWhatsAppNumber } from "@/lib/auth/whatsapp";
import { verifyPasswordResult } from "@/lib/auth/password";
import {
  createLoginRateLimitKey,
  getLoginRateLimiter,
} from "@/lib/rate-limit/login";
import type { LoginRateLimiter } from "@/lib/rate-limit/types";
import {
  findAuthUserByWhatsapp,
  type AuthUserRecord,
} from "@/repositories/auth-user-repository";

export type AuthIdentity = {
  id: string;
  name: string;
  globalRole: GlobalUserRole;
  userVersion: string;
};

export type CredentialsInput = {
  whatsappNumber: string;
  password: string;
};

type LoginContext = {
  ipAddress: string;
};

type AuthUserLookup = (
  whatsappNumber: string,
) => Promise<AuthUserRecord | null>;

export const authenticateCredentials = async (
  input: CredentialsInput,
  findUser: AuthUserLookup = findAuthUserByWhatsapp,
): Promise<AuthIdentity | null> => {
  let normalizedWhatsapp: string;

  try {
    normalizedWhatsapp = normalizeWhatsAppNumber(input.whatsappNumber);
    logAuthDiagnostic("normalization-pass");
  } catch {
    logAuthDiagnostic("normalization-fail");
    return null;
  }

  let user: AuthUserRecord | null;
  try {
    user = await findUser(normalizedWhatsapp);
  } catch (error) {
    logAuthDiagnostic("user-lookup-exception");
    throw error;
  }

  if (!user) {
    logAuthDiagnostic("user-not-found");
    return null;
  }

  logAuthDiagnostic("user-found");

  if (!user.isActive) {
    logAuthDiagnostic("user-inactive");
    return null;
  }

  logAuthDiagnostic("user-active");

  const passwordResult = await verifyPasswordResult(
    user.passwordHash,
    input.password,
  );

  if (passwordResult !== "pass") {
    logAuthDiagnostic(
      passwordResult === "exception"
        ? "password-verify-exception"
        : "password-verify-false",
    );
    return null;
  }

  logAuthDiagnostic("password-verify-pass");

  return {
    id: user.id,
    name: user.name,
    globalRole: user.globalRole,
    userVersion: user.updatedAt.toISOString(),
  };
};

export const authenticateLogin = async (
  input: LoginInput,
  context: LoginContext,
  dependencies: {
    limiter?: LoginRateLimiter;
    findUser?: AuthUserLookup;
  } = {},
): Promise<AuthIdentity | null> => {
  const validation = loginSchema.safeParse(input);
  logAuthDiagnostic(
    validation.success ? "input-validation-pass" : "input-validation-fail",
  );
  const identifier = validation.success
    ? validation.data.whatsappNumber
    : String(input.whatsappNumber).trim().toLowerCase();
  const key = createLoginRateLimitKey({
    identifier,
    ipAddress: context.ipAddress,
  });
  const limiter = dependencies.limiter ?? getLoginRateLimiter();

  let isAllowed: boolean;
  try {
    isAllowed = await limiter.isAllowed(key);
  } catch (error) {
    logAuthDiagnostic("rate-limit-exception");
    throw error;
  }

  if (!isAllowed) {
    logAuthDiagnostic("rate-limit-blocked");
    return null;
  }

  logAuthDiagnostic("rate-limit-pass");

  if (!validation.success) {
    await limiter.recordFailure(key);
    return null;
  }

  const identity = await authenticateCredentials(
    validation.data,
    dependencies.findUser,
  );

  if (!identity) {
    await limiter.recordFailure(key);
  } else {
    logAuthDiagnostic("authorize-success");
  }

  return identity;
};
