import Link from "next/link";
import { MapPin, PackageSearch, Store } from "lucide-react";
import { BrandLogo } from "@/components/branding/brand-logo";
import { BRAND_NAME } from "@/constants/branding";

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-100 bg-cream-50">
      <div className="mx-auto grid max-w-(--container-app) gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:py-12 lg:px-8">
        <div>
          <BrandLogo className="h-20 w-auto" sizes="108px" />
          <p className="mt-3 max-w-md text-sm leading-6 text-neutral-600">
            Etalase digital untuk menemukan produk UMKM Desa Sungairujing dan
            terhubung langsung dengan merchant lokal.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 md:justify-self-end">
          <nav aria-label="Navigasi footer">
            <p className="text-sm font-bold text-brand-900">Jelajahi</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              <li>
                <Link
                  className="inline-flex min-h-11 items-center gap-2 hover:text-brand-700"
                  href="/products"
                >
                  <PackageSearch aria-hidden="true" className="size-4" />
                  Produk
                </Link>
              </li>
              <li>
                <Link
                  className="inline-flex min-h-11 items-center gap-2 hover:text-brand-700"
                  href="/merchants"
                >
                  <Store aria-hidden="true" className="size-4" />
                  Merchant
                </Link>
              </li>
            </ul>
          </nav>
          <div>
            <p className="text-sm font-bold text-brand-900">Informasi</p>
            <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-neutral-600">
              <MapPin
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-brand-700"
              />
              Desa Sungairujing
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-brand-700 bg-brand-800 px-4 py-5 text-center text-xs text-brand-50">
        © {new Date().getFullYear()} {BRAND_NAME}
      </div>
    </footer>
  );
}
