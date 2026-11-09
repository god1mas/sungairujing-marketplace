import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

const toneClasses = {
  neutral: {
    panel: "border-brand-200 bg-brand-50",
    icon: "bg-white text-brand-700",
    title: "text-neutral-900",
    description: "text-neutral-600",
  },
  error: {
    panel: "border-error-border bg-error-bg",
    icon: "bg-white text-error-text",
    title: "text-error-text",
    description: "text-error-text",
  },
} as const;

export function PublicStatePanel({
  icon: Icon,
  title,
  description,
  tone = "neutral",
  role,
  action,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: keyof typeof toneClasses;
  role?: "alert" | "status";
  action?: ReactNode;
  className?: string;
}) {
  const classes = toneClasses[tone];

  return (
    <div
      role={role}
      className={`rounded-lg border p-5 sm:p-6 ${classes.panel} ${className}`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`flex size-10 shrink-0 items-center justify-center rounded-md shadow-sm ${classes.icon}`}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className={`font-bold ${classes.title}`}>{title}</h2>
          <p className={`mt-1 text-sm leading-6 ${classes.description}`}>
            {description}
          </p>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
