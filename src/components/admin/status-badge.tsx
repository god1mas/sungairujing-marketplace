const variants = {
  success: "border-success-border bg-success-bg text-success-text",
  warning: "border-warning-border bg-warning-bg text-warning-text",
  error: "border-error-border bg-error-bg text-error-text",
  info: "border-info-border bg-info-bg text-info-text",
  neutral: "border-neutral-200 bg-neutral-100 text-neutral-700",
} as const;

const statusVariant = (status: string): keyof typeof variants => {
  if (
    ["ACTIVE", "TERVERIFIKASI", "APPROVED", "SELESAI", "BUKA"].includes(status)
  )
    return "success";
  if (["PENDING", "BARU", "DITINJAU", "BELUM_DIVERIFIKASI"].includes(status))
    return "warning";
  if (["SUSPENDED", "REJECTED", "DITOLAK"].includes(status)) return "error";
  if (["LIBUR_SEMENTARA"].includes(status)) return "info";
  return "neutral";
};

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-xs font-bold ${variants[statusVariant(status)]}`}
    >
      {label ?? status.replaceAll("_", " ")}
    </span>
  );
}
