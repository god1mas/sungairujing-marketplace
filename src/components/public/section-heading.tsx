import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

const toneClasses = {
  brand: "bg-brand-100 text-brand-800",
  yellow: "bg-accent-yellow/25 text-brand-900",
  orange: "bg-accent-orange/25 text-brand-900",
} as const;

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  icon: Icon,
  tone = "brand",
  action,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  tone?: keyof typeof toneClasses;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-[0.14em] text-brand-700 uppercase">
            {eyebrow}
          </p>
          <h2
            id={id}
            className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
