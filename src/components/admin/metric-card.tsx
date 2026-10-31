import type { LucideIcon } from "lucide-react";

const toneClasses = {
  brand: {
    accent: "border-l-brand-700",
    icon: "bg-brand-50 text-brand-700",
  },
  success: {
    accent: "border-l-success-text",
    icon: "bg-success-bg text-success-text",
  },
  warning: {
    accent: "border-l-warning-text",
    icon: "bg-warning-bg text-warning-text",
  },
  error: {
    accent: "border-l-error-text",
    icon: "bg-error-bg text-error-text",
  },
  neutral: {
    accent: "border-l-neutral-400",
    icon: "bg-neutral-100 text-neutral-700",
  },
} as const;

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: keyof typeof toneClasses;
}) {
  return (
    <div
      className={`rounded-lg border border-l-4 border-neutral-200 bg-white p-4 shadow-sm sm:p-5 ${toneClasses[tone].accent}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-wide text-neutral-500 uppercase sm:text-sm">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">
            {value}
          </p>
        </div>
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-md ${toneClasses[tone].icon}`}
        >
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </div>
    </div>
  );
}
