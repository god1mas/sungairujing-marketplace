import Link from "next/link";
import {
  LogIn,
  Menu,
  PackageSearch,
  Search,
  ShoppingBasket,
  Store,
} from "lucide-react";
import { BrandLogo } from "@/components/branding/brand-logo";

const navigation = [
  { href: "/products", label: "Produk", icon: PackageSearch },
  { href: "/merchants", label: "Merchant", icon: Store },
] as const;

export function SiteHeader({
  accountHref,
  accountLabel,
}: {
  accountHref: string;
  accountLabel: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white shadow-sm">
      <div aria-hidden="true" className="flex h-1">
        <span className="w-3/5 bg-brand-600" />
        <span className="w-1/5 bg-accent-yellow" />
        <span className="w-1/5 bg-accent-orange" />
      </div>
      <div className="mx-auto flex min-h-20 max-w-(--container-app) items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Beranda UMKM DESA SUNGAIRUJING"
          className="mr-auto inline-flex min-h-11 shrink-0 items-center rounded-md focus-visible:outline-brand-700"
        >
          <BrandLogo
            className="h-14 w-auto sm:h-16"
            preload
            sizes="(max-width: 640px) 76px, 86px"
          />
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-1 md:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-neutral-700 hover:bg-brand-50 hover:text-brand-700"
            >
              <item.icon aria-hidden="true" className="size-4" />
              {item.label}
            </Link>
          ))}
          <Link
            href="/cart"
            className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-neutral-700 hover:bg-brand-50 hover:text-brand-700"
          >
            <ShoppingBasket aria-hidden="true" className="size-4" />
            Keranjang
          </Link>
          <Link
            href={accountHref}
            className="ml-2 inline-flex min-h-11 items-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            <LogIn aria-hidden="true" className="size-4" />
            {accountLabel}
          </Link>
        </nav>

        <Link
          href="/#search"
          aria-label="Cari"
          className="inline-flex size-11 items-center justify-center rounded-md text-brand-700 hover:bg-brand-50 md:hidden"
        >
          <Search aria-hidden="true" className="size-5" />
        </Link>
        <Link
          href="/cart"
          aria-label="Keranjang"
          className="inline-flex size-11 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 md:hidden"
        >
          <ShoppingBasket aria-hidden="true" className="size-5" />
        </Link>

        <details className="group relative md:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md border border-neutral-300 px-3 text-sm font-semibold text-neutral-800 hover:border-brand-200 hover:bg-brand-50">
            <Menu aria-hidden="true" className="size-4" />
            Menu
          </summary>
          <nav
            aria-label="Navigasi seluler"
            className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-neutral-200 bg-white p-2 shadow-md"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                <item.icon aria-hidden="true" className="mr-2 size-4" />
                {item.label}
              </Link>
            ))}
            <Link
              href="/cart"
              className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              <ShoppingBasket aria-hidden="true" className="mr-2 size-4" />
              Keranjang
            </Link>
            <Link
              href={accountHref}
              className="mt-1 flex min-h-11 items-center rounded-md bg-brand-600 px-3 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <LogIn aria-hidden="true" className="mr-2 size-4" />
              {accountLabel}
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
