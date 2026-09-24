import { hashPassword } from "@/lib/auth/password";
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
    return {
      success: false,
      message: "Periksa kembali data registrasi.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const persist = dependencies.persist ?? createMerchantRegistration;
  const hash = dependencies.hash ?? hashPassword;

  try {
    const passwordHash = await hash(validation.data.password);
    const registration = await persist({
      ownerName: validation.data.ownerName,
      merchantName: validation.data.merchantName,
      merchantSlugBase: createSlug(validation.data.merchantName),
      whatsappNumber: validation.data.whatsappNumber,
      passwordHash,
      merchantAddress: validation.data.merchantAddress,
      termsAcceptedAt: (dependencies.now ?? (() => new Date()))(),
    });

    return { success: true, registration };
  } catch (error) {
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
