import {
  GlobalUserRole,
  MerchantMembershipRole,
  MerchantStatus,
  MerchantVerificationStatus,
} from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createTenantResourceScope,
  ForbiddenError,
  requireActiveMerchantForMutation,
  requireAuthenticatedUser,
  requireMerchantAdmin,
  requireMerchantMembership,
  requireMerchantRole,
  requireSuperAdmin,
  requireTenantResourceScope,
  UnauthenticatedError,
  type AuthorizationDependencies,
} from "./authorization";

const currentVersion = new Date("2026-09-24T00:00:00.000Z");

const session = (role: GlobalUserRole = GlobalUserRole.USER) => ({
  user: {
    id: "user-a",
    globalRole: role,
    userVersion: currentVersion.toISOString(),
  },
  issuedAt: 1,
  expires: "2026-09-25T00:00:00.000Z",
});

const user = (role: GlobalUserRole = GlobalUserRole.USER) => ({
  id: "user-a",
  globalRole: role,
  isActive: true,
  updatedAt: currentVersion,
});

const membership = ({
  merchantId = "merchant-a",
  role = MerchantMembershipRole.OWNER,
  status = MerchantStatus.ACTIVE,
  verificationStatus = MerchantVerificationStatus.BELUM_DIVERIFIKASI,
}: {
  merchantId?: string;
  role?: MerchantMembershipRole;
  status?: MerchantStatus;
  verificationStatus?: MerchantVerificationStatus;
} = {}) => ({
  id: "membership-a",
  userId: "user-a",
  merchantId,
  role,
  merchant: { status, verificationStatus },
});

const dependencies = (
  overrides: Partial<AuthorizationDependencies> = {},
): AuthorizationDependencies => ({
  getSession: vi.fn().mockResolvedValue(session()),
  findUser: vi.fn().mockResolvedValue(user()),
  findMembership: vi.fn().mockResolvedValue(membership()),
  ...overrides,
});

describe("authorization foundation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects unauthenticated and inactive/version-revoked users", async () => {
    await expect(
      requireAuthenticatedUser(
        dependencies({ getSession: vi.fn().mockResolvedValue(null) }),
      ),
    ).rejects.toBeInstanceOf(UnauthenticatedError);

    await expect(
      requireAuthenticatedUser(
        dependencies({
          findUser: vi.fn().mockResolvedValue({
            ...user(),
            isActive: false,
          }),
        }),
      ),
    ).rejects.toBeInstanceOf(UnauthenticatedError);

    await expect(
      requireAuthenticatedUser(
        dependencies({
          findUser: vi.fn().mockResolvedValue({
            ...user(),
            updatedAt: new Date("2026-09-24T01:00:00.000Z"),
          }),
        }),
      ),
    ).rejects.toBeInstanceOf(UnauthenticatedError);
  });

  it("trusts the current database global role instead of a forged session role", async () => {
    const deps = dependencies({
      getSession: vi
        .fn()
        .mockResolvedValue(session(GlobalUserRole.SUPER_ADMIN)),
      findUser: vi.fn().mockResolvedValue(user(GlobalUserRole.USER)),
    });

    await expect(requireSuperAdmin(deps)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it("authorizes a database-backed Super Admin without tenant membership", async () => {
    const findMembership = vi.fn();
    const result = await requireSuperAdmin(
      dependencies({
        findUser: vi.fn().mockResolvedValue(user(GlobalUserRole.SUPER_ADMIN)),
        findMembership,
      }),
    );

    expect(result.globalRole).toBe(GlobalUserRole.SUPER_ADMIN);
    expect(findMembership).not.toHaveBeenCalled();
  });

  it("authorizes active OWNER access to its own unverified merchant", async () => {
    const findMembership = vi.fn().mockResolvedValue(membership());
    const result = await requireMerchantMembership("merchant-a", {
      dependencies: dependencies({ findMembership }),
    });

    expect(result.merchant.verificationStatus).toBe("BELUM_DIVERIFIKASI");
    expect(findMembership).toHaveBeenCalledWith({
      userId: "user-a",
      merchantId: "merchant-a",
      roles: undefined,
    });
  });

  it("denies missing, inactive, revoked, and cross-tenant membership", async () => {
    const findMembership = vi.fn().mockResolvedValue(null);
    const deps = dependencies({ findMembership });

    await expect(
      requireMerchantMembership("merchant-b", { dependencies: deps }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(findMembership).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-a",
        merchantId: "merchant-b",
      }),
    );

    findMembership
      .mockResolvedValueOnce(membership())
      .mockResolvedValueOnce(null);
    await expect(
      requireMerchantMembership("merchant-a", { dependencies: deps }),
    ).resolves.toMatchObject({ merchantId: "merchant-a" });
    await expect(
      requireMerchantMembership("merchant-a", { dependencies: deps }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("enforces OWNER requirements without granting them to ADMIN", async () => {
    const findMembership = vi
      .fn()
      .mockResolvedValueOnce(membership())
      .mockResolvedValueOnce(null);
    const deps = dependencies({ findMembership });

    await expect(
      requireMerchantRole("merchant-a", [MerchantMembershipRole.OWNER], deps),
    ).resolves.toMatchObject({ role: "OWNER" });
    await expect(
      requireMerchantRole("merchant-a", [MerchantMembershipRole.OWNER], deps),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("allows suspended merchants to read the dashboard but blocks public mutation", async () => {
    const suspended = membership({ status: MerchantStatus.SUSPENDED });
    const findMembership = vi.fn().mockResolvedValue(suspended);
    const deps = dependencies({ findMembership });

    await expect(requireMerchantAdmin(deps)).resolves.toEqual(suspended);
    await expect(
      requireActiveMerchantForMutation("merchant-a", deps),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("creates an IDOR-safe resource scope using the authorized merchant", () => {
    expect(createTenantResourceScope("resource-b", "merchant-a")).toEqual({
      id: "resource-b",
      merchantId: "merchant-a",
    });
  });

  it("does not create a resource scope when client tenant context lacks membership", async () => {
    const findMembership = vi.fn().mockResolvedValue(null);

    await expect(
      requireTenantResourceScope(
        "resource-b",
        "merchant-b",
        dependencies({ findMembership }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(findMembership).toHaveBeenCalledWith(
      expect.objectContaining({ merchantId: "merchant-b", userId: "user-a" }),
    );
  });
});
