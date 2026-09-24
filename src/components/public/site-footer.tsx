import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto grid max-w-(--container-app) gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:px-8">
        <div>
          <p className="font-bold text-brand-800">Sungairujing Marketplace</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-neutral-600">
            Etalase digital untuk menemukan produk UMKM Desa Sungairujing dan
            terhubung langsung dengan merchant lokal.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 md:justify-self-end">
          <nav aria-label="Navigasi footer">
            <p className="text-sm font-semibold text-neutral-900">Jelajahi</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              <li>
                <Link className="hover:text-brand-700" href="/products">
                  Produk
                </Link>
              </li>
              <li>
                <Link className="hover:text-brand-700" href="/merchants">
                  Merchant
                </Link>
              </li>
            </ul>
          </nav>
          <div>
            <p className="text-sm font-semibold text-neutral-900">Informasi</p>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Desa Sungairujing
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-neutral-200 px-4 py-5 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Sungairujing Marketplace
      </div>
    </footer>
  );
}
