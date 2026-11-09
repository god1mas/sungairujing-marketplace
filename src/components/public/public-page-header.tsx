import type { LucideIcon } from "lucide-react";

export function PublicPageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
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
      <div className="relative mx-auto max-w-(--container-app) px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="flex max-w-3xl items-start gap-3 sm:gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700 shadow-sm sm:size-12">
            <Icon aria-hidden="true" className="size-5 sm:size-6" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-[0.14em] text-brand-700 uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight break-words text-neutral-900 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base sm:leading-7">
              {description}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
