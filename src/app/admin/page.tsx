import Link from "next/link";
import {
  BadgeCheck,
  Ban,
  Boxes,
  Flag,
  ImageIcon,
  Package,
  Shapes,
  Star,
  Store,
  UserCheck,
  Users,
} from "lucide-react";
import { adminNavigation } from "@/components/admin/admin-navigation";
import { MetricCard } from "@/components/admin/metric-card";
import { PageHeader } from "@/components/admin/page-header";
import { getOverview } from "@/services/admin-content-service";

export default async function AdminPage() {
  const metrics = await getOverview();
  const metricItems = [
    {
      label: "Total merchant",
      value: metrics.totalMerchants,
      icon: Users,
      tone: "brand" as const,
    },
    {
      label: "Merchant aktif",
      value: metrics.activeMerchants,
      icon: UserCheck,
      tone: "success" as const,
    },
    {
      label: "Merchant dibekukan",
      value: metrics.suspendedMerchants,
      icon: Ban,
      tone: "error" as const,
    },
    {
      label: "Total produk",
      value: metrics.totalProducts,
      icon: Package,
      tone: "brand" as const,
    },
    {
      label: "Produk dibekukan",
      value: metrics.suspendedProducts,
      icon: Boxes,
      tone: "warning" as const,
    },
    {
      label: "Total kategori",
      value: metrics.totalCategories,
      icon: Shapes,
      tone: "neutral" as const,
    },
  ];
  const quickLinks = adminNavigation.filter((item) => item.href !== "/admin");
  const supportingIcons = {
    "/admin/merchants": Store,
    "/admin/verifications": BadgeCheck,
    "/admin/reports": Flag,
    "/admin/categories": Shapes,
    "/admin/banners": ImageIcon,
    "/admin/featured-merchants": Star,
  } as const;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Panel admin"
        title="Ringkasan marketplace"
        description="Pantau kondisi merchant, produk, dan konten marketplace dari satu ruang kerja."
      />

      <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-6">
        {metricItems.map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </dl>

      <section
        aria-labelledby="quick-navigation-title"
        className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <p className="text-xs font-bold tracking-[0.14em] text-brand-700 uppercase">
          Akses cepat
        </p>
        <h2
          id="quick-navigation-title"
          className="mt-1 text-xl font-bold text-neutral-900"
        >
          Kelola marketplace
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Pilih area administrasi yang ingin ditinjau.
        </p>
        <nav
          aria-label="Akses cepat administrasi"
          className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          {quickLinks.map((item) => {
            const Icon =
              supportingIcons[item.href as keyof typeof supportingIcons];
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex min-h-20 items-center gap-3 rounded-md border border-neutral-200 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700 group-hover:bg-white">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span>
                  <span className="block font-bold text-neutral-900">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-neutral-600">
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
      </section>
    </div>
  );
}
