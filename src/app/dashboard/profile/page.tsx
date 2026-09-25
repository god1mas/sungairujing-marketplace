import type { Metadata } from "next";
import { MerchantProfileForm } from "@/components/dashboard/merchant-profile-form";
import { getMerchantProfile } from "@/services/merchant-profile-service";
import { getMerchantDashboardAccess } from "@/services/merchant-dashboard-access-service";
import { MerchantQr } from "@/components/merchant/merchant-qr";
import { createMerchantQr } from "@/services/merchant-qr-service";

export const metadata: Metadata = { title: "Profil Merchant" };

export default async function MerchantProfilePage() {
  const [profile, access] = await Promise.all([
    getMerchantProfile(),
    getMerchantDashboardAccess(),
  ]);
  const qr = await createMerchantQr(profile.slug);
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
        <section
          aria-labelledby="profile-qr-title"
          className="mt-8 rounded-lg border border-neutral-200 bg-white p-6"
        >
          <h2 id="profile-qr-title" className="text-xl font-bold">
            QR Merchant
          </h2>
          <p className="mt-2 text-neutral-600">
            QR ini hanya berisi alamat canonical halaman publik merchant. Jika
            merchant ditangguhkan, halaman tujuan tetap tidak tersedia untuk
            publik.
          </p>
          <MerchantQr merchantName={profile.name} qr={qr} />
        </section>
      </div>
    </main>
  );
}
