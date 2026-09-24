import "server-only";

import { MerchantOperationalStatus } from "@prisma/client";
import {
  ForbiddenError,
  requireActiveMerchantForMutation,
  requireMerchantAdmin,
} from "@/lib/auth/authorization";
import { persistWithStorageCompensation } from "@/lib/storage/cleanup";
import { uploadMerchantLogo } from "@/lib/storage/public-media";
import { createSupabaseStorage } from "@/lib/storage/supabase";
import {
  openingHoursSchema,
  type MerchantProfileInput,
  type OpeningHours,
} from "@/features/merchant-profile/profile-schema";
import {
  findOwnedMerchantProfile,
  replaceOwnedMerchantLogo,
  updateOwnedMerchantProfile,
} from "@/repositories/merchant-profile-repository";
import { resolvePublicImageUrl } from "./public-catalog-service";

export class MerchantProfileNotFoundError extends Error {}

type Membership = Awaited<ReturnType<typeof requireMerchantAdmin>>;
const authorizeMutation = async (): Promise<Membership> => {
  const membership = await requireMerchantAdmin();
  await requireActiveMerchantForMutation(membership.merchantId);
  return membership;
};

const defaults = {
  authorizeRead: requireMerchantAdmin,
  authorizeMutation,
  findProfile: findOwnedMerchantProfile,
  updateProfile: updateOwnedMerchantProfile,
  replaceLogo: replaceOwnedMerchantLogo,
  createStorage: createSupabaseStorage,
  resolveImageUrl: resolvePublicImageUrl,
};

export type MerchantProfileDependencies = Partial<typeof defaults>;
const dependencies = (overrides: MerchantProfileDependencies) => ({
  ...defaults,
  ...overrides,
});

const emptyOpeningHours = (): OpeningHours => ({
  senin: { closed: true },
  selasa: { closed: true },
  rabu: { closed: true },
  kamis: { closed: true },
  jumat: { closed: true },
  sabtu: { closed: true },
  minggu: { closed: true },
});

export const getMerchantProfile = async (
  overrides: MerchantProfileDependencies = {},
) => {
  const deps = dependencies(overrides);
  const membership = await deps.authorizeRead();
  const profile = await deps.findProfile(
    membership.merchantId,
    membership.userId,
  );
  if (!profile) throw new MerchantProfileNotFoundError();
  const hours = openingHoursSchema.safeParse(profile.openingHours);
  const { memberships, status: _status, ...publicProfile } = profile;
  void _status;
  return {
    ...publicProfile,
    loginWhatsappNumber:
      memberships[0]?.user.whatsappNumber ?? profile.publicWhatsappNumber,
    openingHours: hours.success ? hours.data : emptyOpeningHours(),
    logoUrl: profile.logoStorageKey
      ? deps.resolveImageUrl(profile.logoStorageKey)
      : null,
  };
};

export const updateMerchantProfile = async (
  input: MerchantProfileInput,
  overrides: MerchantProfileDependencies = {},
) => {
  const deps = dependencies(overrides);
  const membership = await deps.authorizeMutation();
  const result = await deps.updateProfile(membership.merchantId, {
    ...input,
    operationalStatus: input.operationalStatus as MerchantOperationalStatus,
  });
  if (result.count !== 1) throw new MerchantProfileNotFoundError();
};

export const replaceMerchantLogo = async (
  file: File,
  overrides: MerchantProfileDependencies = {},
) => {
  const deps = dependencies(overrides);
  const membership = await deps.authorizeMutation();
  const storage = deps.createStorage();
  const uploaded = await uploadMerchantLogo({
    merchantId: membership.merchantId,
    image: { data: await file.arrayBuffer(), mimeType: file.type },
    storage,
  });
  const result = await persistWithStorageCompensation({
    references: [uploaded.reference],
    storage,
    persist: async () => {
      const replaced = await deps.replaceLogo(
        membership.merchantId,
        uploaded.reference.path,
      );
      if (!replaced) throw new MerchantProfileNotFoundError();
      return replaced;
    },
  });
  let previousCleanupComplete = true;
  if (result.previousStorageKey) {
    try {
      await storage.remove({
        bucket: "publicMedia",
        path: result.previousStorageKey,
      });
    } catch {
      previousCleanupComplete = false;
    }
  }
  return { previousCleanupComplete };
};

export const isMerchantProfilePermissionError = (error: unknown) =>
  error instanceof ForbiddenError ||
  error instanceof MerchantProfileNotFoundError;
