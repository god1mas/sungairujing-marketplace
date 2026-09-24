import type { Metadata } from "next";
import type { ReactNode } from "react";
import { guardMerchantDashboard } from "@/lib/auth/route-guard";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await guardMerchantDashboard();
  return children;
}
