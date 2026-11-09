import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin } from "lucide-react";
import type { PublicMerchantSummary } from "@/services/public-merchant-service";
import { MerchantLogo } from "./merchant-logo";
import { MerchantStatus } from "./merchant-status";

export function MerchantCard({
  merchant,
}: {
  merchant: PublicMerchantSummary;
}) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-brand-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand-500 via-yellow-400 to-orange-400"
      />
      <div className="flex items-start gap-4">
        <MerchantLogo merchant={merchant} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="line-clamp-2 break-words text-lg font-bold text-neutral-900">
              <Link
                href={`/merchant/${merchant.slug}`}
                className="transition-colors hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                {merchant.name}
              </Link>
            </h2>
            {merchant.isVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-success-border bg-success-bg px-2 py-1 text-xs font-semibold text-success-text">
                <BadgeCheck aria-hidden="true" className="size-3.5" />
                Terverifikasi
              </span>
            ) : null}
          </div>
          <div className="mt-2">
            <MerchantStatus status={merchant.operationalStatus} />
          </div>
        </div>
      </div>
      {merchant.description ? (
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-neutral-600">
          {merchant.description}
        </p>
      ) : null}
      <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-neutral-600">
        <MapPin
          aria-hidden="true"
          className="mt-1 size-4 shrink-0 text-orange-500"
        />
        <span className="line-clamp-2 break-words">{merchant.address}</span>
      </p>
      <Link
        href={`/merchant/${merchant.slug}`}
        className="mt-auto inline-flex min-h-11 items-center gap-2 pt-4 font-semibold text-brand-700 transition-colors hover:text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        Lihat merchant
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </article>
  );
}
