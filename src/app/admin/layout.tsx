import type { Metadata } from "next";
import type { ReactNode } from "react";
import { guardAdminArea } from "@/lib/auth/route-guard";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await guardAdminArea();
  return children;
}
