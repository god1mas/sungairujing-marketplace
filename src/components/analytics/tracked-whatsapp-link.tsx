"use client";

import type { ReactNode } from "react";

export function TrackedWhatsAppLink({
  href,
  source,
  productSlug,
  merchantSlug,
  className,
  children,
}: {
  href: string;
  source: "PRODUCT_DETAIL" | "MERCHANT_PROFILE" | "CHECKOUT";
  productSlug?: string;
  merchantSlug?: string;
  className?: string;
  children: ReactNode;
}) {
  const track = () => {
    void fetch("/api/analytics/whatsapp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ source, productSlug, merchantSlug }),
      keepalive: true,
    }).catch(() => undefined);
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      onClick={track}
    >
      {children}
    </a>
  );
}
