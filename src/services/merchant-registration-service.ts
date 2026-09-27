import { hashPassword } from "@/lib/auth/password";
import { logAuthDiagnostic } from "@/lib/auth/auth-diagnostic";
import { logPrismaErrorDiagnostic } from "@/lib/db/prisma-error-diagnostic";
import { createSlug } from "@/lib/slug";
import {
  merchantRegistrationSchema,
  type MerchantRegistrationInput,
} from "@/features/auth/schemas/merchant-registration";
import {
  createMerchantRegistration,
  isWhatsappUniqueConstraintError,
  type CreateMerchantRegistrationInput,
  type MerchantRegistrationRecord,
} from "@/repositories/merchant-registration-repository";

export type RegistrationFieldErrors = Partial<
  Record<keyof MerchantRegistrationInput, string[]>
>;

export type MerchantRegistrationResult =
  | { success: true; registration: MerchantRegistrationRecord }
  | {
      success: false;
      message: string;
      fieldErrors?: RegistrationFieldErrors;
    };

type RegistrationRepository = (
  input: CreateMerchantRegistrationInput,
) => Promise<MerchantRegistrationRecord>;

type PasswordHasher = (password: string) => Promise<string>;

export const registerMerchant = async (
  input: MerchantRegistrationInput,
  dependencies: {
    persist?: RegistrationRepository;
    hash?: PasswordHasher;
    now?: () => Date;
  } = {},
): Promise<MerchantRegistrationResult> => {
  const validation = merchantRegistrationSchema.safeParse(input);

  if (!validation.success) {
    logAuthDiagnostic("registration-validation-fail");
    return {
      success: false,
      message: "Periksa kembali data registrasi.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  logAuthDiagnostic("registration-validation-pass");

  const persist = dependencies.persist ?? createMerchantRegistration;
  const hash = dependencies.hash ?? hashPassword;

  let passwordHash: string;
  logAuthDiagnostic("registration-password-hash-start");
  try {
    passwordHash = await hash(validation.data.password);
    logAuthDiagnostic("registration-password-hash-pass");
  } catch {
    logAuthDiagnostic("registration-password-hash-exception");
    return {
      success: false,
      message: "Registrasi belum berhasil. Silakan coba lagi.",
    };
  }

  logAuthDiagnostic("registration-persistence-start");
  try {
    const registration = await persist({
      ownerName: validation.data.ownerName,
      merchantName: validation.data.merchantName,
      merchantSlugBase: createSlug(validation.data.merchantName),
      whatsappNumber: validation.data.whatsappNumber,
      passwordHash,
      merchantAddress: validation.data.merchantAddress,
      termsAcceptedAt: (dependencies.now ?? (() => new Date()))(),
    });

    logAuthDiagnostic("registration-persistence-pass");
    return { success: true, registration };
  } catch (error) {
    logAuthDiagnostic("registration-persistence-exception");
    logPrismaErrorDiagnostic("registration-persistence", error);
    if (isWhatsappUniqueConstraintError(error)) {
      return {
        success: false,
        message: "Nomor WhatsApp sudah digunakan.",
        fieldErrors: {
          whatsappNumber: ["Nomor WhatsApp sudah digunakan."],
        },
      };
    }

    return {
      success: false,
      message: "Registrasi belum berhasil. Silakan coba lagi.",
    };
  }
};
