import Link from "next/link";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { getOverview } from "@/services/admin-content-service";
export default async function AdminPage() {
  const metrics = await getOverview();
  const links = [
    ["Merchant", "/admin/merchants"],
    ["Verifikasi merchant", "/admin/verifications"],
    ["Laporan publik", "/admin/reports"],
    ["Kategori", "/admin/categories"],
    ["Banner", "/admin/banners"],
    ["Merchant pilihan", "/admin/featured-merchants"],
  ];
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <p className="font-semibold text-brand-700">Area administrasi</p>
        <h1 className="mt-2 text-3xl font-bold">Super Admin</h1>
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.entries({
            "Total merchant": metrics.totalMerchants,
            "Merchant aktif": metrics.activeMerchants,
            "Merchant dibekukan": metrics.suspendedMerchants,
            "Total produk": metrics.totalProducts,
            "Produk dibekukan": metrics.suspendedProducts,
            "Total kategori": metrics.totalCategories,
          }).map(([k, v]) => (
            <div key={k} className="rounded-lg border bg-white p-4">
              <dt className="text-sm text-neutral-600">{k}</dt>
              <dd className="text-2xl font-bold">{v}</dd>
            </div>
          ))}
        </dl>
        <nav
          aria-label="Administrasi konten"
          className="mt-6 flex flex-wrap gap-3"
        >
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="min-h-11 rounded-md border border-brand-700 px-4 py-2 font-semibold text-brand-700"
            >
              {label}
            </Link>
          ))}
          <LogoutButton />
        </nav>
      </div>
    </main>
  );
}
