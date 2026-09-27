import { GlobalUserRole } from "@prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { normalizeWhatsAppNumber } from "@/lib/auth/whatsapp";

const MINIMUM_PASSWORD_LENGTH = 8;

type BootstrapEnvironment = Partial<
  Record<"SEED_ADMIN_WHATSAPP" | "SEED_ADMIN_PASSWORD", string>
>;

type ExistingUser = {
  id: string;
  globalRole: GlobalUserRole;
};

type CreateSuperAdminInput = {
  name: string;
  whatsappNumber: string;
  passwordHash: string;
  globalRole: GlobalUserRole;
};

export type SuperAdminBootstrapDependencies = {
  findUserByWhatsapp: (whatsappNumber: string) => Promise<ExistingUser | null>;
  createUser: (input: CreateSuperAdminInput) => Promise<{ id: string }>;
  hash?: (password: string) => Promise<string>;
};

export type SuperAdminBootstrapResult =
  | { status: "created"; userId: string }
  | { status: "already-exists"; userId: string };

export class SuperAdminBootstrapError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SuperAdminBootstrapError";
  }
}

const requiredEnvironment = (
  environment: BootstrapEnvironment,
  name: keyof BootstrapEnvironment,
): string => {
  const value = environment[name]?.trim();

  if (!value) {
    throw new SuperAdminBootstrapError(`${name} wajib diisi.`);
  }

  return value;
};

export const bootstrapSuperAdmin = async (
  environment: BootstrapEnvironment,
  dependencies: SuperAdminBootstrapDependencies,
): Promise<SuperAdminBootstrapResult> => {
  const rawWhatsapp = requiredEnvironment(environment, "SEED_ADMIN_WHATSAPP");
  const password = requiredEnvironment(environment, "SEED_ADMIN_PASSWORD");

  let whatsappNumber: string;
  try {
    whatsappNumber = normalizeWhatsAppNumber(rawWhatsapp);
  } catch {
    throw new SuperAdminBootstrapError("SEED_ADMIN_WHATSAPP tidak valid.");
  }

  if (password.length < MINIMUM_PASSWORD_LENGTH) {
    throw new SuperAdminBootstrapError(
      "SEED_ADMIN_PASSWORD minimal 8 karakter.",
    );
  }

  const existingUser = await dependencies.findUserByWhatsapp(whatsappNumber);

  if (existingUser) {
    if (existingUser.globalRole !== GlobalUserRole.SUPER_ADMIN) {
      throw new SuperAdminBootstrapError(
        "Nomor WhatsApp sudah dimiliki akun non-Super Admin; promosi otomatis ditolak.",
      );
    }

    return { status: "already-exists", userId: existingUser.id };
  }

  const passwordHash = await (dependencies.hash ?? hashPassword)(password);
  const user = await dependencies.createUser({
    name: "Super Admin Sungairujing",
    whatsappNumber,
    passwordHash,
    globalRole: GlobalUserRole.SUPER_ADMIN,
  });

  return { status: "created", userId: user.id };
};
