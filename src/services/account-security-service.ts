import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/features/auth/schemas/change-password";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  findAccountPasswordById,
  replaceAccountPasswordHash,
  type AccountPasswordRecord,
} from "@/repositories/account-security-repository";

export type ChangePasswordResult =
  | { success: true }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<Record<keyof ChangePasswordInput, string[]>>;
    };

type AccountPasswordReader = (
  userId: string,
) => Promise<AccountPasswordRecord | null>;
type AccountPasswordWriter = (input: {
  userId: string;
  expectedPasswordHash: string;
  newPasswordHash: string;
  changedAt: Date;
}) => Promise<boolean>;

export const changePassword = async (
  authenticatedUserId: string,
  input: ChangePasswordInput,
  dependencies: {
    findAccount?: AccountPasswordReader;
    replacePassword?: AccountPasswordWriter;
    verify?: typeof verifyPassword;
    hash?: typeof hashPassword;
    now?: () => Date;
  } = {},
): Promise<ChangePasswordResult> => {
  const validation = changePasswordSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: "Periksa kembali data password.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const findAccount = dependencies.findAccount ?? findAccountPasswordById;
  const replacePassword =
    dependencies.replacePassword ?? replaceAccountPasswordHash;

  try {
    const account = await findAccount(authenticatedUserId);
    if (!account) {
      return {
        success: false,
        message: "Password tidak dapat diperbarui. Silakan login kembali.",
      };
    }

    const currentPasswordIsValid = await (
      dependencies.verify ?? verifyPassword
    )(account.passwordHash, validation.data.currentPassword);
    if (!currentPasswordIsValid) {
      return {
        success: false,
        message: "Password lama tidak sesuai.",
        fieldErrors: {
          currentPassword: ["Password lama tidak sesuai."],
        },
      };
    }

    const newPasswordHash = await (dependencies.hash ?? hashPassword)(
      validation.data.newPassword,
    );
    const updated = await replacePassword({
      userId: authenticatedUserId,
      expectedPasswordHash: account.passwordHash,
      newPasswordHash,
      changedAt: (dependencies.now ?? (() => new Date()))(),
    });

    return updated
      ? { success: true }
      : {
          success: false,
          message: "Password tidak dapat diperbarui. Silakan login kembali.",
        };
  } catch {
    return {
      success: false,
      message: "Password belum berhasil diperbarui. Silakan coba lagi.",
    };
  }
};
