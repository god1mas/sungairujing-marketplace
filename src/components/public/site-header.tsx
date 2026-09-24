import Link from "next/link";

const navigation = [
  { href: "/products", label: "Produk" },
  { href: "/merchants", label: "Merchant" },
] as const;

export function SiteHeader({
  accountHref,
  accountLabel,
}: {
  accountHref: string;
  accountLabel: string;
}) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-(--container-app) items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mr-auto inline-flex min-h-11 items-center text-base font-bold tracking-tight text-brand-800 sm:text-lg"
        >
          Sungairujing<span className="hidden sm:inline"> Marketplace</span>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-1 md:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-brand-700"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/cart"
            className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-brand-700"
          >
            Keranjang
          </Link>
          <Link
            href={accountHref}
            className="ml-2 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {accountLabel}
          </Link>
        </nav>

        <Link
          href="/#search"
          aria-label="Cari"
          className="inline-flex size-11 items-center justify-center rounded-md text-brand-700 hover:bg-brand-50 md:hidden"
        >
          <svg
            aria-hidden="true"
            className="size-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="m16 16 4 4" stroke="currentColor" strokeWidth="2" />
          </svg>
        </Link>
        <Link
          href="/cart"
          aria-label="Keranjang"
          className="inline-flex size-11 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 md:hidden"
        >
          <svg
            aria-hidden="true"
            className="size-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M3 4h2l2.2 10h9.6l2-7H6M9 19h.01M17 19h.01"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </Link>

        <details className="group relative md:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-md border border-neutral-300 px-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-100">
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
                {item.label}
              </Link>
            ))}
            <Link
              href="/cart"
              className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Keranjang
            </Link>
            <Link
              href={accountHref}
              className="mt-1 flex min-h-11 items-center rounded-md bg-brand-600 px-3 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {accountLabel}
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
