import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth/authorization";
import { normalizeWhatsAppNumber } from "@/lib/auth/whatsapp";
import { createSlug } from "@/lib/slug";
import { createSupabaseStorage } from "@/lib/storage/supabase";
import { uploadBannerImage } from "@/lib/storage/public-media";
import {
  bannerSchema,
  categorySchema,
  featuredSchema,
  merchantAdminSchema,
} from "@/features/admin-content/schemas";
import * as repo from "@/repositories/admin-content-repository";
export class AdminContentConflictError extends Error {}
const authorize = requireSuperAdmin;
export const getOverview = async () => {
  await authorize();
  const [
    totalMerchants,
    activeMerchants,
    suspendedMerchants,
    totalProducts,
    suspendedProducts,
    totalCategories,
  ] = await repo.getAdminOverview();
  return {
    totalMerchants,
    activeMerchants,
    suspendedMerchants,
    totalProducts,
    suspendedProducts,
    totalCategories,
  };
};
export const getMerchants = async () => {
  await authorize();
  return repo.listAdminMerchants();
};
export const getMerchant = async (id: string) => {
  await authorize();
  if (!z.uuid().safeParse(id).success) return null;
  return repo.findAdminMerchant(id);
};
export const updateMerchant = async (id: string, raw: unknown) => {
  await authorize();
  const parsed = merchantAdminSchema.parse(raw);
  const result = await repo.updateAdminMerchant({
    id,
    ...parsed,
    whatsapp: normalizeWhatsAppNumber(parsed.whatsapp),
  });
  if (result !== "UPDATED") throw new AdminContentConflictError();
  return result;
};
export const deleteMerchant = async (id: string, confirmation: string) => {
  const actor = await authorize();
  const merchant = await repo.findAdminMerchant(id);
  if (!merchant || confirmation !== `HAPUS ${merchant.name}`)
    throw new AdminContentConflictError();
  const result = await repo.permanentlyDeleteMerchant({
    id,
    actorUserId: actor.id,
  });
  if (!result) throw new AdminContentConflictError();
  const storage = createSupabaseStorage();
  await Promise.allSettled(
    result.storageKeys.map((path) =>
      storage.remove({ bucket: "publicMedia", path }),
    ),
  );
  return result;
};
export const getCategories = async () => {
  await authorize();
  return repo.listCategories();
};
export const saveCategory = async (id: string | undefined, raw: unknown) => {
  await authorize();
  const data = categorySchema.parse(raw);
  return repo.saveCategory({ id, ...data, slug: createSlug(data.name) });
};
export const deleteCategory = async (id: string) => {
  await authorize();
  return repo.removeCategory(z.uuid().parse(id));
};
export const getBanners = async () => {
  await authorize();
  return repo.listBanners();
};
export const saveBanner = async (
  id: string | undefined,
  raw: unknown,
  file?: File,
) => {
  const actor = await authorize();
  const data = bannerSchema.parse(raw);
  const bannerId = id ?? randomUUID();
  const current = id ? await repo.findBanner(id) : null;
  if (!file?.size && !current) throw new AdminContentConflictError();
  const storage = createSupabaseStorage();
  let uploaded: Awaited<ReturnType<typeof uploadBannerImage>> | undefined;
  try {
    if (file?.size)
      uploaded = await uploadBannerImage({
        bannerId,
        image: { data: await file.arrayBuffer(), mimeType: file.type },
        storage,
      });
    await repo.saveBanner({
      id: bannerId,
      ...data,
      imageStorageKey: uploaded?.reference.path ?? current!.imageStorageKey,
      actorUserId: actor.id,
    });
    if (uploaded && current)
      await storage
        .remove({ bucket: "publicMedia", path: current.imageStorageKey })
        .catch(() => undefined);
    return bannerId;
  } catch (error) {
    if (uploaded)
      await storage.remove(uploaded.reference).catch(() => undefined);
    throw error;
  }
};
export const deleteBanner = async (id: string) => {
  await authorize();
  const deleted = await repo.deleteBanner(z.uuid().parse(id));
  await createSupabaseStorage()
    .remove({ bucket: "publicMedia", path: deleted.imageStorageKey })
    .catch(() => undefined);
};
export const getFeatured = async () => {
  await authorize();
  return Promise.all([repo.listFeatured(), repo.listFeaturedCandidates()]);
};
export const addFeatured = async (raw: unknown) => {
  const actor = await authorize();
  const data = featuredSchema.parse(raw);
  const result = await repo.addFeatured({ ...data, actorUserId: actor.id });
  if (!result) throw new AdminContentConflictError();
  return result;
};
export const deleteFeatured = async (id: string) => {
  await authorize();
  return repo.removeFeatured(z.uuid().parse(id));
};
export const getPublicHomepageContent = async () => {
  const [banners, featured] = await repo.findPublicContent(new Date());
  const storage = createSupabaseStorage();
  return {
    banners: banners.map((b) => ({
      ...b,
      imageUrl: storage.getPublicUrl({
        bucket: "publicMedia",
        path: b.imageStorageKey,
      }),
    })),
    featured: featured.map((f) => f.merchant),
  };
};
