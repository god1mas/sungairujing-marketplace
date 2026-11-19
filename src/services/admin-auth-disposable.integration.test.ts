// @vitest-environment node

import { randomBytes } from "node:crypto";
import {
  GlobalUserRole,
  MerchantMembershipRole,
  MerchantOperationalStatus,
  MerchantVerificationStatus,
  ModerationActionType,
  PrismaClient,
} from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";
import type { Session } from "next-auth";
import {
  ForbiddenError,
  requireMerchantAdmin,
  requireSuperAdmin,
  UnauthenticatedError,
} from "@/lib/auth/authorization";
import { hashPassword } from "@/lib/auth/password";
import {
  createInMemoryLoginRateLimiter,
  createAdminLoginRateLimitKey,
  createLoginRateLimitKey,
} from "@/lib/rate-limit/login";
import {
  authenticateAdminLogin,
  authenticateLogin,
} from "@/services/auth-service";
import { provisionAdminUsername } from "@/services/admin-username-provisioning-service";

const disposableUrl =
  "postgresql://postgres@127.0.0.1:55433/admin_auth_verify?schema=public";
const enabled = process.env.ADMIN_AUTH_TEST_DATABASE_URL === disposableUrl;

if (process.env.ADMIN_AUTH_TEST_DATABASE_URL && !enabled) {
  throw new Error(
    "Database integrasi harus PostgreSQL disposable yang disetujui.",
  );
}
if (
  enabled &&
  (process.env.DATABASE_URL !== disposableUrl ||
    process.env.DIRECT_URL !== disposableUrl)
) {
  throw new Error(
    "DATABASE_URL dan DIRECT_URL harus menunjuk database disposable.",
  );
}

const db = enabled
  ? new PrismaClient({ datasources: { db: { url: disposableUrl } } })
  : null;

afterAll(async () => {
  await db?.$disconnect();
});

