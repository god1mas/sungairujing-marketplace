import "server-only";

import {
  GlobalUserRole,
  MerchantMembershipRole,
  MerchantStatus,
} from "@prisma/client";
import type { Session } from "next-auth";
import { getAuthenticatedSession } from "./session";
import {
  findActiveMerchantMembership,
  findAuthorizationUserById,
  type ActiveMerchantMembershipRecord,
  type AuthorizationUserRecord,
} from "@/repositories/authorization-repository";

export class UnauthenticatedError extends Error {
  constructor() {
    super("Authentication required.");
    this.name = "UnauthenticatedError";
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("Access forbidden.");
    this.name = "ForbiddenError";
  }
}

type SessionReader = () => Promise<Session | null>;
type UserReader = (userId: string) => Promise<AuthorizationUserRecord | null>;
type MembershipReader = (input: {
  userId: string;
  merchantId?: string;
  roles?: MerchantMembershipRole[];
}) => Promise<ActiveMerchantMembershipRecord | null>;

export type AuthorizationDependencies = {
  getSession?: SessionReader;
  findUser?: UserReader;
  findMembership?: MembershipReader;
};

const resolveDependencies = (dependencies: AuthorizationDependencies) => ({
  getSession: dependencies.getSession ?? getAuthenticatedSession,
  findUser: dependencies.findUser ?? findAuthorizationUserById,
  findMembership: dependencies.findMembership ?? findActiveMerchantMembership,
});

export const requireAuthenticatedUser = async (
  dependencies: AuthorizationDependencies = {},
): Promise<AuthorizationUserRecord> => {
  const resolved = resolveDependencies(dependencies);
  const session = await resolved.getSession();

  if (!session?.user.id || !session.user.userVersion) {
    throw new UnauthenticatedError();
  }

  const user = await resolved.findUser(session.user.id);
  if (
    !user?.isActive ||
    user.updatedAt.toISOString() !== session.user.userVersion
  ) {
    throw new UnauthenticatedError();
  }

  return user;
};

export const requireGlobalRole = async (
  role: GlobalUserRole,
  dependencies: AuthorizationDependencies = {},
): Promise<AuthorizationUserRecord> => {
  const user = await requireAuthenticatedUser(dependencies);

  if (user.globalRole !== role) {
    throw new ForbiddenError();
  }

  return user;
};

export const requireSuperAdmin = (
  dependencies: AuthorizationDependencies = {},
) => requireGlobalRole(GlobalUserRole.SUPER_ADMIN, dependencies);

export const requireMerchantMembership = async (
  merchantId: string,
  options: {
    roles?: MerchantMembershipRole[];
    dependencies?: AuthorizationDependencies;
  } = {},
): Promise<ActiveMerchantMembershipRecord> => {
  const dependencies = options.dependencies ?? {};
  const resolved = resolveDependencies(dependencies);
  const user = await requireGlobalRole(GlobalUserRole.USER, dependencies);
  const membership = await resolved.findMembership({
    userId: user.id,
    merchantId,
    roles: options.roles,
  });

  if (!membership) {
    throw new ForbiddenError();
  }

  return membership;
};

export const requireMerchantRole = (
  merchantId: string,
  roles: MerchantMembershipRole[],
  dependencies: AuthorizationDependencies = {},
) => requireMerchantMembership(merchantId, { roles, dependencies });

export const requireMerchantOwnership = (
  resourceMerchantId: string,
  dependencies: AuthorizationDependencies = {},
) => requireMerchantMembership(resourceMerchantId, { dependencies });

export const requireMerchantAdmin = async (
  dependencies: AuthorizationDependencies = {},
): Promise<ActiveMerchantMembershipRecord> => {
  const resolved = resolveDependencies(dependencies);
  const user = await requireGlobalRole(GlobalUserRole.USER, dependencies);
  const membership = await resolved.findMembership({
    userId: user.id,
    roles: [MerchantMembershipRole.OWNER, MerchantMembershipRole.ADMIN],
  });

  if (!membership) {
    throw new ForbiddenError();
  }

  return membership;
};

export const requireActiveMerchantForMutation = async (
  merchantId: string,
  dependencies: AuthorizationDependencies = {},
): Promise<ActiveMerchantMembershipRecord> => {
  const membership = await requireMerchantOwnership(merchantId, dependencies);

  if (membership.merchant.status !== MerchantStatus.ACTIVE) {
    throw new ForbiddenError();
  }

  return membership;
};

export const createTenantResourceScope = (
  resourceId: string,
  authorizedMerchantId: string,
) => ({
  id: resourceId,
  merchantId: authorizedMerchantId,
});

export const requireTenantResourceScope = async (
  resourceId: string,
  targetMerchantId: string,
  dependencies: AuthorizationDependencies = {},
) => {
  const membership = await requireMerchantOwnership(
    targetMerchantId,
    dependencies,
  );

  return createTenantResourceScope(resourceId, membership.merchantId);
};
