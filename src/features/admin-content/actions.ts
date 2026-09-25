"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as service from "@/services/admin-content-service";
const raw = (fd: FormData) => Object.fromEntries(fd.entries());
const done = () => {
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
};
export async function saveCategoryAction(fd: FormData) {
  await service.saveCategory(String(fd.get("id") || "") || undefined, raw(fd));
  done();
}
export async function deleteCategoryAction(fd: FormData) {
  await service.deleteCategory(String(fd.get("id")));
  done();
}
export async function saveFeaturedAction(fd: FormData) {
  await service.addFeatured(raw(fd));
  done();
}
export async function deleteFeaturedAction(fd: FormData) {
  await service.deleteFeatured(String(fd.get("id")));
  done();
}
export async function saveBannerAction(fd: FormData) {
  await service.saveBanner(
    String(fd.get("id") || "") || undefined,
    {
      ...raw(fd),
      isActive: fd.get("isActive") === "on",
      startAt: fd.get("startAt") || undefined,
      endAt: fd.get("endAt") || undefined,
    },
    fd.get("image") instanceof File ? (fd.get("image") as File) : undefined,
  );
  done();
}
export async function deleteBannerAction(fd: FormData) {
  await service.deleteBanner(String(fd.get("id")));
  done();
}
export async function updateMerchantAction(id: string, fd: FormData) {
  await service.updateMerchant(id, raw(fd));
  done();
}
export async function deleteMerchantAction(id: string, fd: FormData) {
  await service.deleteMerchant(id, String(fd.get("confirmation")));
  done();
  redirect("/admin/merchants");
}