describe.skipIf(!enabled)(
  "admin username authentication on disposable PostgreSQL",
  () => {
    it("preserves the admin identity, audit links, and role-separated authentication", async () => {
      if (!db) throw new Error("Disposable database is unavailable.");

      const suffix = randomBytes(6).toString("hex");
      const adminPassword = randomBytes(24).toString("base64url");
      const merchantPassword = randomBytes(24).toString("base64url");
      const admin = await db.user.create({
        data: {
          name: "Admin Integrasi",
          whatsappNumber: `62811${BigInt(`0x${suffix}`).toString().slice(0, 11)}`,
          passwordHash: await hashPassword(adminPassword),
          globalRole: GlobalUserRole.SUPER_ADMIN,
        },
      });
      const merchantUser = await db.user.create({
        data: {
          name: "Merchant Integrasi",
          whatsappNumber: `62812${BigInt(`0x${suffix}`).toString().slice(0, 11)}`,
          passwordHash: await hashPassword(merchantPassword),
          globalRole: GlobalUserRole.USER,
        },
      });
      const merchant = await db.merchant.create({
        data: {
          name: "Toko Integrasi",
          slug: `integration-${suffix}`,
          address: "Alamat pengujian disposable",
          publicWhatsappNumber: merchantUser.whatsappNumber,
          operationalStatus: MerchantOperationalStatus.BUKA,
          verificationStatus: MerchantVerificationStatus.BELUM_DIVERIFIKASI,
        },
      });
      const membership = await db.merchantMembership.create({
        data: {
          merchantId: merchant.id,
          userId: merchantUser.id,
          role: MerchantMembershipRole.OWNER,
        },
      });
      const audit = await db.moderationAction.create({
        data: {
          actionType: ModerationActionType.MERCHANT_REACTIVATED,
          actorUserId: admin.id,
          merchantId: merchant.id,
          targetNameSnapshot: merchant.name,
        },
      });

      expect(admin.adminUsername).toBeNull();
      expect(merchantUser.adminUsername).toBeNull();

      const provision = () =>
        provisionAdminUsername(
          { userId: admin.id, username: "admin_sungairujing" },
          {
            findUserById: (id) => db.user.findUnique({ where: { id } }),
            findUserByUsername: (adminUsername) =>
              db.user.findUnique({ where: { adminUsername } }),
            setUsernameIfUnset: async ({ id, username }) => {
              const result = await db.user.updateMany({
                where: {
                  id,
                  globalRole: GlobalUserRole.SUPER_ADMIN,
                  adminUsername: null,
                },
                data: { adminUsername: username },
              });
              return result.count === 1;
            },
          },
        );
      await expect(provision()).resolves.toBe("updated");
      await expect(provision()).resolves.toBe("already-set");

      const updated = await db.user.findUniqueOrThrow({
        where: { id: admin.id },
      });
      expect(updated.id).toBe(admin.id);
      expect(updated.passwordHash).toBe(admin.passwordHash);
      expect(updated.adminUsername).toBe("admin_sungairujing");
      expect(
        await db.moderationAction.findUniqueOrThrow({
          where: { id: audit.id },
        }),
      ).toMatchObject({ actorUserId: admin.id, merchantId: merchant.id });
      expect(
        await db.merchantMembership.findUniqueOrThrow({
          where: { id: membership.id },
        }),
      ).toMatchObject({ userId: merchantUser.id, merchantId: merchant.id });

      await expect(
        db.user.create({
          data: {
            name: "Duplikat Admin",
            whatsappNumber: `62813${BigInt(`0x${suffix}`).toString().slice(0, 11)}`,
            passwordHash: admin.passwordHash,
            globalRole: GlobalUserRole.SUPER_ADMIN,
            adminUsername: "admin_sungairujing",
          },
        }),
      ).rejects.toMatchObject({ code: "P2002" });
      await expect(
        db.user.update({
          where: { id: merchantUser.id },
          data: { adminUsername: "merchant_invalid" },
        }),
      ).rejects.toThrow();

      const findAdmin = (adminUsername: string) =>
        db.user.findUnique({ where: { adminUsername } });
      const findMerchant = (whatsappNumber: string) =>
        db.user.findUnique({ where: { whatsappNumber } });
      const context = { ipAddress: "127.0.0.1" };
      const adminLimiter = createInMemoryLoginRateLimiter();
      const merchantLimiter = createInMemoryLoginRateLimiter();

      await expect(
        authenticateAdminLogin(
          { username: "admin_sungairujing", password: adminPassword },
          context,
          { limiter: adminLimiter, findUser: findAdmin },
        ),
      ).resolves.toMatchObject({
        id: admin.id,
        globalRole: GlobalUserRole.SUPER_ADMIN,
      });
      await expect(
        authenticateLogin(
          { whatsappNumber: admin.whatsappNumber, password: adminPassword },
          context,
          { limiter: merchantLimiter, findUser: findMerchant },
        ),
      ).resolves.toBeNull();
      await expect(
        authenticateLogin(
          {
            whatsappNumber: merchantUser.whatsappNumber,
            password: merchantPassword,
          },
          context,
          { limiter: merchantLimiter, findUser: findMerchant },
        ),
      ).resolves.toMatchObject({
        id: merchantUser.id,
        globalRole: GlobalUserRole.USER,
      });
      await expect(
        authenticateAdminLogin(
          { username: merchantUser.whatsappNumber, password: merchantPassword },
          context,
          { limiter: adminLimiter, findUser: findAdmin },
        ),
      ).resolves.toBeNull();
      await expect(
        authenticateAdminLogin(
          { username: "admin_sungairujing", password: "wrong-password" },
          context,
          { limiter: adminLimiter, findUser: findAdmin },
        ),
      ).resolves.toBeNull();

      const findAuthorizationUser = (id: string) =>
        db.user.findUnique({
          where: { id },
          select: {
            id: true,
            globalRole: true,
            isActive: true,
            updatedAt: true,
          },
        });
      const adminSession = {
        user: {
          id: admin.id,
          globalRole: GlobalUserRole.SUPER_ADMIN,
          userVersion: updated.updatedAt.toISOString(),
        },
      } as Session;
      const merchantSession = {
        user: {
          id: merchantUser.id,
          globalRole: GlobalUserRole.USER,
          userVersion: merchantUser.updatedAt.toISOString(),
        },
      } as Session;
      await expect(
        requireSuperAdmin({
          getSession: async () => adminSession,
          findUser: findAuthorizationUser,
        }),
      ).resolves.toMatchObject({ id: admin.id });
      await expect(
        requireSuperAdmin({
          getSession: async () => merchantSession,
          findUser: findAuthorizationUser,
        }),
      ).rejects.toBeInstanceOf(ForbiddenError);
      await expect(
        requireMerchantAdmin({
          getSession: async () => adminSession,
          findUser: findAuthorizationUser,
        }),
      ).rejects.toBeInstanceOf(ForbiddenError);
      await expect(
        requireSuperAdmin({
          getSession: async () => null,
          findUser: findAuthorizationUser,
        }),
      ).rejects.toBeInstanceOf(UnauthenticatedError);

      await db.user.update({
        where: { id: admin.id },
        data: { isActive: false },
      });
      await expect(
        requireSuperAdmin({
          getSession: async () => adminSession,
          findUser: findAuthorizationUser,
        }),
      ).rejects.toBeInstanceOf(UnauthenticatedError);
      await expect(
        authenticateAdminLogin(
          { username: "admin_sungairujing", password: adminPassword },
          context,
          { limiter: adminLimiter, findUser: findAdmin },
        ),
      ).resolves.toBeNull();
      await db.user.update({
        where: { id: merchantUser.id },
        data: { isActive: false },
      });
      await expect(
        authenticateLogin(
          {
            whatsappNumber: merchantUser.whatsappNumber,
            password: merchantPassword,
          },
          context,
          { limiter: merchantLimiter, findUser: findMerchant },
        ),
      ).resolves.toBeNull();

      const isolatedLimiter = createInMemoryLoginRateLimiter();
      const adminKey = createAdminLoginRateLimitKey({
        identifier: "admin_sungairujing",
        ipAddress: context.ipAddress,
      });
      const merchantKey = createLoginRateLimitKey({
        identifier: "admin_sungairujing",
        ipAddress: context.ipAddress,
      });
      expect(adminKey).not.toBe(merchantKey);
      for (let attempt = 0; attempt < 5; attempt++) {
        await isolatedLimiter.recordFailure(adminKey);
      }
      expect(await isolatedLimiter.isAllowed(adminKey)).toBe(false);
      expect(await isolatedLimiter.isAllowed(merchantKey)).toBe(true);
    });
  },
);
