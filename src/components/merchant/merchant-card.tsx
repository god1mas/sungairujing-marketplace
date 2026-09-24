import Link from "next/link";
import type { PublicMerchantSummary } from "@/services/public-merchant-service";
import { MerchantLogo } from "./merchant-logo";
import { MerchantStatus } from "./merchant-status";

export function MerchantCard({
  merchant,
}: {
  merchant: PublicMerchantSummary;
}) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <MerchantLogo merchant={merchant} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-neutral-900">
              <Link
                href={`/merchant/${merchant.slug}`}
                className="hover:text-brand-700"
              >
                {merchant.name}
              </Link>
            </h2>
            {merchant.isVerified ? (
              <span className="rounded-sm border border-success-border bg-success-bg px-2 py-1 text-xs font-semibold text-success-text">
                ✓ Terverifikasi
              </span>
            ) : null}
          </div>
          <div className="mt-2">
            <MerchantStatus status={merchant.operationalStatus} />
          </div>
        </div>
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-neutral-600">
        {merchant.description ?? merchant.address}
      </p>
      <Link
        href={`/merchant/${merchant.slug}`}
        className="mt-4 inline-flex min-h-11 items-center font-semibold text-brand-700 hover:text-brand-800"
      >
        Lihat merchant
      </Link>
    </article>
  );
}
