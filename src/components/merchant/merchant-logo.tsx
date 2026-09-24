import Image from "next/image";
import type { PublicMerchantSummary } from "@/services/public-merchant-service";

export function MerchantLogo({
  merchant,
  size = "card",
}: {
  merchant: Pick<PublicMerchantSummary, "name" | "logo">;
  size?: "card" | "detail";
}) {
  const dimensions =
    size === "detail" ? "h-24 w-24 sm:h-28 sm:w-28" : "h-16 w-16";
  const initial = merchant.name.trim().charAt(0).toUpperCase() || "M";

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-brand-50 ${dimensions}`}
    >
      {merchant.logo ? (
        <Image
          src={merchant.logo.url}
          alt={merchant.logo.alt}
          fill
          sizes={size === "detail" ? "112px" : "64px"}
          className="object-cover"
        />
      ) : (
        <div
          aria-label={`Logo ${merchant.name} belum tersedia`}
          className="flex h-full items-center justify-center text-2xl font-bold text-brand-700"
        >
          {initial}
        </div>
      )}
    </div>
  );
}
