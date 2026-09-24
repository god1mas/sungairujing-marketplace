import type { Metadata } from "next";
import { MerchantProfileForm } from "@/components/dashboard/merchant-profile-form";
import { getMerchantProfile } from "@/services/merchant-profile-service";
import { getMerchantDashboardAccess } from "@/services/merchant-dashboard-access-service";

export const metadata: Metadata = { title: "Profil Merchant" };

export default async function MerchantProfilePage() {
  const [profile, access] = await Promise.all([
    getMerchantProfile(),
    getMerchantDashboardAccess(),
  ]);
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold text-brand-700">Profil merchant</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Kelola Profil
        </h1>
        <p className="mt-3 text-neutral-600">
          Informasi ini digunakan pada halaman publik merchant.
        </p>
        <MerchantProfileForm profile={profile} readOnly={access.readOnly} />
      </div>
    </main>
  );
}
