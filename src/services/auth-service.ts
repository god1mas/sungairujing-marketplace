import type { GlobalUserRole } from "@prisma/client";
import { loginSchema, type LoginInput } from "@/features/auth/schemas/login";
import { normalizeWhatsAppNumber } from "@/lib/auth/whatsapp";
import { verifyPassword } from "@/lib/auth/password";
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
  } catch {
    return null;
  }

  const user = await findUser(normalizedWhatsapp);

  if (!user?.isActive) {
    return null;
  }

  const passwordIsValid = await verifyPassword(
    user.passwordHash,
    input.password,
  );

  if (!passwordIsValid) {
    return null;
  }

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
  const identifier = validation.success
    ? validation.data.whatsappNumber
    : String(input.whatsappNumber).trim().toLowerCase();
  const key = createLoginRateLimitKey({
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

  const identity = await authenticateCredentials(
    validation.data,
    dependencies.findUser,
  );

  if (!identity) {
    await limiter.recordFailure(key);
  }

  return identity;
};
