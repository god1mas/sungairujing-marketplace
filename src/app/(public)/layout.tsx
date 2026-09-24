import type { ReactNode } from "react";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { getAuthenticatedSession } from "@/lib/auth/session";

export default async function PublicLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await getAuthenticatedSession();
  const isAuthenticated = Boolean(session?.user.id);
  const isSuperAdmin = session?.user.globalRole === "SUPER_ADMIN";

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-white px-4 py-3 text-brand-800 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Lewati ke konten utama
      </a>
      <SiteHeader
        accountHref={
          isAuthenticated ? (isSuperAdmin ? "/admin" : "/dashboard") : "/login"
        }
        accountLabel={isAuthenticated ? "Dashboard" : "Masuk"}
      />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
