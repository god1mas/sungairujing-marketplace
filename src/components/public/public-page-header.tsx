import type { LucideIcon } from "lucide-react";

export function PublicPageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  compact?: boolean;
}) {
  return (
    <header className="relative overflow-hidden border-b border-brand-100 bg-cream-50">
      <div
        aria-hidden="true"
        className="absolute -top-12 right-[8%] size-36 rounded-full bg-accent-yellow/20"
      />
      <div
        aria-hidden="true"
        className="absolute -right-14 -bottom-20 size-44 rounded-full bg-accent-orange/15"
      />
      <div
        className={`relative mx-auto max-w-(--container-app) px-4 sm:px-6 lg:px-8 ${compact ? "py-5 sm:py-7" : "py-10 sm:py-12"}`}
      >
        <div className="flex max-w-3xl items-start gap-3 sm:gap-4">
          <span
            className={`flex shrink-0 items-center justify-center rounded-lg bg-white text-brand-700 shadow-sm ${compact ? "size-9 sm:size-10" : "size-11 sm:size-12"}`}
          >
            <Icon
              aria-hidden="true"
              className={compact ? "size-4 sm:size-5" : "size-5 sm:size-6"}
            />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-[0.14em] text-brand-700 uppercase">
              {eyebrow}
            </p>
            <h1
              className={`font-bold tracking-tight break-words text-neutral-900 ${compact ? "mt-0.5 text-2xl sm:text-3xl" : "mt-1 text-3xl sm:text-4xl"}`}
            >
              {title}
            </h1>
            <p
              className={`max-w-2xl text-sm text-neutral-600 ${compact ? "mt-1 leading-5 sm:leading-6" : "mt-3 leading-6 sm:text-base sm:leading-7"}`}
            >
              {description}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
