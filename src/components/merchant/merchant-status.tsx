import type { PublicMerchantSummary } from "@/services/public-merchant-service";

const statusPresentation = {
  BUKA: {
    label: "Buka",
    className: "border-success-border bg-success-bg text-success-text",
  },
  TUTUP: {
    label: "Tutup",
    className: "border-neutral-300 bg-neutral-100 text-neutral-700",
  },
  LIBUR_SEMENTARA: {
    label: "Libur sementara",
    className: "border-warning-border bg-warning-bg text-warning-text",
  },
} satisfies Record<
  PublicMerchantSummary["operationalStatus"],
  { label: string; className: string }
>;

export function MerchantStatus({
  status,
}: {
  status: PublicMerchantSummary["operationalStatus"];
}) {
  const presentation = statusPresentation[status];
  return (
    <span
      className={`inline-flex rounded-sm border px-2.5 py-1 text-xs font-semibold ${presentation.className}`}
    >
      {presentation.label}
    </span>
  );
}
