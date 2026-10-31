import {
  BadgeCheck,
  Flag,
  ImageIcon,
  LayoutDashboard,
  Shapes,
  Star,
  Store,
  type LucideIcon,
} from "lucide-react";

export type AdminNavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const adminNavigation: AdminNavigationItem[] = [
  {
    href: "/admin",
    label: "Ringkasan",
    description: "Pantau kondisi marketplace",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/merchants",
    label: "Merchant",
    description: "Kelola profil dan status merchant",
    icon: Store,
  },
  {
    href: "/admin/verifications",
    label: "Verifikasi merchant",
    description: "Tinjau bukti usaha merchant",
    icon: BadgeCheck,
  },
  {
    href: "/admin/reports",
    label: "Laporan publik",
    description: "Tinjau laporan dari pengunjung",
    icon: Flag,
  },
  {
    href: "/admin/categories",
    label: "Kategori",
    description: "Atur kategori produk global",
    icon: Shapes,
  },
  {
    href: "/admin/banners",
    label: "Banner",
    description: "Kelola banner marketplace",
    icon: ImageIcon,
  },
  {
    href: "/admin/featured-merchants",
    label: "Merchant pilihan",
    description: "Atur merchant unggulan",
    icon: Star,
  },
];

export const isAdminNavigationActive = (pathname: string, href: string) =>
  href === "/admin"
    ? pathname === href
    : pathname.startsWith(`${href}/`) || pathname === href;

export const getAdminPageLabel = (pathname: string) => {
  if (pathname.startsWith("/admin/account")) return "Pengaturan akun";

  return (
    adminNavigation.find((item) => isAdminNavigationActive(pathname, item.href))
      ?.label ?? "Panel admin"
  );
};
