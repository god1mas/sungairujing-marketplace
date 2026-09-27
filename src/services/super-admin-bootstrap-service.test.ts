import { GlobalUserRole } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import {
  bootstrapSuperAdmin,
  SuperAdminBootstrapError,
  type SuperAdminBootstrapDependencies,
} from "./super-admin-bootstrap-service";

const environment = {
  SEED_ADMIN_WHATSAPP: "0812 3456 7890",
  SEED_ADMIN_PASSWORD: "strong-password",
};

const dependencies = (
  overrides: Partial<SuperAdminBootstrapDependencies> = {},
) => ({
  findUserByWhatsapp: vi.fn().mockResolvedValue(null),
  createUser: vi.fn().mockResolvedValue({ id: "admin-1" }),
  hash: vi.fn().mockResolvedValue("$argon2id$secure-hash"),
  ...overrides,
});

describe("bootstrapSuperAdmin", () => {
  it.each(["SEED_ADMIN_WHATSAPP", "SEED_ADMIN_PASSWORD"] as const)(
    "rejects missing %s",
    async (name) => {
      const input = { ...environment, [name]: "" };

      await expect(bootstrapSuperAdmin(input, dependencies())).rejects.toThrow(
        `${name} wajib diisi.`,
      );
    },
  );

  it("normalizes WhatsApp and creates only a SUPER_ADMIN user", async () => {
    const deps = dependencies();

    await expect(bootstrapSuperAdmin(environment, deps)).resolves.toEqual({
      status: "created",
      userId: "admin-1",
    });
    expect(deps.findUserByWhatsapp).toHaveBeenCalledWith("6281234567890");
    expect(deps.hash).toHaveBeenCalledWith("strong-password");
    expect(deps.createUser).toHaveBeenCalledWith({
      name: "Super Admin Sungairujing",
      whatsappNumber: "6281234567890",
      passwordHash: "$argon2id$secure-hash",
      globalRole: GlobalUserRole.SUPER_ADMIN,
    });
  });

  it("rejects an invalid WhatsApp number", async () => {
    await expect(
      bootstrapSuperAdmin(
        { ...environment, SEED_ADMIN_WHATSAPP: "invalid" },
        dependencies(),
      ),
    ).rejects.toThrow("SEED_ADMIN_WHATSAPP tidak valid.");
  });

  it("rejects a password shorter than the application minimum", async () => {
    await expect(
      bootstrapSuperAdmin(
        { ...environment, SEED_ADMIN_PASSWORD: "short" },
        dependencies(),
      ),
    ).rejects.toThrow("SEED_ADMIN_PASSWORD minimal 8 karakter.");
  });

  it("is a no-op for the same existing SUPER_ADMIN", async () => {
    const deps = dependencies({
      findUserByWhatsapp: vi.fn().mockResolvedValue({
        id: "admin-1",
        globalRole: GlobalUserRole.SUPER_ADMIN,
      }),
    });

    await expect(bootstrapSuperAdmin(environment, deps)).resolves.toEqual({
      status: "already-exists",
      userId: "admin-1",
    });
    expect(deps.hash).not.toHaveBeenCalled();
    expect(deps.createUser).not.toHaveBeenCalled();
  });

  it("refuses to promote an existing non-SUPER_ADMIN user", async () => {
    const deps = dependencies({
      findUserByWhatsapp: vi.fn().mockResolvedValue({
        id: "merchant-admin-1",
        globalRole: GlobalUserRole.USER,
      }),
    });

    await expect(bootstrapSuperAdmin(environment, deps)).rejects.toEqual(
      expect.objectContaining({
        name: SuperAdminBootstrapError.name,
        message: expect.stringContaining("promosi otomatis ditolak"),
      }),
    );
    expect(deps.hash).not.toHaveBeenCalled();
    expect(deps.createUser).not.toHaveBeenCalled();
  });

  it("has no repository capability for merchant or demo writes", () => {
    const deps = dependencies();

    expect(Object.keys(deps).sort()).toEqual(
      ["createUser", "findUserByWhatsapp", "hash"].sort(),
    );
  });
});
