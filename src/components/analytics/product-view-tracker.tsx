"use client";

import { useEffect } from "react";

export function ProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    void fetch("/api/analytics/product-view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId }),
      keepalive: true,
    }).catch(() => undefined);
  }, [productId]);
  return null;
}
