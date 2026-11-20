import { GlobalUserRole } from "@prisma/client";
import {
  adminLoginSchema,
  type AdminLoginInput,
} from "@/features/auth/schemas/admin-login";
import { loginSchema, type LoginInput } from "@/features/auth/schemas/login";
import { logAuthDiagnostic } from "@/lib/auth/auth-diagnostic";
import { normalizeWhatsAppNumber } from "@/lib/auth/whatsapp";
import { verifyPasswordResult } from "@/lib/auth/password";
import { logPrismaErrorDiagnostic } from "@/lib/db/prisma-error-diagnostic";
import {
  createAdminLoginRateLimitKey,
  createLoginRateLimitKey,
  getLoginRateLimiter,
} from "@/lib/rate-limit/login";
import type { LoginRateLimiter } from "@/lib/rate-limit/types";
import {
  findAuthUserByAdminUsername,
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

type AdminUserLookup = (
  adminUsername: string,
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
    logPrismaErrorDiagnostic("user-lookup", error);
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

  if (user.globalRole !== GlobalUserRole.USER) {
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

export const authenticateAdminCredentials = async (
  input: { username: string; password: string },
  findUser: AdminUserLookup = findAuthUserByAdminUsername,
): Promise<AuthIdentity | null> => {
  const user = await findUser(input.username);
  if (!user?.isActive || user.globalRole !== GlobalUserRole.SUPER_ADMIN) {
    return null;
  }

  const result = await verifyPasswordResult(user.passwordHash, input.password);
  if (result !== "pass") {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    globalRole: user.globalRole,
    userVersion: user.updatedAt.toISOString(),
  };
};

export const authenticateAdminLogin = async (
  input: AdminLoginInput,
  context: LoginContext,
  dependencies: {
    limiter?: LoginRateLimiter;
    findUser?: AdminUserLookup;
  } = {},
): Promise<AuthIdentity | null> => {
  const validation = adminLoginSchema.safeParse(input);
  const identifier = validation.success
    ? validation.data.username
    : String(input.username).trim().toLowerCase().slice(0, 32);
  const key = createAdminLoginRateLimitKey({
    identifier,
    ipAddress: context.ipAddress,
  });
  const limiter = dependencies.limiter ?? getLoginRateLimiter();

  if (!(await limiter.isAllowed(key))) {
    return null;
  }

  if (!validation.success) {
    await limiter.recordFailure(key);
    return null;
  }

  const identity = await authenticateAdminCredentials(
    validation.data,
    dependencies.findUser,
  );
  if (!identity) {
    await limiter.recordFailure(key);
  }

  return identity;
};

export const authenticateLogin = async (
  input: LoginInput,
  context: LoginContext,
  dependencies: {
    limiter?: LoginRateLimiter;
    findUser?: AuthUserLookup;
    createRateLimitKey?: typeof createLoginRateLimitKey;
    getLimiter?: typeof getLoginRateLimiter;
  } = {},
): Promise<AuthIdentity | null> => {
  const validation = loginSchema.safeParse(input);
  logAuthDiagnostic(
    validation.success ? "input-validation-pass" : "input-validation-fail",
  );
  const identifier = validation.success
    ? validation.data.whatsappNumber
    : String(input.whatsappNumber).trim().toLowerCase();
  let key: string;
  logAuthDiagnostic("rate-limit-key-start");
  try {
    key = (dependencies.createRateLimitKey ?? createLoginRateLimitKey)({
      identifier,
      ipAddress: context.ipAddress,
    });
    logAuthDiagnostic("rate-limit-key-pass");
  } catch (error) {
    logAuthDiagnostic("rate-limit-key-exception");
    throw error;
  }

  let limiter: LoginRateLimiter;
  logAuthDiagnostic("rate-limiter-init-start");
  try {
    limiter =
      dependencies.limiter ??
      (dependencies.getLimiter ?? getLoginRateLimiter)();
    logAuthDiagnostic("rate-limiter-init-pass");
  } catch (error) {
    logAuthDiagnostic("rate-limiter-init-exception");
    throw error;
  }

  let isAllowed: boolean;
  logAuthDiagnostic("rate-limit-check-start");
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
