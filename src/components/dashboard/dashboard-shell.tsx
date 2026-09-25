import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { SuspensionBanner } from "./suspension-banner";

const navigation = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/products", label: "Produk" },
  { href: "/dashboard/profile", label: "Profil" },
  { href: "/dashboard/verification", label: "Verifikasi" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/account", label: "Pengaturan Akun" },
];

export function DashboardShell({
  children,
  suspension,
}: {
  children: ReactNode;
  suspension?: { reason: string | null };
}) {
  return (
    <div className="min-h-screen bg-neutral-50 lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-neutral-200 bg-white lg:min-h-screen lg:border-r lg:border-b-0">
        <div className="mx-auto flex max-w-app items-center justify-between gap-4 px-4 py-4 lg:block lg:px-6 lg:py-8">
          <Link href="/dashboard" className="text-lg font-bold text-brand-700">
            Sungairujing
            <span className="block text-xs font-semibold tracking-wide text-neutral-500 uppercase">
              Dashboard Merchant
            </span>
          </Link>
          <div className="lg:mt-8">
            <LogoutButton />
          </div>
        </div>
        <nav
          aria-label="Navigasi dashboard merchant"
          className="overflow-x-auto px-4 pb-4 lg:px-6"
        >
          <ul className="flex min-w-max gap-2 lg:min-w-0 lg:flex-col">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center rounded-md px-3 py-2 font-semibold text-neutral-700 hover:bg-brand-50 hover:text-brand-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="border-b border-neutral-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-neutral-600">
            Area pengelolaan merchant
          </p>
        </header>
        {suspension ? <SuspensionBanner reason={suspension.reason} /> : null}
        {children}
      </div>
    </div>
  );
}
