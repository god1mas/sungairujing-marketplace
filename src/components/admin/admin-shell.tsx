"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Settings, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BrandLogo } from "@/components/branding/brand-logo";
import { LogoutButton } from "@/features/auth/components/logout-button";
import {
  adminNavigation,
  getAdminPageLabel,
  isAdminNavigationActive,
} from "./admin-navigation";

function AdminSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-col bg-brand-800 text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <Link
          href="/admin"
          onClick={onNavigate}
          aria-label="Panel Admin UMKM DESA SUNGAIRUJING"
          className="flex min-h-14 items-center rounded-lg bg-white p-1.5 focus-visible:outline-white"
        >
          <BrandLogo className="h-14 w-auto" sizes="76px" />
        </Link>
      </div>

      <div className="flex-1 px-3 py-6">
        <p className="px-3 text-xs font-bold tracking-[0.16em] text-brand-200 uppercase">
          Panel admin
        </p>
        <nav aria-label="Navigasi Super Admin" className="mt-3 space-y-1">
          {adminNavigation.map((item) => {
            const active = isAdminNavigationActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-white ${
                  active
                    ? "bg-white/14 text-white"
                    : "text-brand-50 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon aria-hidden="true" className="size-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/admin/account"
          onClick={onNavigate}
          aria-current={
            pathname.startsWith("/admin/account") ? "page" : undefined
          }
          className={`flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-white ${
            pathname.startsWith("/admin/account")
              ? "bg-white/14 text-white"
              : "text-brand-50 hover:bg-white/8"
          }`}
        >
          <Settings aria-hidden="true" className="size-5" />
          Pengaturan akun
        </Link>
        <div className="mt-2 [&_button]:w-full [&_button]:border-white/20 [&_button]:bg-transparent [&_button]:text-white [&_button]:hover:bg-white/8">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!drawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        menuButtonRef.current?.focus();
      }

      if (event.key === "Tab") {
        const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-66 lg:block">
        <AdminSidebarContent />
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu admin"
            className="absolute inset-0 bg-neutral-900/55"
            onClick={() => {
              setDrawerOpen(false);
              menuButtonRef.current?.focus();
            }}
          />
          <aside
            ref={drawerRef}
            id="admin-mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Menu Super Admin"
            className="relative h-full w-[min(19rem,86vw)] shadow-md"
          >
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Tutup menu admin"
              onClick={() => {
                setDrawerOpen(false);
                menuButtonRef.current?.focus();
              }}
              className="absolute top-4 right-3 z-10 flex size-11 items-center justify-center rounded-md text-white hover:bg-white/10"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
            <AdminSidebarContent onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="min-w-0 lg:pl-66">
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
          <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              ref={menuButtonRef}
              type="button"
              aria-label="Buka menu admin"
              aria-expanded={drawerOpen}
              aria-controls="admin-mobile-navigation"
              onClick={() => setDrawerOpen(true)}
              className="flex size-11 shrink-0 items-center justify-center rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-100 lg:hidden"
            >
              <Menu aria-hidden="true" className="size-5" />
            </button>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                Super Admin
              </p>
              <p className="truncate font-bold text-brand-800">
                {getAdminPageLabel(pathname)}
              </p>
            </div>

            <Link
              href="/admin/account"
              className="ml-auto flex min-h-11 items-center gap-2 rounded-md px-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 sm:px-3"
            >
              <span className="hidden sm:inline">Akun admin</span>
              <span className="flex size-8 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <ShieldCheck aria-hidden="true" className="size-4" />
              </span>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[96rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
